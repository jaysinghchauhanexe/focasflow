import { AiRequestContext, AiResponsePayload, Task, Habit, AppSettings } from '../types';

export async function sendAiCommand(
  userMessage: string,
  tasks: Task[],
  habits: Habit[],
  settings: AppSettings
): Promise<AiResponsePayload> {
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const remainingTasks = tasks
    .filter(t => t.status !== 'completed' && t.status !== 'skipped')
    .map(t => `${t.title} (${t.duration}m, ${t.priority}, ${t.category})`);

  const habitNames = habits
    .filter(h => h.active)
    .map(h => `${h.title} (${h.duration}m, ${h.frequency})`);

  const context: AiRequestContext = {
    current_time: currentTime,
    current_date: currentDate,
    remaining_tasks: remainingTasks,
    habits: habitNames,
    working_hours: `${settings.workStart} - ${settings.workEnd}`,
    sleep_hours: `${settings.sleepTime} - ${settings.wakeTime}`,
    user_message: userMessage,
    api_key: settings.openRouterApiKey || undefined,
    model: settings.openRouterModel || 'anthropic/claude-3.5-haiku',
  };

  // Try invoking Tauri backend command
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    const result = await invoke<AiResponsePayload>('process_ai_command', { context });
    return result;
  } catch (err) {
    console.warn('Tauri invoke not available, using client-side heuristic parser:', err);
    return parseClientHeuristic(userMessage, context);
  }
}

function parseClientHeuristic(userMessage: string, context: AiRequestContext): AiResponsePayload {
  const msg = userMessage.toLowerCase();
  const operations: any[] = [];
  let message = '';

  if (msg.includes('meeting') || msg.includes('call') || msg.includes('appointment')) {
    let startTime = '16:00';
    if (msg.includes('at 4') || msg.includes('4 pm') || msg.includes('16:00')) startTime = '16:00';
    else if (msg.includes('at 3') || msg.includes('3 pm') || msg.includes('15:00')) startTime = '15:00';
    else if (msg.includes('at 2') || msg.includes('2 pm') || msg.includes('14:00')) startTime = '14:00';
    else if (msg.includes('at 11') || msg.includes('11 am')) startTime = '11:00';
    else if (msg.includes('at 10') || msg.includes('10 am')) startTime = '10:00';

    operations.push({
      op_type: 'ADD_COMMITMENT',
      title: userMessage,
      duration_minutes: 45,
      priority: 'critical',
      category: 'Work',
      target_date: 'today',
      start_time: startTime,
    });
    message = `Added commitment "${userMessage}" at ${startTime}.`;
  } else if (msg.includes('skip') || msg.includes("don't want to") || msg.includes("dont want to")) {
    operations.push({
      op_type: 'SKIP_TASK',
      title: userMessage,
      notes: 'Skipped by user instruction',
    });
    message = `Marked task as skipped and rescheduled the remaining day.`;
  } else if (msg.includes('tomorrow') || msg.includes('move')) {
    operations.push({
      op_type: 'MOVE_TASK',
      title: userMessage,
      target_date: msg.includes('tomorrow') ? 'tomorrow' : 'today',
      preferred_time: 'afternoon',
    });
    message = `Moved task to ${msg.includes('tomorrow') ? 'tomorrow' : 'later today'}.`;
  } else if (msg.includes('habit') || msg.includes('every weekday') || msg.includes('every day')) {
    let duration = 45;
    if (msg.includes('30 min')) duration = 30;
    if (msg.includes('60 min') || msg.includes('1 hour')) duration = 60;
    operations.push({
      op_type: 'CREATE_HABIT',
      title: userMessage,
      duration_minutes: duration,
      priority: 'important',
      category: 'Learning',
      frequency: 'weekdays',
      preferred_time: 'morning',
    });
    message = `Created new habit "${userMessage}" (${duration} min, weekdays).`;
  } else if (msg.includes('what should i do') || msg.includes('what to do') || msg.includes('right now')) {
    message = `Check your Current Task card. Focus on completing your highest priority item first.`;
  } else {
    let duration = 60;
    if (msg.includes('2 hours') || msg.includes('2h') || msg.includes('2 hr')) duration = 120;
    else if (msg.includes('3 hours') || msg.includes('3h') || msg.includes('3 hr')) duration = 180;
    else if (msg.includes('45 min')) duration = 45;
    else if (msg.includes('30 min')) duration = 30;
    else if (msg.includes('15 min')) duration = 15;

    const priority = (msg.includes('urgent') || msg.includes('critical') || msg.includes('must'))
      ? 'critical'
      : (msg.includes('optional') ? 'optional' : (msg.includes('flexible') ? 'flexible' : 'important'));

    const category = (msg.includes('code') || msg.includes('api') || msg.includes('client') || msg.includes('work'))
      ? 'Work'
      : (msg.includes('workout') || msg.includes('exercise') || msg.includes('run') || msg.includes('walk')
        ? 'Health'
        : (msg.includes('dsa') || msg.includes('study') || msg.includes('read') || msg.includes('learn')
          ? 'Learning'
          : 'Personal'));

    operations.push({
      op_type: 'ADD_TASK',
      title: userMessage,
      duration_minutes: duration,
      priority,
      category,
      target_date: 'today',
    });
    message = `Added "${userMessage}" (${duration}m, ${priority} priority) to today's schedule.`;
  }

  return {
    message,
    operations,
    suggestions: [
      'Move flexible work to tomorrow if your afternoon feels tight',
      'Take a 10-minute break after deep focus blocks',
    ],
    is_overloaded: false,
    overload_minutes: 0,
  };
}
