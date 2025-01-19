import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

const ToDoSqlite = () => {
    const [todos, setTodos] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        loadTodos();
    }, []);

    const loadTodos = async () => {
        const todos = await invoke("get_all_todos");
        setTodos(todos);
    };

    const addTodo = async () => {
        if (input.trim() === "") return;
        await invoke("add_todo", { task: input });
        setInput('');
        loadTodos();
    };

    const removeTodo = async (id) => {
        await invoke("delete_todo", { id: id });
        loadTodos();
    };

    const toggleTodo = async (id) => {
        await invoke("toggle_todo", { id: id });
        loadTodos();
    }

    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>TODO App</h1>
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

export default ToDoSqlite;
