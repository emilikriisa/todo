import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TodoList.css';
import NewTodoForm from './NewTodoForm'; // Import the form component

const TodoList = () => {
    const apiUrl = "http://localhost:8182";  // Backend container URL
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false); // State to toggle form visibility
    const [filters, setFilters] = useState({
        description: '',
        dueAt: '',
        isDone: null,
    });

    const [debouncedFilters, setDebouncedFilters] = useState(filters); // Debounced filters

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 300); // Wait for 300ms before applying filters
        return () => clearTimeout(timeoutId); // Cleanup timeout
    }, [filters]);

    useEffect(() => {
        fetchTodos();
    }, [debouncedFilters]); // Fetch todos when debounced filters change

    const fetchTodos = () => {
        setLoading(true);
        axios
            .get(`${apiUrl}/api/todo`, { params: debouncedFilters })
            .then((response) => {
                setTodos(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('There was an error fetching the todos!', error);
                setLoading(false);
            });
    };

    const handleNewTodo = (newTodo) => {
        // Add the new todo to the list without refetching
        setTodos((prevTodos) => [...prevTodos, newTodo]);
        setShowForm(false); // Hide the form after submission
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value === 'null' ? null : value === 'true' ? true : value === 'false' ? false : value,
        }));
    };

    const handleFilterClear = () => {
        setFilters({ description: '', dueAt: '', isDone: null });
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Your To Do List</h2>
            <div className="filters">
                {/* Filter Section */}
                <input
                    type="text"
                    name="description"
                    value={filters.description}
                    onChange={handleFilterChange}
                    placeholder="Search by description..."
                />
                <input
                    type="date"
                    name="dueAt"
                    value={filters.dueAt}
                    onChange={handleFilterChange}
                />
                <select
                    name="isDone"
                    value={filters.isDone === null ? 'null' : filters.isDone ? 'true' : 'false'}
                    onChange={handleFilterChange}
                >
                    <option value="null">No Filter</option>
                    <option value="true">Done</option>
                    <option value="false">In Progress</option>
                </select>
                <button onClick={handleFilterClear}>Clear Filters</button>
            </div>
            <button
                className={showForm ? 'cancel' : 'add-todo'}
                onClick={() => setShowForm(!showForm)}
            >
                {showForm ? 'Cancel' : 'Add New Todo'}
            </button>
            {showForm && <NewTodoForm onNewTodo={handleNewTodo} />}
            {!showForm && <ul>
                {todos.map((todo) => (
                    <li key={todo.id} className="todo-item">
                        <div className="todo-meta">
                            <Link to={`/todo/${todo.id}`} className="todo-link">
                                {todo.description}
                            </Link>
                        </div>
                        <div className="todo-values">
                            <div>Due: {new Date(todo.dueAt).toLocaleDateString()}</div>
                            <div className={todo.isDone ? '' : 'in-progress'}>
                                {todo.isDone ? 'Done' : 'In Progress'}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            }
        </div>
    );
};

export default TodoList;