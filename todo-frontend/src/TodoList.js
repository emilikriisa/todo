import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './TodoList.css';
import NewTodoForm from './NewTodoForm';

const TodoList = () => {
    const apiUrl = "http://localhost:8182";
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [filters, setFilters] = useState({
        description: '',
        dueAt: '',
        isDone: null,
    });

    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 300); // wait 300ms before applying filters
        return () => clearTimeout(timeoutId);
    }, [filters]);

    useEffect(() => {
        fetchTodos();
    }, [debouncedFilters]); // fetch todos when filters change

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
        setTodos((prevTodos) => [...prevTodos, newTodo]);
        setShowForm(false);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        let transformedValue;

        if (value === 'null') {
            transformedValue = null;
        } else if (value === 'true') {
            transformedValue = true;
        } else if (value === 'false') {
            transformedValue = false;
        } else {
            transformedValue = value;
        }

        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: transformedValue,
        }));
    };

    const getIsDoneValue = (isDone) => {
        if (isDone === null) {
            return 'null';
        } else if (isDone) {
            return 'true';
        } else {
            return 'false';
        }
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
                    value={getIsDoneValue(filters.isDone)}
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