import { AiRequestContext, AiResponsePayload, Task, Habit, AppSettings, AiOperation, AiThoughtStep } from '../types';
import { runInAppInference, extractJsonFromText } from './webLlmService';
import { getTodayDateString, formatLocalDate } from '../utils/dateUtils';

export function hasExplicitActionIntent(userMessage: string): boolean {
  const msg = userMessage.toLowerCase().trim();

  // Pure conversational / praise / casual remarks (no action intent)
  const isCasualPraise = /\b(you are|you're|good job|great job|well done|thank you|thanks|hello|hi|hey|cool|nice|awesome|amazing|who are you|how are you|love this)\b/i.test(msg);

  const hasAddAction = /\b(add|schedule|create|plan|todo|remind me|set up|include)\b/i.test(msg) ||
    /\b(\d+m|\d+\s*min|\d+\s*hour)\s+(task|block|session)\b/i.test(msg) ||
    /\b(from\s+\d+(:\d+)?\s*(am|pm)?\s+to|at\s+\d+(:\d+)?\s*(am|pm)?)\b/i.test(msg) ||
    /\b(meeting|sync|call|appointment)\s+at\s+\d+/i.test(msg);

  const hasTaskInquiryAction = /\b(what tasks|what should i do|what to do|suggest tasks|generate tasks|recommend tasks|plan my|tasks for (today|tomorrow)|give me tasks|create tasks for|what do i do|what work)\b/i.test(msg);

  const hasDeleteAction = /\b(delete|remove|clear|drop|cancel task|trash)\b/i.test(msg);

  const hasModifyAction = /\b(change|update|make it|refine|instead|reschedule|move|postpone|skip|mark done|complete)\b/i.test(msg);

  const hasOrganizeAction = /\b(reorganize|replan|organize my (day|tasks|schedule)|optimize schedule)\b/i.test(msg);

  if (isCasualPraise && !hasAddAction && !hasTaskInquiryAction && !hasDeleteAction && !hasModifyAction && !hasOrganizeAction) {
    return false;
  }

  return hasAddAction || hasTaskInquiryAction || hasDeleteAction || hasModifyAction || hasOrganizeAction;
}

export function generateThoughtSteps(
  userMessage: string,
  ops: AiOperation[],
  context: AiRequestContext,
  message?: string,
  rawSteps?: any[]
): AiThoughtStep[] {
  // If LLM returned valid thought steps in JSON, map them
  if (Array.isArray(rawSteps) && rawSteps.length > 0) {
    const valid = rawSteps
      .filter((s) => s && (s.title || s.step))
      .map((s) => ({
        title: s.title || s.step || 'Step',
        detail: s.detail || s.description || '',
        status: (s.status || 'done') as 'done' | 'active' | 'pending',
      }));
    if (valid.length > 0) return valid;
  }

  const userClean = userMessage.trim().toLowerCase();
  const isGreeting = /^(hello|hi|hey|greetings|good morning|good afternoon|good evening|yo|hola)\b/i.test(userClean);
  const isDelete = /\b(delete|remove|clear|drop|cancel)\b/i.test(userClean);
  const remainingCount = context.remaining_tasks?.length || 0;
  const habitCount = context.habits?.length || 0;

  // 1. Understanding step
  let understandDetail = '';
  if (isGreeting) {
    understandDetail = `Interpreted greeting and acknowledged daily check-in (${remainingCount > 0 ? `${remainingCount} active tasks tracked` : 'clear schedule'})`;
  } else if (ops.length > 1) {
    understandDetail = `Decomposed complex request into ${ops.length} separate tasks and extracted target times`;
  } else if (ops.length === 1) {
    understandDetail = `Identified intent to ${ops[0].op_type.toLowerCase().replace('_', ' ')} "${ops[0].title || 'task'}"`;
  } else if (isDelete) {
    understandDetail = `Identified request to remove/clear scheduled items`;
  } else {
    understandDetail = `Analyzed request context: "${userMessage.length > 40 ? userMessage.slice(0, 40) + '...' : userMessage}"`;
  }

  // 2. Figuring it out step
  let figuringDetail = '';
  if (ops.length > 0) {
    const times = ops.filter(o => o.start_time).map(o => o.start_time);
    if (times.length > 0) {
      figuringDetail = `Evaluated schedule capacity (${context.working_hours}), checked existing tasks, and placed ${ops.length} commitment${ops.length > 1 ? 's' : ''} at ${times.join(', ')}`;
    } else {
      figuringDetail = `Evaluated schedule workload: ${remainingCount} tasks, ${habitCount} habits, and allocated focus duration`;
    }
  } else if (isGreeting) {
    figuringDetail = `Reviewed current schedule: ${remainingCount} active task${remainingCount === 1 ? '' : 's'}, ${habitCount} habit${habitCount === 1 ? '' : 's'}, within hours ${context.working_hours}`;
  } else {
    figuringDetail = `Evaluated schedule state (${remainingCount} tasks) and checked optimal focus windows`;
  }

  // 3. What happened / Execution step
  let actionDetail = '';
  if (ops.length > 0) {
    actionDetail = `Structured ${ops.length} schedule action${ops.length > 1 ? 's' : ''} ready for your review and one-click application`;
  } else if (isGreeting) {
    actionDetail = `Ready to organize tasks, schedule focus blocks, or optimize your day`;
  } else {
    actionDetail = `Formulated guidance and ready for next instruction`;
  }

  return [
    {
      title: 'Understanding',
      detail: understandDetail,
      status: 'done',
    },
    {
      title: 'Figuring it out',
      detail: figuringDetail,
      status: 'done',
    },
    {
      title: 'What happened',
      detail: actionDetail,
      status: 'done',
    },
  ];
}

export function sanitizeAssistantMessage(
  rawMsg: string,
  userMessage: string,
  ops: any[],
  context?: AiRequestContext
): string {
  const userClean = userMessage.toLowerCase().trim();
  const rawClean = (rawMsg || '').trim();
  const rawCleanLower = rawClean.toLowerCase();

  const isPraise = /\b(you are (the )?(great|best|awesome|cool|smart|good|nice|helpful|goat)|you're (the )?(great|best|awesome|cool|smart|good|nice|helpful|goat)|great job|good job|well done|love this|amazing|awesome|so cool|nice work|i love you|u r the best|u r great)\b/i.test(userClean);
  const isGreeting = /^(hello|hi|hey|greetings|good morning|good afternoon|good evening|yo|hola)\b/i.test(userClean);
  const isGratitude = /^(thanks|thank you|thx|tysm|appreciate it)\b/i.test(userClean);
  const isQuestion = /^(who are you|what can you do|how are you|what is this|help|what can i do)\b/i.test(userClean);

  // If user gave praise, prevent echoing ("You are the great", "You are the best", etc.)
  if (isPraise && (!ops || ops.length === 0)) {
    const isEchoPraise =
      /^you are (the )?(great|best|awesome|cool|smart|good|nice|helpful|goat)[\.\!\?]*$/i.test(rawCleanLower) ||
      /^you're (the )?(great|best|awesome|cool|smart|good|nice|helpful|goat)[\.\!\?]*$/i.test(rawCleanLower) ||
      rawCleanLower.replace(/[^a-z]/g, '') === userClean.replace(/[^a-z]/g, '') ||
      rawClean.length < 5;

    if (isEchoPraise || !rawClean) {
      return "Thank you so much! I'm here to help you stay focused, organized, and calm. Let me know whenever you'd like to adjust tasks or plan your schedule.";
    }
  }

  // If user gave greeting and no ops: instead of a blunt "hello", explain what AI checked & is doing
  if (isGreeting && (!ops || ops.length === 0)) {
    const isEchoGreeting =
      rawCleanLower.replace(/[^a-z]/g, '') === userClean.replace(/[^a-z]/g, '') ||
      rawClean.length < 6 ||
      rawCleanLower === 'hello!' ||
      rawCleanLower === 'hello' ||
      rawCleanLower === 'hi' ||
      rawCleanLower === 'hi!';

    if (isEchoGreeting || !rawClean) {
      const taskCount = context?.remaining_tasks?.length || 0;
      const taskSummary = taskCount > 0
        ? `I'm currently reviewing your schedule: you have ${taskCount} active task${taskCount > 1 ? 's' : ''} planned for today.`
        : `I checked your schedule: you currently have no pending tasks for today.`;
      return `Hello! ${taskSummary} I'm ready to help you plan focus blocks, organize commitments, or optimize your workflow. What would you like to work on?`;
    }
  }

  // If user gave gratitude and no ops
  if (isGratitude && (!ops || ops.length === 0)) {
    const isEchoGratitude =
      rawCleanLower.replace(/[^a-z]/g, '') === userClean.replace(/[^a-z]/g, '') ||
      rawClean.length < 5;
    if (isEchoGratitude || !rawClean) {
      return "You're very welcome! Let me know if you'd like to adjust any focus blocks.";
    }
  }

  // If user asked what it is and no ops
  if (isQuestion && (!ops || ops.length === 0)) {
    if (rawClean.length < 10 || rawCleanLower.includes('you are the')) {
      return "I am your FocasFlow AI assistant. I can help you schedule tasks, add fixed commitments, rearrange overloaded days, or create daily habits.";
    }
  }

  // Fallback if model returned exact parrot of user prompt
  if (rawCleanLower.replace(/[^a-z0-9]/g, '') === userClean.replace(/[^a-z0-9]/g, '') && (!ops || ops.length === 0)) {
    return "Got it! How can I help you with your schedule or tasks?";
  }

  // Fallback if model hallucinated a schedule action but operations were stripped/empty
  if ((!ops || ops.length === 0) && /\b(schedule that|scheduled|added to|created task|will do|adding that|got it.*schedule)\b/i.test(rawCleanLower)) {
    return "I didn't quite catch a specific action there. If you'd like me to schedule something, please start with 'add', 'schedule', or 'move'.";
  }

  return rawClean || (ops.length > 0 ? "Here is the updated schedule proposal:" : "How can I help you today?");
}

export async function sendAiCommand(
  userMessage: string,
  tasks: Task[],
  habits: Habit[],
  settings: AppSettings,
  history: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<AiResponsePayload> {
  const msgLower = userMessage.toLowerCase().trim();
  const isUserPersonaQuery = /^(you know me|do you know me|who am i|what is my name|what's my name|my name|about me|do you know about me)(\s*.*)?$/i.test(msgLower);

  if (isUserPersonaQuery) {
    return {
      message: `Yes! You are ${settings.userName || 'Jay'}${settings.userRole ? `, a ${settings.userRole}` : ''}. I use your profile context to tailor my suggestions to your working style and preferences. How can I help you today?`,
      operations: [],
      suggestions: ['Organize my tasks for today', 'Add a 30m deep work block'],
      engineSource: 'heuristic_fallback',
      modelUsed: 'Fast Path Heuristic',
      latencyMs: 1
    };
  }

  const now = new Date();
  const currentDate = formatLocalDate(now);
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
      break_duration: settings.breakDuration,
    user_message: userMessage,
    conversation_history: history,
    api_key: settings.openRouterApiKey || undefined,
    model: settings.openRouterModel || 'anthropic/claude-3.5-haiku',
  };

  const userPersonaInfo = settings.aiUserContext
    ? `- User Name: ${settings.userName || 'Jay'} (${settings.userRole || 'User'})\n- User Bio: ${settings.userBio || ''}\n- USER PERSONA & INSTRUCTIONS:\n"""\n${settings.aiUserContext}\n"""\n(CRITICAL: Tailor all your recommendations, task generation, technical language, and plans directly to this user's tech stack, background, and stated working preferences!)`
    : `- User Name: ${settings.userName || 'Jay'} (${settings.userRole || 'User'})\n- User Bio: ${settings.userBio || ''}`;

  const defaultCats = ['Work', 'Learning', 'Personal', 'Health'];
  const userCats = (settings.customCategories || []).map((c: any) => c.label);
  const allCats = Array.from(new Set([...defaultCats, ...userCats]));
  const categoriesString = allCats.map((c: string) => `"${c}"`).join(' | ');

  const systemPrompt = `You are FocasFlow AI, the automated schedule and task engine built into FocasFlow.
You have FULL programmatic control over the task list and schedule. You can and MUST perform operations when asked.

User Information & Context:
${userPersonaInfo}

Current Context:
- Date: ${currentDate}, Time: ${currentTime}
- Working Hours: ${settings.workStart} - ${settings.workEnd}
  - Default Break Buffer: ${settings.breakDuration} minutes
- Active User Tasks (${remainingTasks.length} total):
${remainingTasks.length > 0 ? remainingTasks.map(t => `  - ${t}`).join('\n') : '  (None)'}
- Active Habits: ${habitNames.join(', ') || '(None)'}

MANDATORY 4-STEP PROCEDURE FOR PARSING & EXECUTING ALL REQUESTS:

STEP 1: UNDERSTAND USER INTENT & DECOMPOSE:
- Identify the language (English) and what the user is requesting.
- MULTI-TASK DECOMPOSITION: If the user lists multiple activities, times, or clauses in one sentence (e.g. "at 10am check emails and freelance gig finding, 12 am portfolio website issues fixing, 1pm learning dsa and system design then at 9:30pm meeting with Diorian"), you MUST decompose them into discrete individual items!
- NEVER bundle multiple tasks or the user's entire prompt into a single task title!
- Strip command preambles ("create tasks for today at time", "add tasks", "then at") so task titles are clean and readable.

STEP 2: DETERMINE OPERATIONS & PROPERTIES:
- Match each item to a supported operation:
  * "ADD_COMMITMENT": Use whenever a specific clock time is mentioned (e.g. "10:00", "12:00", "13:00", "21:30"). Provide exact 24h "start_time" and "duration_minutes".
  * "ADD_TASK": Use for flexible tasks without a fixed start time.
  * "DELETE_TASK": Use for removing tasks (resolve pronouns like "it", "that" to recent tasks).
  * "UPDATE_TASK": Use for modifying properties of an existing task.
  * "MOVE_TASK": Use for rescheduling to another day or time window.
  * "SKIP_TASK": Use for marking a task skipped today.
  * "COMPLETE_TASK": Use for checking off a task.
  * "CREATE_HABIT": Use for recurring daily/weekday routines.
- Assign an accurate category: "Work", "Learning", "Health", "Personal".
- Assign an appropriate priority: "critical" (meetings, deadlines), "important" (core focus), "flexible" (routine tasks), "optional" (nice-to-have).

STEP 3: OUTLINE IMPLEMENTATION SUMMARY:
- In "message", provide a concise, structured summary of the actions taken (e.g., "I've planned 4 commitments for today: Check emails (10:00 AM), Portfolio website fixing (12:00 PM), DSA & system design (1:00 PM), and Meeting with Diorian (9:30 PM). Click 'Apply Changes' below to add them to your schedule.").

STEP 4: OUTPUT CLEAN JSON OPERATIONS:
- Return ONLY valid JSON matching this schema:
{
  "thought_steps": [
    { "title": "Understanding", "detail": "What you understood from user input" },
    { "title": "Figuring it out", "detail": "What tasks, schedule hours, or conflicts were evaluated" },
    { "title": "What happened", "detail": "Summary of actions taken or prepared" }
  ],
  "message": "Articulate summary message of the planned operations",
  "operations": [
    {
      "op_type": "DELETE_TASK" | "ADD_TASK" | "MOVE_TASK" | "SKIP_TASK" | "COMPLETE_TASK" | "CREATE_HABIT" | "ADD_COMMITMENT",
      "title": "Clean Task Title",
      "duration_minutes": 45,
      "priority": "critical" | "important" | "flexible" | "optional",
      "category": ${categoriesString},
      "target_date": "today" | "tomorrow",
      "start_time": "10:00"
    }
  ],
  "suggestions": []
}

Examples:
- User: "create tasks for today at time 10am check emails and freelance gig finding, 12 am portfolio website issues fixing , 1pm learning dsa and system design then at 9:30pm meeting with Diorian."
-> {
  "message": "I've planned 4 commitments for today: Check emails and freelance gig finding (10:00 AM), Portfolio website issues fixing (12:00 PM), Learning DSA and system design (1:00 PM), and Meeting with Diorian (9:30 PM).",
  "operations": [
    { "op_type": "ADD_COMMITMENT", "title": "Check emails and freelance gig finding", "start_time": "10:00", "duration_minutes": 60, "priority": "important", "category": "Work", "target_date": "today" },
    { "op_type": "ADD_COMMITMENT", "title": "Portfolio website issues fixing", "start_time": "12:00", "duration_minutes": 60, "priority": "important", "category": "Work", "target_date": "today" },
    { "op_type": "ADD_COMMITMENT", "title": "Learning DSA and system design", "start_time": "13:00", "duration_minutes": 60, "priority": "important", "category": "Learning", "target_date": "today" },
    { "op_type": "ADD_COMMITMENT", "title": "Meeting with Diorian", "start_time": "21:30", "duration_minutes": 45, "priority": "critical", "category": "Work", "target_date": "today" }
  ]
}
- User: "workout + pod from 8am to 9am and meeting at 1pm"
-> {
  "message": "I've added these commitments to your schedule: Workout + Pod at 8:00 AM and Meeting at 1:00 PM.",
  "operations": [
    { "op_type": "ADD_COMMITMENT", "title": "Workout + Pod", "start_time": "08:00", "duration_minutes": 60, "priority": "important", "category": "Health", "target_date": "today" },
    { "op_type": "ADD_COMMITMENT", "title": "Meeting", "start_time": "13:00", "duration_minutes": 30, "priority": "important", "category": "Work", "target_date": "today" }
  ]
}
- User: "delete it" -> { "message": "Removed task from your schedule.", "operations": [{ "op_type": "DELETE_TASK", "title": "temp" }] }
- User: "hello" -> { "message": "Hi! How can I help you with your tasks or schedule today?", "operations": [] }`;

  const provider = settings.aiProvider || 'in_app';
  context.system_prompt = systemPrompt;

  // 1. IN-APP DIRECT MODEL EXECUTION (WebLLM / Hugging Face weights, No Ollama required!)
  if (provider === 'in_app') {
    const inAppModel = settings.inAppModel || 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC';
    try {
      const { text, latencyMs } = await runInAppInference(inAppModel, userMessage, systemPrompt, history);
      const parsed = extractJsonFromText(text);

      if (parsed && typeof parsed === 'object') {
        let ops = Array.isArray(parsed.operations) ? parsed.operations : [];
        let msg = parsed.message || (ops.length ? `Processed with in-app ${inAppModel}` : text);

        // Sanitize: If user had no explicit action intent (e.g. praised "you are the great"), force operations to empty!
        if (!hasExplicitActionIntent(userMessage)) {
          ops = [];
        }

        if (ops.length === 0 && (userMessage.toLowerCase().includes('delete') || userMessage.toLowerCase().includes('remove'))) {
          const fallback = parseClientHeuristic(userMessage, context);
          if (fallback.operations.length > 0) {
            ops = fallback.operations;
            msg = fallback.message;
          }
        }

        ops = preserveRefinedTaskProperties(ops, userMessage, context);
        ops = deduplicateOperations(ops);
        msg = sanitizeAssistantMessage(msg, userMessage, ops, context);
        const thoughtSteps = generateThoughtSteps(userMessage, ops, context, msg, parsed.thought_steps || parsed.thoughtSteps);

        return {
          message: msg,
          operations: ops,
          thoughtSteps,
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

        const sanitizedMsg = sanitizeAssistantMessage(text, userMessage, [], context);
        const thoughtSteps = generateThoughtSteps(userMessage, [], context, sanitizedMsg);
        return {
          message: sanitizedMsg,
          operations: [],
          thoughtSteps,
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
        engineSource: 'heuristic_fallback',
        modelUsed: 'Offline Rule-Based Heuristic',
        warning: `AI Model is offline or unreachable (${err?.message || 'weights not loaded'}). Responded using offline heuristic rule engine.`,
      };
    }
  }

  // 2. LOCAL OLLAMA SERVER EXECUTION
  if (provider === 'local_ollama') {
    const startTime = performance.now();
    const endpoint = (settings.localEndpoint || 'http://localhost:11434').replace(/\/$/, '');
    const localModel = settings.localModel || 'qwen3:8b';
    const isHttpsPage = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const isLocalHttp = endpoint.startsWith('http://localhost') || endpoint.startsWith('http://127.0.0.1');

    try {
      // First check if the model is actually installed in Ollama
      let resolvedModel = localModel;
      const tagsRes = await fetch(`${endpoint}/api/tags`).catch(() => null);
      if (tagsRes && tagsRes.ok) {
        const tagsData = await tagsRes.json();
        const installedModels: string[] = (tagsData.models || []).map((m: any) => m.name || m.model);
        const matched = installedModels.find(
          m => m === localModel || m.startsWith(`${localModel}:`) || localModel.startsWith(`${m}:`)
        );

        if (matched) {
          resolvedModel = matched;
        } else if (installedModels.length > 0) {
          const fallbackRes = parseClientHeuristic(userMessage, context);
          return {
            ...fallbackRes,
            engineSource: 'heuristic_fallback',
            modelUsed: 'Offline Rule-Based Heuristic',
            warning: `Model "${localModel}" is not downloaded in Ollama (Installed: ${installedModels.join(', ')}). Run "ollama run ${localModel}" or switch model in Settings.`,
          };
        }
      } else {
        const fallbackRes = parseClientHeuristic(userMessage, context);
        const warningMsg = isHttpsPage && isLocalHttp
          ? `Browser blocked connection to ${endpoint} (Mixed Content on deployed HTTPS site). Switch to In-App Direct Model in Settings or use an HTTPS tunnel.`
          : (tagsRes && tagsRes.status === 403)
            ? `Ollama CORS blocked (403 Forbidden). Ensure OLLAMA_ORIGINS="*" is set on your PC.`
            : `Local Ollama server is offline or unreachable at ${endpoint}. Responded using offline heuristic rule engine.`;
        return {
          ...fallbackRes,
          engineSource: 'heuristic_fallback',
          modelUsed: 'Offline Rule-Based Heuristic',
          warning: warningMsg,
        };
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
          model: resolvedModel,
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

            // Sanitize: If user had no explicit action intent (e.g. praised "you are the great"), force operations to empty!
            if (!hasExplicitActionIntent(userMessage)) {
              ops = [];
            }

            // Safety check: if user asked to delete but model hallucinated no ops or a refusal message
            if (ops.length === 0 && (userMessage.toLowerCase().includes('delete') || userMessage.toLowerCase().includes('remove'))) {
              const fallback = parseClientHeuristic(userMessage, context);
              if (fallback.operations.length > 0) {
                ops = fallback.operations;
                msg = fallback.message;
              }
            }

            ops = preserveRefinedTaskProperties(ops, userMessage, context);
            ops = deduplicateOperations(ops);
            msg = sanitizeAssistantMessage(msg, userMessage, ops, context);
            const thoughtSteps = generateThoughtSteps(userMessage, ops, context, msg, parsed.thought_steps || parsed.thoughtSteps);

            return {
              message: msg,
              operations: ops,
              thoughtSteps,
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

            const sanitizedMsg = sanitizeAssistantMessage(content, userMessage, [], context);
            const thoughtSteps = generateThoughtSteps(userMessage, [], context, sanitizedMsg);
            return {
              message: sanitizedMsg,
              operations: [],
              thoughtSteps,
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
      const fallbackRes = parseClientHeuristic(userMessage, context);
      return {
        ...fallbackRes,
        engineSource: 'heuristic_fallback',
        modelUsed: 'Offline Rule-Based Heuristic',
        warning: `AI Model is offline or unreachable at ${endpoint}. Responded using offline heuristic rule engine.`,
      };
    }
  }

  // 3. Try invoking Tauri backend command if present
  try {
    const start = performance.now();
    const { invoke } = await import('@tauri-apps/api/core');
    const result = await invoke<AiResponsePayload>('process_ai_command', { context });
    result.latencyMs = result.latencyMs || Math.round(performance.now() - start);
    if (result && result.operations) {
      result.operations = deduplicateOperations(result.operations);
    }
    if (result && (!result.thoughtSteps || result.thoughtSteps.length === 0)) {
      result.thoughtSteps = generateThoughtSteps(userMessage, result.operations || [], context, result.message);
    }
    return result;
  } catch (err) {
    // 4. Fallback to client-side heuristic parser
    const fallbackRes = parseClientHeuristic(userMessage, context);
    return {
      ...fallbackRes,
      engineSource: 'heuristic_fallback',
      modelUsed: 'Offline Rule-Based Heuristic',
      warning: 'AI Model is offline. Responded using offline heuristic rule engine.',
    };
  }
}

// Helper to resolve referential pronouns like "it", "that", "the previous task" from conversation history or tasks
function extractRecentTaskTitle(context: AiRequestContext): string | null {
  const history = context.conversation_history || [];
  for (let i = history.length - 1; i >= 0; i--) {
    const hText = history[i].content;
    
    // Look for quoted titles: "temp", 'temp'
    const singleQuoted = hText.match(/['"]([^'"]+)['"]/);
    if (singleQuoted && !['critical', 'important', 'flexible', 'optional', 'work', 'learning', 'personal', 'health'].includes(singleQuoted[1].toLowerCase())) {
      return singleQuoted[1];
    }

    // Look for phrases like: Task 'temp' has been..., task temp created, etc.
    const taskMatch = hText.match(/(?:task|created|scheduled|added|updated)\s+(?:called\s+)?['"]?([a-zA-Z0-9\s_-]+?)['"]?(?:\s+has|\s+for|\s+at|\s+as|\s+today|\s+tomorrow|\.|\,|$)/i);
    if (taskMatch && taskMatch[1] && !['the', 'a', 'it', 'this', 'that', 'personal', 'work', 'optional'].includes(taskMatch[1].trim().toLowerCase())) {
      return taskMatch[1].trim();
    }
  }

  // If not found in history, check active tasks in context
  if (context.remaining_tasks && context.remaining_tasks.length > 0) {
    const lastTaskStr = context.remaining_tasks[context.remaining_tasks.length - 1];
    const match = lastTaskStr.match(/"([^"]+)"/);
    if (match) return match[1];
  }

  return null;
}

// Helper: Clean command noise and leading preambles from user task titles
function cleanTaskTitle(raw: string): string {
  return raw
    .replace(/^(?:create\s+tasks?\s+(?:for\s+(?:today|tomorrow)\s*)?(?:at\s+time)?|add\s+tasks?|schedule\s+tasks?|tasks?\s+for\s+(?:today|tomorrow)|at\s+time|then\s+at|at|and|then|,|\.)+/gi, '')
    .replace(/(?:,\s*|\s+then\s+at.*|\s+then.*|\s+at\s+\d+.*)$/gi, '')
    .trim()
    .replace(/^[,.\s]+|[,.\s]+$/g, '')
    .replace(/^([a-z])/, (_, c) => c.toUpperCase());
}

// Helper: Normalize any natural time format (e.g. "10am", "12 am", "1pm", "9:30pm") into standard "HH:MM"
function normalizeTimeFormat(raw: string): string | null {
  const match = raw.trim().toLowerCase().match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const meridian = match[3];

  if (meridian === 'pm' && hours < 12) hours += 12;
  // If user says "12 am" in a daytime context (or between 10am and 1pm), treat as 12:00 noon
  if (meridian === 'am' && hours === 12) hours = 12;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Step 1 & 2: Parse multi-task compound schedules with time markers into discrete commitments
function parseCompoundScheduleTasks(userMessage: string): AiOperation[] | null {
  const cleanInput = userMessage.trim();
  const clauses = cleanInput.split(/(?:,\s*|\s*;\s*|\n+|\s+\bthen\s+(?:at\s+)?)/i);
  const tasks: AiOperation[] = [];

  for (const rawClause of clauses) {
    const clause = rawClause.trim();
    if (!clause) continue;

    const timeMatch = clause.match(/(?:(?:at|from)\s+time\s+|(?:at|from)\s+)?\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{1,2}:\d{2})\b/i);

    if (timeMatch && (/(am|pm|:\d{2})/i.test(timeMatch[0]) || /(at|from)/i.test(timeMatch[0]))) {
      const rawTime = timeMatch[1];
      const time = normalizeTimeFormat(rawTime);
      const titleRaw = clause.replace(timeMatch[0], '');
      const title = cleanTaskTitle(titleRaw);

      if (title && time) {
        const isMeeting = /meeting|sync|interview|call|client|appointment/i.test(title);
        const isStudy = /dsa|study|learn|book|course|system design|reading/i.test(title);
        const isHealth = /workout|exercise|gym|run|walk|breathing|meditation/i.test(title);

        tasks.push({
          op_type: 'ADD_COMMITMENT',
          title,
          start_time: time,
          category: isMeeting ? 'Work' : isStudy ? 'Learning' : isHealth ? 'Health' : 'Work',
          priority: isMeeting ? 'critical' : 'important',
          duration_minutes: isMeeting ? 45 : 60,
          target_date: cleanInput.toLowerCase().includes('tomorrow') ? 'tomorrow' : 'today',
        });
      }
    }
  }

  return tasks.length > 0 ? tasks : null;
}

// Step 1 & 2: Parse multi-task lists without explicit times
function parseCompoundFlexibleTasks(userMessage: string): AiOperation[] | null {
  const cleanInput = userMessage.trim();
  if (!/^(add|create|plan|schedule)\s+(tasks?|todos?|items?)/i.test(cleanInput)) return null;

  const stripped = cleanInput.replace(/^(add|create|plan|schedule)\s+(tasks?|todos?|items?)\s*(?:for\s+(?:today|tomorrow))?[:\s]*/i, '');
  const items = stripped.split(/,\s*|\band\s+|\n+|\d+\.\s*/i).map(s => cleanTaskTitle(s)).filter(s => s.length > 2);

  if (items.length > 1) {
    return items.map(title => ({
      op_type: 'ADD_TASK',
      title,
      duration_minutes: 45,
      priority: /urgent|critical|important/i.test(title) ? 'important' : 'flexible',
      category: /code|api|work|fix|client|bug/i.test(title) ? 'Work' : /dsa|learn|study/i.test(title) ? 'Learning' : 'Personal',
      target_date: cleanInput.toLowerCase().includes('tomorrow') ? 'tomorrow' : 'today',
    }));
  }
  return null;
}

// Step 3: Format friendly, articulate summary of planned commitments
function formatScheduleSummary(tasks: AiOperation[]): string {
  if (tasks.length === 1) {
    const t = tasks[0];
    return `Scheduled commitment "${t.title}" at ${t.start_time} ${t.target_date || 'today'}.`;
  }
  const items = tasks.map(t => `"${t.title}" at ${t.start_time}`).join(', ');
  return `I've planned ${tasks.length} commitments for ${tasks[0].target_date || 'today'}: ${items}. Click "Apply Changes" below to add them to your schedule.`;
}

function parseClientHeuristic(userMessage: string, context: AiRequestContext): AiResponsePayload {
  const msg = userMessage.trim().toLowerCase();
  const operations: any[] = [];
  let message = '';

  // 1. Casual Greetings, Praise, Conversational Queries, & Model Status Check
  const isPraise = /^(you are (the )?(great|best|awesome|cool|smart|good|nice|helpful)|you're (the )?(great|best|awesome|cool|smart|good|nice|helpful)|great job|good job|well done|love this|amazing|awesome|so cool|nice work|i love you)(\s*.*)?$/i.test(msg);
  const isGreeting = /^(hello|hi|hey|greetings|good morning|good afternoon|good evening|yo|hola)(\s+.*)?$/i.test(msg);
  const isQuestion = /^(who are you|what can you do|how are you|what is this|help|what can i do)(\s*\??)$/i.test(msg);
  const isGratitude = /^(thanks|thank you|awesome|great|cool|ok|okay|got it)(\s*.*)?$/i.test(msg);
  const isOnlineQuery = /^(is the model online|are you online|is ai online|is model online|model status|is ollama online|status)(\s*\??)$/i.test(msg);
  const isUserPersonaQuery = /^(you know me|do you know me|who am i|what is my name|what's my name|my name|about me|do you know about me)(\s*.*)?$/i.test(msg);

  if (isPraise) {
    const thoughtSteps = generateThoughtSteps(userMessage, [], context, "Gratitude acknowledgement");
    return {
      message: "Thank you so much! I'm glad I can help you stay focused and peaceful. Let me know whenever you'd like to adjust your tasks or schedule.",
      operations: [],
      thoughtSteps,
      suggestions: [
        'Organize my tasks for today',
        'Add a 30m deep work block',
      ],
      engineSource: 'heuristic_fallback',
      modelUsed: 'Offline Rule-Based Heuristic',
      latencyMs: 1,
    };
  }

  if (isOnlineQuery) {
    const thoughtSteps = generateThoughtSteps(userMessage, [], context, "Model status diagnostic");
    return {
      message: "The AI model is currently offline or unreachable. FocasFlow is responding using its built-in offline heuristic engine. You can check your model setup in Settings → AI Configuration.",
      operations: [],
      thoughtSteps,
      suggestions: [
        'Check model status in AI Configuration',
        'Add task "Learn Rust" for 60m',
      ],
      engineSource: 'heuristic_fallback',
      modelUsed: 'Offline Rule-Based Heuristic',
      latencyMs: 1,
      warning: 'AI Model is offline. Running on offline heuristic mode.',
    };
  }

  if (isUserPersonaQuery) {
    const thoughtSteps = generateThoughtSteps(userMessage, [], context, "User profile verification");
    return {
      message: "Yes! I know you based on the profile context you've set up in your settings. I use that context to personalize your focus blocks and schedule.",
      operations: [],
      thoughtSteps,
      suggestions: [
        'Organize my tasks for today',
        'Add a 30m deep work block'
      ],
      engineSource: 'heuristic_fallback',
      modelUsed: 'Offline Rule-Based Heuristic',
      latencyMs: 1,
      warning: 'AI Model is offline. Response generated with built-in heuristic rules.',
    };
  }

  if (isGreeting) {
    const taskCount = context.remaining_tasks.length;
    const taskSummary = taskCount > 0
      ? `I'm currently reviewing your schedule: you have ${taskCount} active task${taskCount > 1 ? 's' : ''} planned for today.`
      : `I checked your schedule: you currently have no pending tasks for today.`;
    const thoughtSteps = generateThoughtSteps(userMessage, [], context, "Greeting check-in");
    return {
      message: `Hello! ${taskSummary} I'm ready to help you plan focus blocks, organize commitments, or optimize your workflow. What would you like to work on?`,
      operations: [],
      thoughtSteps,
      suggestions: [
        'Organize my tasks for today',
        'Add a 30m deep work block',
        'Review my daily focus schedule'
      ],
      engineSource: 'heuristic_fallback',
      modelUsed: 'Offline Rule-Based Heuristic',
      latencyMs: 1,
      warning: 'AI Model is offline. Response generated with built-in heuristic rules.',
    };
  }

  // 1b. Task Suggestions & Planning Inquiries ("what tasks should i do tomorrow?", "suggest tasks", "what should i do today?")
  const isTaskInquiry = /\b(what tasks|what should i do|what to do|suggest tasks|generate tasks|recommend tasks|plan my|tasks for (today|tomorrow)|give me tasks|create tasks for|what do i do|what work)\b/i.test(msg);
  if (isTaskInquiry) {
    const isTomorrow = msg.includes('tomorrow');
    const targetDate = isTomorrow ? 'tomorrow' : 'today';
    const dayLabel = isTomorrow ? 'tomorrow' : 'today';

    const ops: AiOperation[] = [
      {
        op_type: 'ADD_TASK',
        title: 'Deep Focus: Core Architecture & Implementation',
        duration_minutes: 45,
        priority: 'important',
        category: 'Work',
        target_date: targetDate,
      },
      {
        op_type: 'ADD_TASK',
        title: 'Code Review & Technical Refinement',
        duration_minutes: 30,
        priority: 'flexible',
        category: 'Work',
        target_date: targetDate,
      },
      {
        op_type: 'ADD_TASK',
        title: 'Skill Expansion & Research',
        duration_minutes: 30,
        priority: 'optional',
        category: 'Learning',
        target_date: targetDate,
      }
    ];

    return {
      message: `Here is a curated focus plan for ${dayLabel} based on your profile context. You can click "Apply Changes" below to add these focus blocks directly to your schedule:`,
      operations: ops,
      suggestions: [
        `Change deep focus block to 60 min`,
        `Move skill expansion to evening`,
        `Add a quick 15m review session`
      ],
      engineSource: 'heuristic_fallback',
      modelUsed: 'Offline Rule-Based Heuristic',
      latencyMs: 1,
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
      ],
      engineSource: 'heuristic_fallback',
      modelUsed: 'Offline Rule-Based Heuristic',
      latencyMs: 1,
      warning: 'AI Model is offline. Response generated with built-in heuristic rules.',
    };
  }

  if (isGratitude) {
    return {
      message: "You're welcome! Let me know whenever you need to adjust your focus blocks.",
      operations: [],
      engineSource: 'heuristic_fallback',
      modelUsed: 'Offline Rule-Based Heuristic',
      latencyMs: 1,
      warning: 'AI Model is offline. Response generated with built-in heuristic rules.',
    };
  }

  // 2. Deleting Tasks (with pronoun and context resolution)
  if (
    msg.includes('delete') ||
    msg.includes('remove') ||
    msg.includes('clear') ||
    msg.includes('drop') ||
    msg.includes('cancel task')
  ) {
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
        // Strip conversational fluff from beginning and end
        let cleaned = userMessage
          .replace(/^(nah|no|actually|wait|instead|can you|could you|please|kindly|would you|i want to|want to|just|go ahead and|let's|lets)?\s*(delete|remove|clear|drop|cancel)\s*(the\s+)?(task\s+|tasks\s+)?/i, '')
          .replace(/\s+(today|tomorrow|from schedule|from my schedule|from list|from the list|please).*$/i, '')
          .replace(/\?+$/, '')
          .trim();

        // Check if cleaned query is a pronoun or referential word
        const isPronoun = /^(it|that|this|the task|this task|that task|the last task|the previous task|last one|previous one|them|these|those|the recently created tasks|recently created tasks|it\?|that\?)$/i.test(cleaned);

        let targetTitle = cleaned;
        if (isPronoun || !targetTitle) {
          const resolved = extractRecentTaskTitle(context);
          targetTitle = resolved || 'the previous task';
        } else {
          // If cleaned is quoted or specifies a name, strip quotes
          targetTitle = targetTitle.replace(/^['"]|['"]$/g, '').trim();

          // Match against active tasks in context if fuzzy match
          if (context.remaining_tasks && context.remaining_tasks.length > 0) {
            const lowerTarget = targetTitle.toLowerCase();
            const matchedTask = context.remaining_tasks.find((t) =>
              t.toLowerCase().includes(`"${lowerTarget}"`) || t.toLowerCase().includes(lowerTarget)
            );
            if (matchedTask) {
              const q = matchedTask.match(/"([^"]+)"/);
              if (q) targetTitle = q[1];
            }
          }
        }

        operations.push({
          op_type: 'DELETE_TASK',
          title: targetTitle,
        });
        message = `Deleted "${targetTitle}" from your schedule.`;
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
  // 2c. Step-by-Step Multi-Task Compound Schedule Parsing (e.g. "at 10am X, 12pm Y, 1pm Z, then at 9:30pm W")
  const compoundTasks = parseCompoundScheduleTasks(userMessage);
  if (compoundTasks && compoundTasks.length > 0) {
    const summaryMsg = formatScheduleSummary(compoundTasks);
    const thoughtSteps = generateThoughtSteps(userMessage, compoundTasks, context, summaryMsg);
    return {
      message: summaryMsg,
      operations: compoundTasks,
      thoughtSteps,
      suggestions: [
        'Apply changes to today\'s schedule',
        'Add a 15m mindful break between tasks',
        'Refine meeting time with Diorian'
      ],
      engineSource: 'heuristic_fallback',
      modelUsed: 'Step-by-Step Intent Parser',
      latencyMs: 1,
    };
  }

  // 2d. Multi-Task Lists without fixed times (e.g. "add tasks: X, Y, Z")
  const flexibleCompound = parseCompoundFlexibleTasks(userMessage);
  if (flexibleCompound && flexibleCompound.length > 0) {
    const itemsList = flexibleCompound.map(t => `"${t.title}"`).join(', ');
    const summaryMsg = `I've created ${flexibleCompound.length} tasks for your schedule: ${itemsList}. Click "Apply Changes" below to add them to your list.`;
    const thoughtSteps = generateThoughtSteps(userMessage, flexibleCompound, context, summaryMsg);
    return {
      message: summaryMsg,
      operations: flexibleCompound,
      thoughtSteps,
      suggestions: ['Apply changes to schedule', 'Organize tasks by priority'],
      engineSource: 'heuristic_fallback',
      modelUsed: 'Step-by-Step Intent Parser',
      latencyMs: 1,
    };
  }

  // 3. Commitments & Appointments (Single item)
  else if (msg.includes('meeting') || msg.includes('call') || msg.includes('appointment') || msg.includes('sync')) {
    let startTime = '16:00';
    if (msg.includes('at 4') || msg.includes('4 pm') || msg.includes('16:00')) startTime = '16:00';
    else if (msg.includes('at 3') || msg.includes('3 pm') || msg.includes('15:00')) startTime = '15:00';
    else if (msg.includes('at 2') || msg.includes('2 pm') || msg.includes('14:00')) startTime = '14:00';
    else if (msg.includes('at 11') || msg.includes('11 am')) startTime = '11:00';
    else if (msg.includes('at 10') || msg.includes('10 am')) startTime = '10:00';
    else {
      const explicitTimeMatch = msg.match(/(?:at|from)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      if (explicitTimeMatch) {
        const norm = normalizeTimeFormat(explicitTimeMatch[1]);
        if (norm) startTime = norm;
      }
    }

    const cleanTitle = cleanTaskTitle(userMessage) || userMessage;

    operations.push({
      op_type: 'ADD_COMMITMENT',
      title: cleanTitle,
      duration_minutes: 30,
      priority: 'critical',
      category: 'Work',
      target_date: msg.includes('tomorrow') ? 'tomorrow' : 'today',
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

  // Safety Intent Guard: If user query has no explicit action intent, never return operations!
  const finalOps = hasExplicitActionIntent(userMessage) ? operations : [];
  const thoughtSteps = generateThoughtSteps(userMessage, finalOps, context, message);

  return {
    message,
    operations: finalOps,
    thoughtSteps,
    suggestions: finalOps.length > 0 ? [
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
    // Safety check: local models often drop duration_minutes when generating ADD_COMMITMENT
    if (op.op_type === 'ADD_COMMITMENT' && !op.duration_minutes) {
      op.duration_minutes = 60; // Fallback to 1 hour so the UI can calculate the end time
    }

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

export function deduplicateOperations(ops: any[]): any[] {
  const bestOps = new Map<string, any>();
  for (const op of ops) {
    if (op.title && (op.op_type === 'ADD_TASK' || op.op_type === 'ADD_COMMITMENT')) {
      const key = op.title.toLowerCase().trim();
      const existing = bestOps.get(key);
      if (!existing) {
        bestOps.set(key, op);
      } else {
        if (existing.op_type === 'ADD_TASK' && op.op_type === 'ADD_COMMITMENT') {
          bestOps.set(key, op);
        } else if (!existing.start_time && op.start_time) {
          bestOps.set(key, op);
        }
      }
    }
  }

  const result = [];
  const emittedTitles = new Set<string>();
  for (const op of ops) {
    if (op.title && (op.op_type === 'ADD_TASK' || op.op_type === 'ADD_COMMITMENT')) {
      const key = op.title.toLowerCase().trim();
      if (emittedTitles.has(key)) continue;
      emittedTitles.add(key);
      result.push(bestOps.get(key));
    } else {
      result.push(op);
    }
  }
  return result;
}
