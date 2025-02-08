import React, { useState, useEffect } from "react";
import Database from '@tauri-apps/plugin-sql';

const ToDoSqliteP = () => {
    const [db, setDB] = useState(null);
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const initDatabase = async () => {
            // database is created in ~/Library/Application Support/com.tauri-app.app/todoP.db
            const database = await Database.load("sqlite:todoP.db");
            setDB(database);
            await createTable(database);
            await loadTodos(database);
        };
        initDatabase();
    }, []);

    const createTable = async (database) => {
        await database.execute(`
            CREATE TABLE IF NOT EXISTS todos(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            task TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT 0
        )`);
    }

    const loadTodos = async (database = db) => {
        if (!database) return;
        const todos = await database.select("SELECT * from todos");
        setTodos(todos);
    }

    const addTodo = async () => {
        if (!db) return;
        if (input.trim() === "") return;
        await db.execute("INSERT INTO todos (task, completed) VALUES (?, ?)", [input, 0]);
        setInput("");
        loadTodos();
    }

    const toggleTodo = async (id) => {
        if (!db) return;
        await db.execute("UPDATE todos SET completed = NOT completed WHERE id = ?", [id]);
        loadTodos();
    }

    const removeTodo = async (id) => {
        if (!db) return;
        await db.execute("DELETE FROM todos WHERE id = ?", [id]);
        loadTodos();
    }

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>TODO App SQlite Plugin</h1>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a todo task"
            />
            <button onClick={addTodo}>Add</button>
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id}>
                        <span
                            style={{ textDecoration: todo.completed ? "line-through" : "none", }}
                            onClick={() => toggleTodo(todo.id)}>{todo.task}</span> <button onClick={() => removeTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ToDoSqliteP;
