use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AiOperation {
    pub op_type: String, // ADD_TASK, UPDATE_TASK, DELETE_TASK, MOVE_TASK, SKIP_TASK, COMPLETE_TASK, CHANGE_PRIORITY, CHANGE_DURATION, CREATE_HABIT, ADD_COMMITMENT, REPLAN_DAY
    pub title: Option<String>,
    pub task_id: Option<String>,
    pub duration_minutes: Option<i32>,
    pub priority: Option<String>,
    pub category: Option<String>,
    pub target_date: Option<String>,
    pub start_time: Option<String>,
    pub end_time: Option<String>,
    pub frequency: Option<String>,
    pub preferred_time: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AiThoughtStep {
    pub title: String,
    pub detail: String,
    pub status: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AiResponsePayload {
    pub message: String,
    pub operations: Vec<AiOperation>,
    pub thought_steps: Option<Vec<AiThoughtStep>>,
    pub suggestions: Option<Vec<String>>,
    pub is_overloaded: Option<bool>,
    pub overload_minutes: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AiRequestContext {
    pub current_time: String,
    pub current_date: String,
    pub remaining_tasks: Vec<String>,
    pub habits: Vec<String>,
    pub working_hours: String,
    pub sleep_hours: String,
    pub break_duration: i32,
    pub user_message: String,
    pub system_prompt: Option<String>,
    pub api_key: Option<String>,
    pub model: Option<String>,
}

pub async fn execute_ai_intent(context: AiRequestContext) -> Result<AiResponsePayload, String> {
    let api_key = context.api_key.clone().unwrap_or_default();
    let model = context.model.clone().unwrap_or_else(|| "anthropic/claude-3.5-haiku".to_string());

    // 1. If OpenRouter API key is configured, use OpenRouter cloud
    if !api_key.trim().is_empty() {
        if let Ok(res) = call_openrouter(&api_key, &model, &context).await {
            return Ok(res);
        }
    }

    // 2. If local Ollama daemon is running, call local Ollama (e.g. qwen3:8b)
    if let Ok(res) = call_local_ollama(&context).await {
        return Ok(res);
    }

    // 3. Deterministic step-by-step heuristic engine for offline mode
    Ok(parse_local_heuristic(&context))
}

async fn call_local_ollama(
    context: &AiRequestContext,
) -> Result<AiResponsePayload, String> {
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(25))
        .build()
        .map_err(|e| e.to_string())?;

    let default_prompt = "You are FocusFlow AI. You MUST follow the 4-step procedure: understand user intent, decompose multiple tasks into discrete individual operations with clean titles and 24h start_time, outline summary in message, and output clean JSON.";
    let system_prompt = context.system_prompt.as_deref().unwrap_or(default_prompt);
    let model = context.model.clone().unwrap_or_else(|| "qwen3:8b".to_string());

    let body = serde_json::json!({
        "model": model,
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": context.user_message }
        ],
        "format": "json",
        "stream": false,
        "options": {
            "temperature": 0.1
        }
    });

    let res = client
        .post("http://localhost:11434/api/chat")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("Ollama status error: {}", res.status()));
    }

    let json_val: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let content = json_val["message"]["content"]
        .as_str()
        .ok_or_else(|| "Invalid response format from Ollama".to_string())?;

    let parsed: AiResponsePayload =
        serde_json::from_str(content).map_err(|e| format!("Failed to parse JSON response: {}", e))?;

    Ok(parsed)
}

async fn call_openrouter(
    api_key: &str,
    model: &str,
    context: &AiRequestContext,
) -> Result<AiResponsePayload, String> {
    let client = reqwest::Client::new();

    let default_prompt = "You are FocusFlow AI, a calm, disciplined personal scheduling assistant for Daily Life OS.\n\
    MANDATORY 4-STEP PROCEDURE:\n\
    1. Understand user intent and decompose multi-task or compound clauses into individual items.\n\
    2. Determine operations: use ADD_COMMITMENT with 24h start_time for specific times, ADD_TASK for flexible tasks.\n\
    3. Outline implementation summary in message.\n\
    4. Output clean JSON only.";

    let system_prompt = context.system_prompt.as_deref().unwrap_or(default_prompt);
    let prompt = format!(
        "Context:\nDate: {}\nTime: {}\nWorking Hours: {}\nSleep Hours: {}\nRemaining Tasks: {:?}\nHabits: {:?}\n\nUser Request: \"{}\"",
        context.current_date,
        context.current_time,
        context.working_hours,
        context.sleep_hours,
        context.remaining_tasks,
        context.habits,
        context.user_message
    );

    let body = serde_json::json!({
        "model": model,
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" },
        "temperature": 0.2
    });

    let res = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("HTTP-Referer", "https://focusflow.local")
        .header("X-Title", "FocusFlow Daily OS")
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err(format!("OpenRouter API error: Status {}", res.status()));
    }

    let json_val: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let content = json_val["choices"][0]["message"]["content"]
        .as_str()
        .ok_or_else(|| "Invalid response format from OpenRouter".to_string())?;

    let parsed: AiResponsePayload =
        serde_json::from_str(content).map_err(|e| format!("Failed to parse JSON response: {}", e))?;

    Ok(parsed)
}

fn clean_task_title(raw: &str) -> String {
    let lower = raw.trim().to_lowercase();
    let mut cleaned = raw.trim();

    let prefixes = [
        "create tasks for today at time",
        "create tasks for today",
        "create task for today",
        "create tasks for tomorrow",
        "create tasks",
        "create task",
        "add tasks for today",
        "add task for today",
        "add tasks",
        "add task",
        "schedule tasks for today",
        "schedule tasks",
        "schedule task",
        "schedule",
        "at time",
        "then at",
        "then",
        "and",
    ];

    for prefix in &prefixes {
        if lower.starts_with(prefix) {
            cleaned = cleaned[prefix.len()..].trim();
            break;
        }
    }

    let mut result = cleaned
        .trim_matches(|c: char| c == ',' || c == '.' || c == ';' || c.is_whitespace())
        .to_string();

    if let Some(first_char) = result.chars().next() {
        result = format!("{}{}", first_char.to_uppercase(), &result[first_char.len_utf8()..]);
    }

    result
}

fn normalize_time_str(raw: &str) -> Option<String> {
    let lower = raw.trim().to_lowercase();
    let is_pm = lower.contains("pm");
    let is_am = lower.contains("am");

    let num_part: String = lower.chars().filter(|c| c.is_ascii_digit() || *c == ':').collect();
    let parts: Vec<&str> = num_part.split(':').collect();
    if parts.is_empty() {
        return None;
    }

    let mut hours: u32 = parts[0].parse().ok()?;
    let minutes: u32 = if parts.len() > 1 { parts[1].parse().unwrap_or(0) } else { 0 };

    if is_pm && hours < 12 {
        hours += 12;
    }
    // If user wrote "12 am" in daytime context, normalize to noon 12:00
    if is_am && hours == 12 {
        hours = 12;
    }

    Some(format!("{:02}:{:02}", hours, minutes))
}

fn parse_local_heuristic(context: &AiRequestContext) -> AiResponsePayload {
    let msg = context.user_message.to_lowercase();
    let mut operations = Vec::new();
    let message;

    // STEP 1 & 2: Compound multi-task schedule with time markers (e.g. "at 10am check emails, 12 am portfolio fixing, 1pm learning dsa then at 9:30pm meeting with Diorian")
    let clauses: Vec<&str> = context.user_message
        .split(|c| c == ',' || c == ';')
        .flat_map(|s| s.split(" then "))
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .collect();

    let mut parsed_compound = Vec::new();
    for clause in &clauses {
        let cl_lower = clause.to_lowercase();
        let mut found_time: Option<String> = None;
        let mut time_str_to_strip = "";

        for word in cl_lower.split_whitespace() {
            if word.contains("am") || word.contains("pm") || word.contains(':') {
                if let Some(norm) = normalize_time_str(word) {
                    found_time = Some(norm);
                    time_str_to_strip = word;
                    break;
                }
            }
        }

        if let Some(time) = found_time {
            let mut title_part = clause.replace(time_str_to_strip, "");
            title_part = title_part.replace("at time", "").replace("at", "");
            let clean = clean_task_title(&title_part);

            if !clean.is_empty() {
                let is_meeting = clean.to_lowercase().contains("meeting") || clean.to_lowercase().contains("sync") || clean.to_lowercase().contains("interview");
                let is_study = clean.to_lowercase().contains("dsa") || clean.to_lowercase().contains("study") || clean.to_lowercase().contains("learn") || clean.to_lowercase().contains("design");
                let is_health = clean.to_lowercase().contains("workout") || clean.to_lowercase().contains("exercise") || clean.to_lowercase().contains("gym");

                let category = if is_meeting { "Work" } else if is_study { "Learning" } else if is_health { "Health" } else { "Work" };
                let priority = if is_meeting { "critical" } else { "important" };
                let duration = if is_meeting { 45 } else { 60 };

                parsed_compound.push(AiOperation {
                    op_type: "ADD_COMMITMENT".to_string(),
                    title: Some(clean),
                    task_id: None,
                    duration_minutes: Some(duration),
                    priority: Some(priority.to_string()),
                    category: Some(category.to_string()),
                    target_date: Some("today".to_string()),
                    start_time: Some(time),
                    end_time: None,
                    frequency: None,
                    preferred_time: None,
                    notes: None,
                });
            }
        }
    }

    if parsed_compound.len() > 1 {
        // STEP 3: Outline summary of multiple planned commitments
        let count = parsed_compound.len();
        let summaries: Vec<String> = parsed_compound
            .iter()
            .map(|op| format!("{} ({})", op.title.as_deref().unwrap_or("Task"), op.start_time.as_deref().unwrap_or("")))
            .collect();
        message = format!("I've planned {} commitments for today: {}. Click 'Apply Changes' below to add them to your schedule.", count, summaries.join(", "));
        operations = parsed_compound;
    } else if msg.contains("meeting") || msg.contains("call") || msg.contains("appointment") {
        let mut start_time = "14:00".to_string();
        if msg.contains("at 4") || msg.contains("4 pm") || msg.contains("16:00") {
            start_time = "16:00".to_string();
        } else if msg.contains("at 3") || msg.contains("3 pm") || msg.contains("15:00") {
            start_time = "15:00".to_string();
        } else if msg.contains("at 2") || msg.contains("2 pm") || msg.contains("14:00") {
            start_time = "14:00".to_string();
        } else if msg.contains("at 11") || msg.contains("11 am") {
            start_time = "11:00".to_string();
        } else if msg.contains("at 10") || msg.contains("10 am") {
            start_time = "10:00".to_string();
        }

        let clean_title = clean_task_title(&context.user_message);

        operations.push(AiOperation {
            op_type: "ADD_COMMITMENT".to_string(),
            title: Some(clean_title.clone()),
            task_id: None,
            duration_minutes: Some(45),
            priority: Some("critical".to_string()),
            category: Some("Work".to_string()),
            target_date: Some("today".to_string()),
            start_time: Some(start_time.clone()),
            end_time: None,
            frequency: None,
            preferred_time: None,
            notes: None,
        });
        message = format!("Scheduled commitment '{}' at {} today.", clean_title, start_time);
    } else if msg.contains("skip") || msg.contains("don't want to") || msg.contains("dont want to") {
        let target = if msg.contains("exercise") {
            "Morning workout"
        } else if msg.contains("dsa") {
            "DSA Practice"
        } else if msg.contains("reading") || msg.contains("read") {
            "Reading"
        } else {
            "current task"
        };
        operations.push(AiOperation {
            op_type: "SKIP_TASK".to_string(),
            title: Some(target.to_string()),
            task_id: None,
            duration_minutes: None,
            priority: None,
            category: None,
            target_date: None,
            start_time: None,
            end_time: None,
            frequency: None,
            preferred_time: None,
            notes: Some("Skipped via AI request".to_string()),
        });
        message = format!("Marked {} as skipped. Recalculating remaining day...", target);
    } else if msg.contains("tomorrow") || msg.contains("move") || msg.contains("later") {
        let clean = clean_task_title(&context.user_message);
        operations.push(AiOperation {
            op_type: "MOVE_TASK".to_string(),
            title: Some(clean),
            task_id: None,
            duration_minutes: None,
            priority: None,
            category: None,
            target_date: Some(if msg.contains("tomorrow") { "tomorrow".to_string() } else { "today".to_string() }),
            start_time: None,
            end_time: None,
            frequency: None,
            preferred_time: Some("afternoon".to_string()),
            notes: None,
        });
        message = "Rescheduled task and updated today's plan.".to_string();
    } else if msg.contains("habit") || msg.contains("every weekday") || msg.contains("every day") {
        let mut duration = 45;
        if msg.contains("30 min") { duration = 30; }
        if msg.contains("60 min") || msg.contains("1 hour") { duration = 60; }
        let clean = clean_task_title(&context.user_message);
        operations.push(AiOperation {
            op_type: "CREATE_HABIT".to_string(),
            title: Some(clean.clone()),
            task_id: None,
            duration_minutes: Some(duration),
            priority: Some("important".to_string()),
            category: Some("Learning".to_string()),
            target_date: None,
            start_time: None,
            end_time: None,
            frequency: Some("weekdays".to_string()),
            preferred_time: Some("morning".to_string()),
            notes: None,
        });
        message = format!("Created recurring habit '{}' ({} min, weekdays).", clean, duration);
    } else if msg.contains("what should i do") || msg.contains("what to do") || msg.contains("right now") {
        message = "Focus on your next scheduled priority task. Your schedule has been reviewed.".to_string();
    } else {
        let mut duration = 60;
        if msg.contains("2 hours") || msg.contains("2h") || msg.contains("2 hr") { duration = 120; }
        else if msg.contains("3 hours") || msg.contains("3h") || msg.contains("3 hr") { duration = 180; }
        else if msg.contains("45 min") { duration = 45; }
        else if msg.contains("30 min") { duration = 30; }
        else if msg.contains("15 min") { duration = 15; }

        let priority = if msg.contains("urgent") || msg.contains("critical") || msg.contains("must") {
            "critical"
        } else if msg.contains("optional") {
            "optional"
        } else if msg.contains("flexible") {
            "flexible"
        } else {
            "important"
        };

        let category = if msg.contains("code") || msg.contains("api") || msg.contains("client") || msg.contains("work") {
            "Work"
        } else if msg.contains("workout") || msg.contains("exercise") || msg.contains("run") || msg.contains("walk") {
            "Health"
        } else if msg.contains("dsa") || msg.contains("study") || msg.contains("read") || msg.contains("learn") {
            "Learning"
        } else {
            "Personal"
        };

        let clean = clean_task_title(&context.user_message);
        operations.push(AiOperation {
            op_type: "ADD_TASK".to_string(),
            title: Some(clean.clone()),
            task_id: None,
            duration_minutes: Some(duration),
            priority: Some(priority.to_string()),
            category: Some(category.to_string()),
            target_date: Some("today".to_string()),
            start_time: None,
            end_time: None,
            frequency: None,
            preferred_time: None,
            notes: None,
        });
        message = format!("Added '{}' ({} min, {} priority) to your schedule.", clean, duration, priority);
    }

    AiResponsePayload {
        message,
        operations,
        thought_steps: None,
        suggestions: Some(vec![
            "Apply proposed schedule changes".to_string(),
            "Keep 15m buffer before your next meeting".to_string(),
        ]),
        is_overloaded: Some(false),
        overload_minutes: Some(0),
    }
}
