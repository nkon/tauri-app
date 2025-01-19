Tauri2 + React + JavaScriptでToDoアプリを作りたいです。RustのバックエンドはSQLiteとrusqliteを使ってフロントエンドと通信します。

---

以下に、Tauri 2 + React (JavaScript) を使った TODO アプリのプロジェクト構成を説明し、Rust バックエンド（SQLite + rusqlite）とフロントエンドコードを生成します。

プロジェクト構成
	1.	Rustバックエンド: rusqlite を使用してSQLiteと通信し、TODOデータのCRUD操作を提供します。
	2.	Reactフロントエンド: JavaScript で作成し、Tauriのinvokeを使ってバックエンドと通信します。

1. Rustバックエンドコード

Rustではrusqliteを使用してSQLiteと連携します。以下は、TODOリストのデータを操作するRustコードです。

src-tauri/src/main.rs
```rust
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use rusqlite::{params, Connection};
use serde::Serialize;
use std::sync::Mutex;
use tauri::{State, generate_handler};

#[derive(Serialize)]
struct Todo {
    id: i32,
    task: String,
    completed: bool,
}

struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    fn new(path: &str) -> Self {
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
        let mut stmt = conn.prepare("SELECT id, task, completed FROM todos").unwrap();
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
        conn.execute("INSERT INTO todos (task, completed) VALUES (?1, ?2)", params![task, false])
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
fn get_todos(db: State<'_, Database>) -> Vec<Todo> {
    db.get_all_todos()
}

#[tauri::command]
fn add_todo(db: State<'_, Database>, task: String) {
    db.add_todo(task);
}

#[tauri::command]
fn toggle_todo(db: State<'_, Database>, id: i32) {
    db.toggle_todo(id);
}

#[tauri::command]
fn delete_todo(db: State<'_, Database>, id: i32) {
    db.delete_todo(id);
}

fn main() {
    tauri::Builder::default()
        .manage(Database::new("todo.db"))
        .invoke_handler(generate_handler![get_todos, add_todo, toggle_todo, delete_todo])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}
```
2. Reactフロントエンドコード

Reactアプリを作成し、Tauriのinvokeを使ってバックエンドと通信します。

src/App.js
```javascript
import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api";

function App() {
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    const todos = await invoke("get_todos");
    setTodos(todos);
  };

  const addTodo = async () => {
    if (newTask.trim() === "") return;
    await invoke("add_todo", { task: newTask });
    setNewTask("");
    loadTodos();
  };

  const toggleTodo = async (id) => {
    await invoke("toggle_todo", { id });
    loadTodos();
  };

  const deleteTodo = async (id) => {
    await invoke("delete_todo", { id });
    loadTodos();
  };

  return (
    <div className="App">
      <h1>TODO App</h1>
      <div>
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New Task"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
              }}
              onClick={() => toggleTodo(todo.id)}
            >
              {todo.task}
            </span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```
3. 必要な依存関係

Rust側 (Cargo.toml)
```
[dependencies]
tauri = { version = "2.0", features = ["api-all"] }
rusqlite = "0.29"
serde = { version = "1.0", features = ["derive"] }
```
React側 (package.json)
```
npm install @tauri-apps/api
```
4. ディレクトリ構成
```
my-tauri-app/
├── src/
│   ├── App.js
│   ├── index.js
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   ├── Cargo.toml
```
これで、マルチプラットフォーム対応のTODOアプリが作成できます。RustのバックエンドでSQLiteを利用し、Reactでフロントエンドを構築しました。問題があれば教えてください！