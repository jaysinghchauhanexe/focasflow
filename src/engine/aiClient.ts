import { AiRequestContext, AiResponsePayload, Task, Habit, AppSettings, AiOperation } from '../types';
import { runInAppInference, extractJsonFromText } from './webLlmService';

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

export function sanitizeAssistantMessage(
  rawMsg: string,
  userMessage: string,
  ops: any[]
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

  // If user gave greeting and no ops
  if (isGreeting && (!ops || ops.length === 0)) {
    const isEchoGreeting =
      rawCleanLower.replace(/[^a-z]/g, '') === userClean.replace(/[^a-z]/g, '') ||
      rawClean.length < 4;
    if (isEchoGreeting || !rawClean) {
      return "Hello! How can I help you organize your tasks or optimize your schedule today?";
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

MANDATORY ACTION EXECUTION RULES:
1. TASK REFINEMENT & STRICT PROPERTY PRESERVATION: When the user asks to change, refine, or adjust ONE property of a task (e.g. "change it to personal", "the time should be 20 min", "make it critical"):
   - You MUST change ONLY the explicitly requested property!
   - You MUST preserve all other existing properties!
   - If a task had priority: "important" and duration: 15, changing category to "Personal" MUST KEEP priority: "important" and duration: 15!
   - NEVER spontaneously downgrade or change priority to "optional" unless user specifically typed "optional".
   - Output ONLY the single UPDATE_TASK operation for THAT task:
      { "op_type": "UPDATE_TASK", "title": "Fix AI", "duration_minutes": 15, "priority": "important", "category": "Personal" }
   - NEVER create multiple tasks or recreate other unrelated tasks when refining a single task.
2. TASK DELETION AUTHORITY & PRONOUN RESOLUTION: When the user asks to delete, remove, or drop tasks (e.g. "delete it", "can you delete it?", "remove that task", "delete temp"):
   - Resolve pronouns like "it", "that", "this task" to the most recently created or discussed task in the conversation history!
   - Output { "op_type": "DELETE_TASK", "title": "Resolved Task Title" }
   - NEVER output conversational text or questions like "can you delete it?" as the task title!
3. GREETINGS, PRAISE, COMPLIMENTS & CASUAL CHAT (INCLUDING USER PERSONA INQUIRIES):
   - When the user sends compliments, praise, greetings, or casual chatter (e.g. "you know me, right?", "who am I?") WITHOUT asking for tasks/schedule actions:
   - MANDATORY: YOU MUST SET "operations": [] (EMPTY ARRAY)!
   - NEVER create, delete, or modify any task on casual chatter!
   - If the user asks if you know them or about themselves, you MUST use their User Information & Context provided above to respond accurately and naturally!
   - Reply warmly and politely.
   - CRITICAL: NEVER parrot or echo the user's praise or words back at them!
4. ADDING TASKS & INTELLIGENT TASK SUGGESTIONS:
   - When the user specifically asks for tasks to be flexible or unstructured, use "ADD_TASK" (which has no start_time).
   - CRITICAL TIME CONSTRAINT RULE: If the user provides an absolute time, OR asks to "schedule" or "assign times", you MUST use "ADD_COMMITMENT" and provide both "start_time" (e.g., "12:00") and "duration_minutes". Both are MANDATORY for commitments!
   - DO NOT split tasks that are joined by '+' or 'and' if they belong to the same time block (e.g. "Lunch + Anime" must be ONE task titled "Lunch + Anime").
   - When the user asks "what tasks should I do?", "suggest tasks", or says "add tasks judging who I am":
     * CRITICAL: YOU MUST append 2 to 4 completely new tasks tailored directly to the user's persona/tech stack!
     * You MUST use "ADD_COMMITMENT" for these invented tasks and GUESS a reasonable "start_time" and "duration_minutes" for when they should do them today!
     * Provide a helpful, motivating message presenting the proposed focus plan.
       * CRITICAL: You MUST leave a gap of at least the Default Break Buffer between any consecutive commitments you schedule!
5. DELETING SPECIFIC TASKS VS OTHERS:
   - If the user says "keep X and delete others", you MUST NOT delete X! You must output DELETE_TASK operations for the OTHER tasks in the schedule instead.
6. MOVING / SKIPPING / COMPLETING / UPDATING: Generate "MOVE_TASK", "SKIP_TASK", "COMPLETE_TASK", or "UPDATE_TASK".

Supported op_types: "ADD_TASK", "DELETE_TASK", "UPDATE_TASK", "MOVE_TASK", "SKIP_TASK", "COMPLETE_TASK", "CREATE_HABIT", "ADD_COMMITMENT", "REPLAN_DAY"

Return ONLY valid JSON matching this schema:
{
  "message": "Friendly, articulate assistant response. If user gave praise or greeting, thank them warmly and offer assistance. NEVER echo the user's prompt back.",
  "operations": [
    {
      "op_type": "DELETE_TASK" | "ADD_TASK" | "MOVE_TASK" | "SKIP_TASK" | "COMPLETE_TASK" | "CREATE_HABIT" | "ADD_COMMITMENT",
      "title": "Clean Task Title",
      "duration_minutes": 45,
      "priority": "critical" | "important" | "flexible" | "optional",
      "category": ${categoriesString},
      "target_date": "today" | "tomorrow",
      "start_time": "14:00" // CRITICAL: ALWAYS extract or guess the start time and INCLUDE this field!
    }
  ],
  "suggestions": []
}

Examples:
- User: "you are the best" -> { "message": "Thank you! Happy to help keep you focused and organized. What's on your agenda?", "operations": [] }
- User: "hello" -> { "message": "Hi! How can I help you with your tasks or schedule today?", "operations": [] }
- User: "delete it" -> { "message": "Removed task from your schedule.", "operations": [{ "op_type": "DELETE_TASK", "title": "temp" }] }
- User: "workout + pod from 8am to 9am and meeting at 1pm" -> { "message": "I've added these commitments to your schedule.", "operations": [{ "op_type": "ADD_COMMITMENT", "title": "Workout + Pod", "start_time": "08:00", "duration_minutes": 60, "priority": "important", "category": "Health", "target_date": "today" }, { "op_type": "ADD_COMMITMENT", "title": "Meeting", "start_time": "13:00", "duration_minutes": 30, "priority": "important", "category": "Work", "target_date": "today" }] }
- User: "add tasks judging who I am" -> { "message": "Based on your profile, here are a few tasks:", "operations": [{ "op_type": "ADD_COMMITMENT", "title": "Deep Work: Architecture", "start_time": "14:00" // CRITICAL: ALWAYS extract or guess the start time and INCLUDE this field!, "duration_minutes": 60, "priority": "critical", "category": "Work", "target_date": "today" }, { "op_type": "ADD_COMMITMENT", "title": "Code Review", "start_time": "15:00", "duration_minutes": 30, "priority": "important", "category": "Work", "target_date": "today" }] }
- User: "keep coding and delete others" -> { "message": "Kept coding and removed the rest.", "operations": [{ "op_type": "DELETE_TASK", "title": "Reading" }, { "op_type": "DELETE_TASK", "title": "Meeting" }] }`;

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
        msg = sanitizeAssistantMessage(msg, userMessage, ops);

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

        const sanitizedMsg = sanitizeAssistantMessage(text, userMessage, []);
        return {
          message: sanitizedMsg,
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
            engineSource: 'heuristic_fallback',
            modelUsed: 'Offline Rule-Based Heuristic',
            warning: `Model "${localModel}" is not downloaded in Ollama (Installed: ${installedModels.join(', ')}). Run "ollama run ${localModel}" or switch model.`,
          };
        }
      } else {
        const fallbackRes = parseClientHeuristic(userMessage, context);
        return {
          ...fallbackRes,
          engineSource: 'heuristic_fallback',
          modelUsed: 'Offline Rule-Based Heuristic',
          warning: `Local Ollama server is offline or unreachable at ${endpoint}. Responded using offline heuristic rule engine.`,
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
            msg = sanitizeAssistantMessage(msg, userMessage, ops);

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

            const sanitizedMsg = sanitizeAssistantMessage(content, userMessage, []);
            return {
              message: sanitizedMsg,
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
    return {
      message: "Thank you so much! I'm glad I can help you stay focused and peaceful. Let me know whenever you'd like to adjust your tasks or schedule.",
      operations: [],
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
    return {
      message: "The AI model is currently offline or unreachable. FocasFlow is responding using its built-in offline heuristic engine. You can check your model setup in Settings → AI Configuration.",
      operations: [],
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
    return {
      message: "Yes! I know you based on the profile context you've set up in your settings. I use that context to personalize your focus blocks and schedule.",
      operations: [],
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
    return {
      message: "Hello! How can I help you organize your schedule or tasks today?",
      operations: [],
      suggestions: [
        'Schedule 45m DSA Practice today at 4:00 PM',
        'Move client API platform task to tomorrow',
        'Skip workout today and free up my morning'
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

  // Safety Intent Guard: If user query has no explicit action intent, never return operations!
  const finalOps = hasExplicitActionIntent(userMessage) ? operations : [];

  return {
    message,
    operations: finalOps,
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
