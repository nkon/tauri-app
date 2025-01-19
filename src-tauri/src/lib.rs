mod todo_sqlite;
use todo_sqlite::{add_todo, delete_todo, get_all_todos, toggle_todo};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(todo_sqlite::Database::new("todo.db"))
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_all_todos,
            add_todo,
            toggle_todo,
            delete_todo
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
