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
pub struct AiResponsePayload {
    pub message: String,
    pub operations: Vec<AiOperation>,
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
    pub user_message: String,
    pub api_key: Option<String>,
    pub model: Option<String>,
}

pub async fn execute_ai_intent(context: AiRequestContext) -> Result<AiResponsePayload, String> {
    let api_key = context.api_key.clone().unwrap_or_default();
    let model = context.model.clone().unwrap_or_else(|| "anthropic/claude-3.5-haiku".to_string());

    if !api_key.trim().is_empty() {
        match call_openrouter(&api_key, &model, &context).await {
            Ok(res) => return Ok(res),
            Err(err) => {
                eprintln!("OpenRouter call error: {}. Falling back to local parser.", err);
                // Fallback to local heuristic parser
            }
        }
    }

    // Local deterministic heuristic engine for offline mode
    Ok(parse_local_heuristic(&context))
}

async fn call_openrouter(
    api_key: &str,
    model: &str,
    context: &AiRequestContext,
) -> Result<AiResponsePayload, String> {
    let client = reqwest::Client::new();

    let system_prompt = "You are FocusFlow AI, a calm, disciplined personal scheduling assistant for Daily Life OS.\n\
    Your job is to interpret the user's natural language request and convert it into structured operations.\n\
    DO NOT generate the full schedule timetable yourself. Instead, generate discrete operations.\n\
    Available operation types:\n\
    - ADD_TASK (title, duration_minutes, priority ['critical', 'important', 'flexible', 'optional'], category ['Health', 'Work', 'Personal', 'Learning', 'Neutral'], deadline, scheduled_date)\n\
    - UPDATE_TASK (task_id, title, duration_minutes, priority, category)\n\
    - DELETE_TASK (task_id, title)\n\
    - MOVE_TASK (task_id, title, target_date ['today', 'tomorrow', 'next_week', or YYYY-MM-DD], preferred_time ['morning', 'afternoon', 'evening'])\n\
    - SKIP_TASK (task_id, title, notes)\n\
    - COMPLETE_TASK (task_id, title)\n\
    - CHANGE_PRIORITY (task_id, title, priority)\n\
    - CHANGE_DURATION (task_id, title, duration_minutes)\n\
    - CREATE_HABIT (title, category, duration_minutes, frequency ['daily', 'weekdays', 'weekends', 'weekly'], preferred_time ['morning', 'afternoon', 'evening'])\n\
    - ADD_COMMITMENT (title, category, start_time [e.g. '16:00'], duration_minutes, target_date)\n\
    - REPLAN_DAY (notes)\n\
    Always respond with ONLY a valid JSON object matching this schema:\n\
    {\n\
      \"message\": \"Concise and friendly confirmation message for the user\",\n\
      \"operations\": [\n\
        {\n\
          \"op_type\": \"ADD_TASK\",\n\
          \"title\": \"Example\",\n\
          \"duration_minutes\": 60,\n\
          \"priority\": \"important\",\n\
          \"category\": \"Work\"\n\
        }\n\
      ],\n\
      \"suggestions\": [\"Suggestion 1\", \"Suggestion 2\"],\n\
      \"is_overloaded\": false,\n\
      \"overload_minutes\": 0\n\
    }";

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

fn parse_local_heuristic(context: &AiRequestContext) -> AiResponsePayload {
    let msg = context.user_message.to_lowercase();
    let mut operations = Vec::new();
    let message;

    if msg.contains("meeting") || msg.contains("call") || msg.contains("appointment") {
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

        operations.push(AiOperation {
            op_type: "ADD_COMMITMENT".to_string(),
            title: Some(context.user_message.clone()),
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
        message = format!("Scheduled commitment at {} today.", start_time);
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
        operations.push(AiOperation {
            op_type: "MOVE_TASK".to_string(),
            title: Some(context.user_message.clone()),
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
        operations.push(AiOperation {
            op_type: "CREATE_HABIT".to_string(),
            title: Some(context.user_message.clone()),
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
        message = format!("Created recurring habit ({} min, weekdays).", duration);
    } else if msg.contains("what should i do") || msg.contains("what to do") || msg.contains("right now") {
        message = "Focus on your next scheduled priority task. Your schedule has been reviewed.".to_string();
    } else {
        // Generic Add Task
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

        operations.push(AiOperation {
            op_type: "ADD_TASK".to_string(),
            title: Some(context.user_message.clone()),
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
        message = format!("Added '{}' ({} min, {} priority) to your schedule.", context.user_message, duration, priority);
    }

    AiResponsePayload {
        message,
        operations,
        suggestions: Some(vec![
            "Move flexible task to tomorrow if needed".to_string(),
            "Keep 15m buffer before your next meeting".to_string(),
        ]),
        is_overloaded: Some(false),
        overload_minutes: Some(0),
    }
}
