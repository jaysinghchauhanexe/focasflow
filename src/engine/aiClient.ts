import { AiRequestContext, AiResponsePayload, Task, Habit, AppSettings } from '../types';
import { runInAppInference, extractJsonFromText } from './webLlmService';

export async function sendAiCommand(
  userMessage: string,
  tasks: Task[],
  habits: Habit[],
  settings: AppSettings,
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<AiResponsePayload> {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const remainingTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'skipped')
    .map((t, idx) => `${idx + 1}. "${t.title}" (${t.duration}m, ${t.priority}, ${t.category})`);

  const habitNames = habits
    .filter(h => h.active)
    .map(h => `"${h.title}" (${h.duration}m, ${h.frequency})`);

  const context: AiRequestContext = {
    current_time: currentTime,
    current_date: currentDate,
    remaining_tasks: remainingTasks,
    habits: habitNames,
    working_hours: `${settings.workStart} - ${settings.workEnd}`,
    sleep_hours: `${settings.sleepTime} - ${settings.wakeTime}`,
    user_message: userMessage,
    conversation_history: history,
    api_key: settings.openRouterApiKey || undefined,
    model: settings.openRouterModel || 'anthropic/claude-3.5-haiku',
  };

  const systemPrompt = `You are FocasFlow AI, the automated schedule and task engine built into FocasFlow.
You have FULL programmatic control over the task list and schedule. You can and MUST perform operations when asked.

Current Context:
- Date: ${currentDate}, Time: ${currentTime}
- Working Hours: ${settings.workStart} - ${settings.workEnd}
- Active User Tasks (${remainingTasks.length} total):
${remainingTasks.length > 0 ? remainingTasks.map(t => `  - ${t}`).join('\n') : '  (None)'}
- Active Habits: ${habitNames.join(', ') || '(None)'}

MANDATORY ACTION EXECUTION RULES:
1. TASK REFINEMENT & STRICT PROPERTY PRESERVATION: When the user asks to change, refine, or adjust ONE property of a task (e.g. "change it to personal", "the time should be 20 min", "make it critical"):
   - You MUST change ONLY the explicitly requested property!
   - You MUST preserve all other existing properties!
   - If a task had priority: "important" and duration: 15, changing category to "Personal" MUST KEEP priority: "important" and duration: 15!
   - NEVER spontaneously downgrade or change priority to "optional" unless user specifically typed "optional".
   - Output ONLY the single UPDATE_TASK operation for THAT task:
      { "op_type": "UPDATE_TASK", "title": "Fix AI", "duration_minutes": 15, "priority": "important", "category": "Personal" }
   - NEVER create multiple tasks or recreate other unrelated tasks when refining a single task.
2. TASK DELETION AUTHORITY: You have full permissions to delete tasks. When the user asks to delete or remove tasks:
   - For a single task: { "op_type": "DELETE_TASK", "title": "Task title or number" }
   - For multiple tasks or ranges (e.g. "delete task 1 task 2 task 3", "tasks 1 through 10"): Generate a DELETE_TASK item for each requested task in "operations": [ {"op_type": "DELETE_TASK", "title": "task 1"}, {"op_type": "DELETE_TASK", "title": "task 2"}, ... ]
   - For all tasks: [ {"op_type": "DELETE_TASK", "title": "all"} ]
3. GREETINGS & CASUAL CHAT: If the user is just saying hello or asking questions without wanting to modify tasks, return "operations": [] and reply helpfully in "message".
4. ADDING TASKS: When the user asks to add or schedule tasks, generate "ADD_TASK" with title, duration_minutes, priority, and category.
5. MOVING / SKIPPING / COMPLETING / UPDATING: Generate "MOVE_TASK", "SKIP_TASK", "COMPLETE_TASK", or "UPDATE_TASK".

Supported op_types: "ADD_TASK", "DELETE_TASK", "UPDATE_TASK", "MOVE_TASK", "SKIP_TASK", "COMPLETE_TASK", "CREATE_HABIT", "ADD_COMMITMENT", "REPLAN_DAY"

Return ONLY valid JSON matching this schema:
{
  "message": "Short friendly confirmation message of what was executed",
  "operations": [
    {
      "op_type": "DELETE_TASK" | "ADD_TASK" | "MOVE_TASK" | "SKIP_TASK" | "COMPLETE_TASK" | "CREATE_HABIT" | "ADD_COMMITMENT",
      "title": "Clean Task Title",
      "duration_minutes": 45,
      "priority": "critical" | "important" | "flexible" | "optional",
      "category": "Work" | "Learning" | "Personal" | "Health",
      "target_date": "today" | "tomorrow",
      "start_time": "14:00"
    }
  ],
  "suggestions": []
}`;

  const provider = settings.aiProvider || 'in_app';

  // 1. IN-APP DIRECT MODEL EXECUTION (WebLLM / Hugging Face weights, No Ollama required!)
  if (provider === 'in_app') {
    const inAppModel = settings.inAppModel || 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
    try {
      const { text, latencyMs } = await runInAppInference(inAppModel, userMessage, systemPrompt, history);
      const parsed = extractJsonFromText(text);

      if (parsed && typeof parsed === 'object') {
        let ops = Array.isArray(parsed.operations) ? parsed.operations : [];
        let msg = parsed.message || (ops.length ? `Processed with in-app ${inAppModel}` : text);

        if (ops.length === 0 && (userMessage.toLowerCase().includes('delete') || userMessage.toLowerCase().includes('remove'))) {
          const fallback = parseClientHeuristic(userMessage, context);
          if (fallback.operations.length > 0) {
            ops = fallback.operations;
            msg = fallback.message;
          }
        }

        ops = preserveRefinedTaskProperties(ops, userMessage, context);

        return {
          message: msg,
          operations: ops,
          suggestions: parsed.suggestions || [],
          is_overloaded: parsed.is_overloaded,
          overload_minutes: parsed.overload_minutes,
          engineSource: 'in_app_webgpu',
          modelUsed: inAppModel,
          latencyMs,
        };
      } else if (text && text.trim().length > 0) {
        if (userMessage.toLowerCase().includes('delete') || userMessage.toLowerCase().includes('remove')) {
          const fallback = parseClientHeuristic(userMessage, context);
          return {
            ...fallback,
            engineSource: 'in_app_webgpu',
            modelUsed: inAppModel,
            latencyMs,
          };
        }

        return {
          message: text,
          operations: [],
          suggestions: [],
          engineSource: 'in_app_webgpu',
          modelUsed: inAppModel,
          latencyMs,
        };
      }
    } catch (err: any) {
      console.warn('In-app WebLLM execution error, falling back to heuristic parser:', err);
      const heuristicRes = parseClientHeuristic(userMessage, context);
      return {
        ...heuristicRes,
        warning: `In-app model execution notice: ${err?.message || 'In-app weights not loaded'}. If running on WebGPU, try Qwen 2.5 1.5B or re-download.`,
      };
    }
  }

  // 2. LOCAL OLLAMA SERVER EXECUTION
  if (provider === 'local_ollama') {
    const startTime = performance.now();
    const endpoint = (settings.localEndpoint || 'http://localhost:11434').replace(/\/$/, '');
    const localModel = settings.localModel || 'qwen2.5:1.5b';

    try {
      // First check if the model is actually installed in Ollama
      const tagsRes = await fetch(`${endpoint}/api/tags`).catch(() => null);
      if (tagsRes && tagsRes.ok) {
        const tagsData = await tagsRes.json();
        const installedModels: string[] = (tagsData.models || []).map((m: any) => m.name || m.model);
        const hasModel = installedModels.some(
          m => m === localModel || m.startsWith(`${localModel}:`) || localModel.startsWith(`${m}:`)
        );

        if (!hasModel && installedModels.length > 0) {
          const fallbackRes = parseClientHeuristic(userMessage, context);
          return {
            ...fallbackRes,
            warning: `Model "${localModel}" is not downloaded in Ollama (Installed: ${installedModels.join(', ')}). Run "ollama run ${localModel}" or switch model.`,
          };
        }
      }

      const cleanHistory = history
        .slice(-6)
        .filter(h => !h.content.toLowerCase().includes("can't delete") && !h.content.toLowerCase().includes("cannot delete"));

      const ollamaMessages = [
        { role: 'system', content: systemPrompt },
        ...cleanHistory.map(h => ({ role: h.role, content: h.content })),
        { role: 'user', content: userMessage }
      ];

      const res = await fetch(`${endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: localModel,
          messages: ollamaMessages,
          temperature: 0.1,
          response_format: { type: 'json_object' }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        const elapsed = Math.round(performance.now() - startTime);
        if (content) {
          const parsed = extractJsonFromText(content);
          if (parsed && typeof parsed === 'object') {
            let ops = Array.isArray(parsed.operations) ? parsed.operations : [];
            let msg = parsed.message || `Processed with local ${localModel}`;

            // Safety check: if user asked to delete but model hallucinated no ops or a refusal message
            if (ops.length === 0 && (userMessage.toLowerCase().includes('delete') || userMessage.toLowerCase().includes('remove'))) {
              const fallback = parseClientHeuristic(userMessage, context);
              if (fallback.operations.length > 0) {
                ops = fallback.operations;
                msg = fallback.message;
              }
            }

            ops = preserveRefinedTaskProperties(ops, userMessage, context);

            return {
              message: msg,
              operations: ops,
              suggestions: parsed.suggestions || [],
              is_overloaded: parsed.is_overloaded,
              overload_minutes: parsed.overload_minutes,
              engineSource: 'ollama_local',
              modelUsed: localModel,
              latencyMs: elapsed,
            };
          } else {
            // If the model returned plain text refusal for a delete command, resolve with heuristic
            if (userMessage.toLowerCase().includes('delete') || userMessage.toLowerCase().includes('remove')) {
              const fallback = parseClientHeuristic(userMessage, context);
              return {
                ...fallback,
                engineSource: 'ollama_local',
                modelUsed: localModel,
                latencyMs: elapsed,
              };
            }

            return {
              message: content,
              operations: [],
              suggestions: [],
              engineSource: 'ollama_local',
              modelUsed: localModel,
              latencyMs: elapsed,
            };
          }
        }
      }
    } catch (err) {
      console.warn('Local Ollama call error, falling back to local heuristic parser:', err);
    }
  }

  // 3. Try invoking Tauri backend command if present
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const result = await invoke<AiResponsePayload>('process_ai_command', { context });
    return result;
  } catch (err) {
    // 4. Fallback to client-side heuristic parser
    return parseClientHeuristic(userMessage, context);
  }
}

function parseClientHeuristic(userMessage: string, context: AiRequestContext): AiResponsePayload {
  const msg = userMessage.trim().toLowerCase();
  const operations: any[] = [];
  let message = '';

  // 1. Casual Greetings & Conversational Queries (No tasks added!)
  const isGreeting = /^(hello|hi|hey|greetings|good morning|good afternoon|good evening|yo|hola)(\s+.*)?$/i.test(msg);
  const isQuestion = /^(who are you|what can you do|how are you|what is this|help|what can i do)(\s*\??)$/i.test(msg);
  const isGratitude = /^(thanks|thank you|awesome|great|cool|ok|okay|got it)(\s*.*)?$/i.test(msg);

  if (isGreeting) {
    return {
      message: "Hello! How can I help you organize your schedule or tasks today?",
      operations: [],
      suggestions: [
        'Schedule 45m DSA Practice today at 4:00 PM',
        'Move client API platform task to tomorrow',
        'Skip workout today and free up my morning'
      ]
    };
  }

  if (isQuestion) {
    return {
      message: "I am your FocasFlow AI assistant. I can help you schedule tasks, add fixed commitments, rearrange overloaded days, or create daily habits.",
      operations: [],
      suggestions: [
        'Add a 30m code review task today',
        'Schedule Team Sync at 3:00 PM',
        'Create 30 min reading habit every weekday'
      ]
    };
  }

  if (isGratitude) {
    return {
      message: "You're welcome! Let me know whenever you need to adjust your focus blocks.",
      operations: [],
    };
  }

  // 2. Deleting Tasks
  if (msg.includes('delete') || msg.includes('remove') || msg.includes('clear')) {
    if (msg.includes('all') || msg.includes('everything')) {
      operations.push({
        op_type: 'DELETE_TASK',
        title: 'all',
      });
      message = 'Deleted all tasks from your schedule.';
    } else {
      const taskMatches = userMessage.match(/task\s*\d+/gi);
      if (taskMatches && taskMatches.length > 0) {
        for (const tm of taskMatches) {
          operations.push({
            op_type: 'DELETE_TASK',
            title: tm.trim(),
          });
        }
        message = `Deleted ${taskMatches.length} tasks (${taskMatches.join(', ')}) from your schedule.`;
      } else {
        const cleanTitle = userMessage
          .replace(/^(delete|remove|clear)\s+(the\s+)?(task\s+)?/i, '')
          .replace(/\s+(today|tomorrow|from schedule).*$/i, '')
          .trim() || userMessage;

        operations.push({
          op_type: 'DELETE_TASK',
          title: cleanTitle,
        });
        message = `Deleted "${cleanTitle}" from your schedule.`;
      }
    }
  }
  // 2b. Refinement & Property Adjustments (Duration, Priority, Category, Time)
  else if (
    msg.includes('refine') ||
    msg.includes('time should be') ||
    msg.includes('duration should be') ||
    msg.includes('priority should be') ||
    msg.includes('category should be') ||
    msg.includes('change time') ||
    msg.includes('change duration') ||
    msg.includes('change priority') ||
    msg.includes('change category') ||
    msg.includes('make it') ||
    msg.includes('minutes instead')
  ) {
    const durMatch = msg.match(/(\d+)\s*(?:min|mins|minute|minutes|m\b)/i);
    const duration = durMatch ? parseInt(durMatch[1]) : undefined;

    // Detect Priority
    let priority: 'critical' | 'important' | 'flexible' | 'optional' | undefined = undefined;
    if (msg.includes('critical') || msg.includes('urgent') || msg.includes('high priority')) priority = 'critical';
    else if (msg.includes('important') || msg.includes('medium priority')) priority = 'important';
    else if (msg.includes('flexible') || msg.includes('low priority')) priority = 'flexible';
    else if (msg.includes('optional')) priority = 'optional';

    // Detect Category (Work, Learning, Personal, Health)
    let category: 'Work' | 'Learning' | 'Personal' | 'Health' | undefined = undefined;
    if (msg.includes('work') || msg.includes('job') || msg.includes('office')) category = 'Work';
    else if (msg.includes('learning') || msg.includes('study') || msg.includes('course')) category = 'Learning';
    else if (msg.includes('personal') || msg.includes('home') || msg.includes('life')) category = 'Personal';
    else if (msg.includes('health') || msg.includes('fitness') || msg.includes('gym')) category = 'Health';

    let targetTitle = 'Fix AI';
    let prevDuration: number | undefined = undefined;
    let prevPriority: 'critical' | 'important' | 'flexible' | 'optional' | undefined = undefined;
    let prevCategory: 'Work' | 'Learning' | 'Personal' | 'Health' | undefined = undefined;

    const history = context.conversation_history || [];
    for (let i = history.length - 1; i >= 0; i--) {
      const hText = history[i].content;
      const quoted = hText.match(/"([^"]+)"/);
      if (quoted && !targetTitle) {
        targetTitle = quoted[1];
      }
      const taskM = hText.match(/task\s+(?:for\s+)?([a-zA-Z0-9\s]+)/i);
      if (taskM && (!targetTitle || targetTitle === 'Fix AI')) {
        targetTitle = taskM[1].replace(/^(for|the)\s+/i, '').trim();
      }

      const dM = hText.match(/(\d+)\s*(?:min|mins|minute|minutes|m\b)/i);
      if (dM && !prevDuration) prevDuration = parseInt(dM[1]);

      if (!prevPriority) {
        if (hText.toLowerCase().includes('critical')) prevPriority = 'critical';
        else if (hText.toLowerCase().includes('important')) prevPriority = 'important';
        else if (hText.toLowerCase().includes('flexible')) prevPriority = 'flexible';
        else if (hText.toLowerCase().includes('optional')) prevPriority = 'optional';
      }

      if (!prevCategory) {
        if (hText.toLowerCase().includes('personal')) prevCategory = 'Personal';
        else if (hText.toLowerCase().includes('learning')) prevCategory = 'Learning';
        else if (hText.toLowerCase().includes('health')) prevCategory = 'Health';
        else if (hText.toLowerCase().includes('work')) prevCategory = 'Work';
      }
    }

    const finalDuration = duration || prevDuration || 15;
    const finalPriority = priority || prevPriority || 'important';
    const finalCategory = category || prevCategory || 'Work';

    operations.push({
      op_type: 'UPDATE_TASK',
      title: targetTitle,
      duration_minutes: finalDuration,
      priority: finalPriority,
      category: finalCategory,
    });
    
    const details = [];
    if (duration) details.push(`${finalDuration}m`);
    if (priority) details.push(`priority: ${finalPriority}`);
    if (category) details.push(`category: ${finalCategory}`);

    message = `Updated "${targetTitle}" (${details.join(', ') || `category: ${finalCategory}`}).`;
  }
  // 3. Commitments & Appointments
  else if (msg.includes('meeting') || msg.includes('call') || msg.includes('appointment') || msg.includes('sync')) {
    let startTime = '16:00';
    if (msg.includes('at 4') || msg.includes('4 pm') || msg.includes('16:00')) startTime = '16:00';
    else if (msg.includes('at 3') || msg.includes('3 pm') || msg.includes('15:00')) startTime = '15:00';
    else if (msg.includes('at 2') || msg.includes('2 pm') || msg.includes('14:00')) startTime = '14:00';
    else if (msg.includes('at 11') || msg.includes('11 am')) startTime = '11:00';
    else if (msg.includes('at 10') || msg.includes('10 am')) startTime = '10:00';

    const cleanTitle = userMessage
      .replace(/^(add|schedule|create|set up)\s+/i, '')
      .replace(/\s+at\s+\d+(:?\d+)?\s*(am|pm)?/i, '')
      .trim() || userMessage;

    operations.push({
      op_type: 'ADD_COMMITMENT',
      title: cleanTitle,
      duration_minutes: 30,
      priority: 'critical',
      category: 'Work',
      target_date: 'today',
      start_time: startTime,
    });
    message = `Added commitment "${cleanTitle}" at ${startTime}.`;
  } 
  // 3. Skip Task
  else if (msg.includes('skip') || msg.includes("don't want to") || msg.includes("dont want to")) {
    const cleanTitle = userMessage
      .replace(/^(skip|cancel|don't want to do|dont want to do)\s+/i, '')
      .replace(/\s+today.*$/i, '')
      .trim() || userMessage;

    operations.push({
      op_type: 'SKIP_TASK',
      title: cleanTitle,
      notes: 'Skipped by user instruction',
    });
    message = `Marked "${cleanTitle}" as skipped and rescheduled the remaining day.`;
  } 
  // 4. Move / Reschedule Task
  else if (msg.includes('tomorrow') || msg.includes('move') || msg.includes('postpone') || msg.includes('reschedule')) {
    const cleanTitle = userMessage
      .replace(/^(move|postpone|reschedule)\s+/i, '')
      .replace(/\s+to\s+(tomorrow|today).*$/i, '')
      .trim() || userMessage;

    operations.push({
      op_type: 'MOVE_TASK',
      title: cleanTitle,
      target_date: msg.includes('tomorrow') ? 'tomorrow' : 'today',
      preferred_time: 'afternoon',
    });
    message = `Moved "${cleanTitle}" to ${msg.includes('tomorrow') ? 'tomorrow' : 'later today'}.`;
  } 
  // 5. Habits
  else if (msg.includes('habit') || msg.includes('every weekday') || msg.includes('every day') || msg.includes('daily')) {
    let duration = 30;
    if (msg.includes('45 min')) duration = 45;
    if (msg.includes('60 min') || msg.includes('1 hour')) duration = 60;

    const cleanTitle = userMessage
      .replace(/^(create|add|make)\s+(a\s+)?(new\s+)?habit\s+(called\s+)?/i, '')
      .replace(/\s+(every weekday|every day|daily).*$/i, '')
      .trim() || userMessage;

    operations.push({
      op_type: 'CREATE_HABIT',
      title: cleanTitle,
      duration_minutes: duration,
      priority: 'important',
      category: 'Learning',
      frequency: msg.includes('every day') ? 'daily' : 'weekdays',
      preferred_time: 'morning',
    });
    message = `Created new habit "${cleanTitle}" (${duration} min).`;
  } 
  // 6. Explicit Add Task (requires explicit task action verbs)
  else if (
    msg.startsWith('add') || 
    msg.startsWith('schedule') || 
    msg.startsWith('create task') || 
    msg.startsWith('todo') || 
    msg.startsWith('remind me to') ||
    msg.startsWith('plan') ||
    msg.includes('min task') ||
    msg.includes('hour task')
  ) {
    let duration = 45;
    if (msg.includes('2 hours') || msg.includes('2h')) duration = 120;
    else if (msg.includes('60 min') || msg.includes('1 hour') || msg.includes('1h')) duration = 60;
    else if (msg.includes('45 min') || msg.includes('45m')) duration = 45;
    else if (msg.includes('30 min') || msg.includes('30m')) duration = 30;
    else if (msg.includes('15 min') || msg.includes('15m')) duration = 15;

    const priority = (msg.includes('urgent') || msg.includes('critical') || msg.includes('must'))
      ? 'critical'
      : (msg.includes('optional') ? 'optional' : (msg.includes('flexible') ? 'flexible' : 'important'));

    const category = (msg.includes('code') || msg.includes('api') || msg.includes('client') || msg.includes('work') || msg.includes('review'))
      ? 'Work'
      : (msg.includes('workout') || msg.includes('exercise') || msg.includes('run') || msg.includes('walk') || msg.includes('gym'))
        ? 'Health'
        : (msg.includes('dsa') || msg.includes('study') || msg.includes('read') || msg.includes('learn') || msg.includes('book'))
          ? 'Learning'
          : 'Personal';

    const cleanTitle = userMessage
      .replace(/^(add|schedule|create task|todo|remind me to|plan)\s+(a\s+)?(\d+m\s+)?/i, '')
      .replace(/\s+(today|tomorrow|at\s+\d+(:?\d+)?\s*(am|pm)?).*$/i, '')
      .trim() || userMessage;

    operations.push({
      op_type: 'ADD_TASK',
      title: cleanTitle,
      duration_minutes: duration,
      priority,
      category,
      target_date: msg.includes('tomorrow') ? 'tomorrow' : 'today',
    });
    message = `Added "${cleanTitle}" (${duration}m, ${priority} priority) to your schedule.`;
  } 
  // 7. General query / discussion (No task invented!)
  else {
    message = `I understand: "${userMessage}". If you would like me to schedule this as a task, you can say "Add ${userMessage} for 45m" or ask me to organize your day.`;
  }

  return {
    message,
    operations,
    suggestions: operations.length > 0 ? [
      'Move flexible work to tomorrow if your afternoon feels tight',
      'Take a 10-minute break after deep focus blocks',
    ] : [],
    is_overloaded: false,
    overload_minutes: 0,
    engineSource: 'heuristic_fallback',
    modelUsed: 'Offline Rule-Based Heuristic',
    latencyMs: 5,
  };
}

function preserveRefinedTaskProperties(
  ops: any[],
  userMessage: string,
  context: AiRequestContext
): any[] {
  const msgLower = userMessage.toLowerCase();
  const history = context.conversation_history || [];
  if (history.length === 0) return ops;

  // Check if this is a refinement turn
  const isRefine =
    msgLower.includes('refine') ||
    msgLower.includes('change') ||
    msgLower.includes('make it') ||
    msgLower.includes('instead') ||
    msgLower.includes('should be') ||
    msgLower.includes('to personal') ||
    msgLower.includes('to work') ||
    msgLower.includes('to health') ||
    msgLower.includes('to learning');

  if (!isRefine) return ops;

  const userSpecifiedPriority =
    msgLower.includes('critical') ||
    msgLower.includes('urgent') ||
    msgLower.includes('important') ||
    msgLower.includes('flexible') ||
    msgLower.includes('optional');
  const userSpecifiedDuration = /(\d+)\s*(?:min|mins|minute|minutes|m\b)/i.test(msgLower);
  const userSpecifiedCategory =
    msgLower.includes('personal') ||
    msgLower.includes('work') ||
    msgLower.includes('learning') ||
    msgLower.includes('health');

  // Extract prior properties from conversation history
  let prevPriority: 'critical' | 'important' | 'flexible' | 'optional' | undefined = undefined;
  let prevDuration: number | undefined = undefined;
  let prevCategory: string | undefined = undefined;

  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i].content;
    const hLower = h.toLowerCase();

    if (!prevPriority) {
      if (hLower.includes('critical')) prevPriority = 'critical';
      else if (hLower.includes('important')) prevPriority = 'important';
      else if (hLower.includes('flexible')) prevPriority = 'flexible';
      else if (hLower.includes('optional')) prevPriority = 'optional';
    }
    if (!prevDuration) {
      const durMatch = h.match(/(\d+)\s*(?:min|mins|minute|minutes|m\b)/i);
      if (durMatch) prevDuration = parseInt(durMatch[1]);
    }
    if (!prevCategory) {
      if (hLower.includes('personal')) prevCategory = 'Personal';
      else if (hLower.includes('learning')) prevCategory = 'Learning';
      else if (hLower.includes('health')) prevCategory = 'Health';
      else if (hLower.includes('work')) prevCategory = 'Work';
    }
  }

  return ops.map((op) => {
    if (op.op_type === 'UPDATE_TASK' || op.op_type === 'ADD_TASK') {
      const updated = { ...op };
      // If user did not specify priority, restore prior priority if available and never default-downgrade
      if (!userSpecifiedPriority && prevPriority) {
        updated.priority = prevPriority;
      }
      // If user did not specify duration, restore prior duration if available
      if (
        !userSpecifiedDuration &&
        prevDuration &&
        (!updated.duration_minutes || updated.duration_minutes === 60 || updated.duration_minutes === 25)
      ) {
        updated.duration_minutes = prevDuration;
      }
      // If user specified category, ensure category is set
      if (userSpecifiedCategory) {
        if (msgLower.includes('personal')) updated.category = 'Personal';
        else if (msgLower.includes('work')) updated.category = 'Work';
        else if (msgLower.includes('learning')) updated.category = 'Learning';
        else if (msgLower.includes('health')) updated.category = 'Health';
      }
      return updated;
    }
    return op;
  });
}
