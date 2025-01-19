#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use rusqlite::{params, Connection};
use serde::Serialize;
use std::sync::Mutex;
use tauri::State;

#[derive(Serialize)]
pub struct Todo {
    id: i32,
    task: String,
    completed: bool,
}

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(path: &str) -> Self {
        let conn = Connection::open(path).expect("Failed to open database");
        conn.execute(
            "CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task TEXT NOT NULL,
                completed BOOLEAN NOT NULL
            )",
            [],
        )
        .expect("Failed to create table");

        Database {
            conn: Mutex::new(conn),
        }
    }

    fn get_all_todos(&self) -> Vec<Todo> {
        let conn = self.conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT id, task, completed FROM todos")
            .unwrap();
        let rows = stmt
            .query_map([], |row| {
                Ok(Todo {
                    id: row.get(0)?,
                    task: row.get(1)?,
                    completed: row.get(2)?,
                })
            })
            .unwrap();

        rows.filter_map(Result::ok).collect()
    }

    fn add_todo(&self, task: String) {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "INSERT INTO todos (task, completed) VALUES (?1, ?2)",
            params![task, false],
        )
        .unwrap();
    }

    fn toggle_todo(&self, id: i32) {
        let conn = self.conn.lock().unwrap();
        conn.execute(
            "UPDATE todos SET completed = NOT completed WHERE id = ?1",
            params![id],
        )
        .unwrap();
    }

    fn delete_todo(&self, id: i32) {
        let conn = self.conn.lock().unwrap();
        conn.execute("DELETE FROM todos WHERE id = ?1", params![id])
            .unwrap();
    }
}

#[tauri::command]
pub fn get_all_todos(db: State<'_, Database>) -> Vec<Todo> {
    db.get_all_todos()
}

#[tauri::command]
pub fn add_todo(db: State<'_, Database>, task: String) {
    db.add_todo(task);
}

#[tauri::command]
pub fn toggle_todo(db: State<'_, Database>, id: i32) {
    db.toggle_todo(id);
}

#[tauri::command]
pub fn delete_todo(db: State<'_, Database>, id: i32) {
    db.delete_todo(id);
}
