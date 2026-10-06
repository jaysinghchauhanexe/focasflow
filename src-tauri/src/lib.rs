mod ai;
mod db;

use ai::{execute_ai_intent, AiRequestContext, AiResponsePayload};
use db::init_database;
use rusqlite::params;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TaskModel {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub duration: i32,
    pub priority: String, // critical, important, flexible, optional
    pub status: String,   // pending, active, completed, skipped, moved
    pub deadline: Option<String>,
    pub scheduled_date: Option<String>,
    pub scheduled_start: Option<String>,
    pub scheduled_end: Option<String>,
    pub category: String, // Health, Work, Personal, Learning, Neutral
    pub project_id: Option<String>,
    pub energy_level: Option<String>, // high, medium, low
    pub flexibility: Option<String>,  // fixed, flexible
    pub moved_count: Option<i32>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HabitModel {
    pub id: String,
    pub title: String,
    pub category: String,
    pub duration: i32,
    pub frequency: String, // daily, weekdays, weekends, weekly
    pub preferred_time: String, // morning, afternoon, evening
    pub target: i32,
    pub completed_dates: String, // JSON array string
    pub active: bool,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RoutineModel {
    pub id: String,
    pub title: String,
    pub r#type: String, // morning, evening, custom
    pub preferred_time: String,
    pub items: String, // JSON array string of step titles
    pub active: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GoalModel {
    pub id: String,
    pub title: String,
    pub category: String,
    pub target_date: Option<String>,
    pub progress: i32,
    pub description: Option<String>,
    pub projects: String, // JSON array string
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScheduleBlockModel {
    pub id: String,
    pub title: String,
    pub block_type: String, // task, habit, routine, commitment, break
    pub item_id: Option<String>,
    pub date: String,
    pub start_time: String,
    pub end_time: String,
    pub category: String,
    pub is_fixed: bool,
    pub completed: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HistoryLogModel {
    pub id: String,
    pub date: String,
    pub planned_minutes: i32,
    pub completed_minutes: i32,
    pub moved_minutes: i32,
    pub skipped_minutes: i32,
    pub completed_tasks_count: i32,
    pub total_tasks_count: i32,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FullAppState {
    pub tasks: Vec<TaskModel>,
    pub habits: Vec<HabitModel>,
    pub routines: Vec<RoutineModel>,
    pub goals: Vec<GoalModel>,
    pub schedule_blocks: Vec<ScheduleBlockModel>,
    pub history: Vec<HistoryLogModel>,
}

#[tauri::command]
fn get_all_data() -> Result<FullAppState, String> {
    let conn = init_database().map_err(|e| e.to_string())?;

    // Load Tasks
    let mut stmt = conn
        .prepare("SELECT id, title, description, duration, priority, status, deadline, scheduled_date, scheduled_start, scheduled_end, category, project_id, energy_level, flexibility, moved_count, created_at, updated_at FROM tasks")
        .map_err(|e| e.to_string())?;
    let tasks_iter = stmt
        .query_map([], |row| {
            Ok(TaskModel {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                duration: row.get(3)?,
                priority: row.get(4)?,
                status: row.get(5)?,
                deadline: row.get(6)?,
                scheduled_date: row.get(7)?,
                scheduled_start: row.get(8)?,
                scheduled_end: row.get(9)?,
                category: row.get(10)?,
                project_id: row.get(11)?,
                energy_level: row.get(12)?,
                flexibility: row.get(13)?,
                moved_count: row.get(14)?,
                created_at: row.get(15)?,
                updated_at: row.get(16)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let tasks: Vec<TaskModel> = tasks_iter.filter_map(Result::ok).collect();

    // Load Habits
    let mut stmt_habits = conn
        .prepare("SELECT id, title, category, duration, frequency, preferred_time, target, completed_dates, active, created_at FROM habits")
        .map_err(|e| e.to_string())?;
    let habits_iter = stmt_habits
        .query_map([], |row| {
            let active_int: i32 = row.get(8)?;
            Ok(HabitModel {
                id: row.get(0)?,
                title: row.get(1)?,
                category: row.get(2)?,
                duration: row.get(3)?,
                frequency: row.get(4)?,
                preferred_time: row.get(5)?,
                target: row.get(6)?,
                completed_dates: row.get(7)?,
                active: active_int != 0,
                created_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let habits: Vec<HabitModel> = habits_iter.filter_map(Result::ok).collect();

    // Load Routines
    let mut stmt_routines = conn
        .prepare("SELECT id, title, type, preferred_time, items, active FROM routines")
        .map_err(|e| e.to_string())?;
    let routines_iter = stmt_routines
        .query_map([], |row| {
            let active_int: i32 = row.get(5)?;
            Ok(RoutineModel {
                id: row.get(0)?,
                title: row.get(1)?,
                r#type: row.get(2)?,
                preferred_time: row.get(3)?,
                items: row.get(4)?,
                active: active_int != 0,
            })
        })
        .map_err(|e| e.to_string())?;
    let routines: Vec<RoutineModel> = routines_iter.filter_map(Result::ok).collect();

    // Load Goals
    let mut stmt_goals = conn
        .prepare("SELECT id, title, category, target_date, progress, description, projects FROM goals")
        .map_err(|e| e.to_string())?;
    let goals_iter = stmt_goals
        .query_map([], |row| {
            Ok(GoalModel {
                id: row.get(0)?,
                title: row.get(1)?,
                category: row.get(2)?,
                target_date: row.get(3)?,
                progress: row.get(4)?,
                description: row.get(5)?,
                projects: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let goals: Vec<GoalModel> = goals_iter.filter_map(Result::ok).collect();

    // Load Schedule Blocks
    let mut stmt_blocks = conn
        .prepare("SELECT id, title, block_type, item_id, date, start_time, end_time, category, is_fixed, completed FROM schedule_blocks")
        .map_err(|e| e.to_string())?;
    let blocks_iter = stmt_blocks
        .query_map([], |row| {
            let is_fixed: i32 = row.get(8)?;
            let completed: i32 = row.get(9)?;
            Ok(ScheduleBlockModel {
                id: row.get(0)?,
                title: row.get(1)?,
                block_type: row.get(2)?,
                item_id: row.get(3)?,
                date: row.get(4)?,
                start_time: row.get(5)?,
                end_time: row.get(6)?,
                category: row.get(7)?,
                is_fixed: is_fixed != 0,
                completed: completed != 0,
            })
        })
        .map_err(|e| e.to_string())?;
    let schedule_blocks: Vec<ScheduleBlockModel> = blocks_iter.filter_map(Result::ok).collect();

    // Load History
    let mut stmt_history = conn
        .prepare("SELECT id, date, planned_minutes, completed_minutes, moved_minutes, skipped_minutes, completed_tasks_count, total_tasks_count, notes FROM history_logs ORDER BY date DESC")
        .map_err(|e| e.to_string())?;
    let history_iter = stmt_history
        .query_map([], |row| {
            Ok(HistoryLogModel {
                id: row.get(0)?,
                date: row.get(1)?,
                planned_minutes: row.get(2)?,
                completed_minutes: row.get(3)?,
                moved_minutes: row.get(4)?,
                skipped_minutes: row.get(5)?,
                completed_tasks_count: row.get(6)?,
                total_tasks_count: row.get(7)?,
                notes: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;
    let history: Vec<HistoryLogModel> = history_iter.filter_map(Result::ok).collect();

    Ok(FullAppState {
        tasks,
        habits,
        routines,
        goals,
        schedule_blocks,
        history,
    })
}

#[tauri::command]
fn save_task(task: TaskModel) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO tasks (
            id, title, description, duration, priority, status, deadline,
            scheduled_date, scheduled_start, scheduled_end, category,
            project_id, energy_level, flexibility, moved_count, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17)",
        params![
            task.id,
            task.title,
            task.description,
            task.duration,
            task.priority,
            task.status,
            task.deadline,
            task.scheduled_date,
            task.scheduled_start,
            task.scheduled_end,
            task.category,
            task.project_id,
            task.energy_level,
            task.flexibility,
            task.moved_count.unwrap_or(0),
            task.created_at,
            task.updated_at
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_task(id: String) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM schedule_blocks WHERE item_id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_habit(habit: HabitModel) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO habits (
            id, title, category, duration, frequency, preferred_time, target, completed_dates, active, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            habit.id,
            habit.title,
            habit.category,
            habit.duration,
            habit.frequency,
            habit.preferred_time,
            habit.target,
            habit.completed_dates,
            if habit.active { 1 } else { 0 },
            habit.created_at
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_habit(id: String) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM habits WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_routine(routine: RoutineModel) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO routines (id, title, type, preferred_time, items, active) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        params![
            routine.id,
            routine.title,
            routine.r#type,
            routine.preferred_time,
            routine.items,
            if routine.active { 1 } else { 0 }
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_routine(id: String) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM routines WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_goal(goal: GoalModel) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO goals (id, title, category, target_date, progress, description, projects) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            goal.id,
            goal.title,
            goal.category,
            goal.target_date,
            goal.progress,
            goal.description,
            goal.projects
        ],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn delete_goal(id: String) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM goals WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_schedule_blocks(blocks: Vec<ScheduleBlockModel>) -> Result<(), String> {
    let mut conn = init_database().map_err(|e| e.to_string())?;
    let tx = conn.transaction().map_err(|e| e.to_string())?;

    for b in blocks {
        tx.execute(
            "INSERT OR REPLACE INTO schedule_blocks (id, title, block_type, item_id, date, start_time, end_time, category, is_fixed, completed)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
            params![
                b.id,
                b.title,
                b.block_type,
                b.item_id,
                b.date,
                b.start_time,
                b.end_time,
                b.category,
                if b.is_fixed { 1 } else { 0 },
                if b.completed { 1 } else { 0 }
            ],
        )
        .map_err(|e| e.to_string())?;
    }
    tx.commit().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn save_setting(key: String, value: String) -> Result<(), String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT OR REPLACE INTO app_settings (key, value) VALUES (?1, ?2)",
        params![key, value],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_setting(key: String) -> Result<Option<String>, String> {
    let conn = init_database().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT value FROM app_settings WHERE key = ?1")
        .map_err(|e| e.to_string())?;
    let mut rows = stmt.query(params![key]).map_err(|e| e.to_string())?;
    if let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let val: String = row.get(0).map_err(|e| e.to_string())?;
        Ok(Some(val))
    } else {
        Ok(None)
    }
}

#[tauri::command]
async fn process_ai_command(context: AiRequestContext) -> Result<AiResponsePayload, String> {
    execute_ai_intent(context).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = init_database();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_all_data,
            save_task,
            delete_task,
            save_habit,
            delete_habit,
            save_routine,
            delete_routine,
            save_goal,
            delete_goal,
            save_schedule_blocks,
            save_setting,
            get_setting,
            process_ai_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
