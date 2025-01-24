import React, {useEffect, useState} from 'react';
import {useParams, useNavigate, Link} from 'react-router-dom';
import axios from 'axios';
import './TodoDetail.css';
import NewTodoForm from "./NewTodoForm";

const TodoDetail = () => {
    const apiUrl = "http://localhost:8182";
    const navigate = useNavigate();
    const {id} = useParams();
    const [todo, setTodo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false); // To toggle edit mode
    const [updatedDescription, setUpdatedDescription] = useState('');
    const [updatedDueDate, setUpdatedDueDate] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [subTodos, setSubTodos] = useState([]);

    useEffect(() => {
        axios
            .get(`${apiUrl}/api/todo/${id}`)
            .then((response) => {
                const { todo, childTodos } = response.data;
                setTodo(todo);
                setSubTodos(childTodos || []);
                setUpdatedDescription(todo.description);
                setUpdatedDueDate(todo.dueAt ? todo.dueAt : '');
                setLoading(false);
            })
            .catch((error) => {
                console.error('There was an error fetching the todo!', error);
                setError('Failed to fetch the todo.');
                setLoading(false);
            });
    }, [id]);



    const handleMarkAsCompleted = () => {
        if (!todo) {
            console.error('Todo is not defined');
            return;
        }

        axios
            .put(`${apiUrl}/api/todo/${id}`, {
                ...todo,
                isDone: !todo.isDone,
            })
            .then(() => {
                setTodo((prevTodo) => {
                    if (!prevTodo) {
                        console.error('Previous todo is not defined');
                        return todo; // fallback
                    }
                    return { ...prevTodo, isDone: !prevTodo.isDone };
                });
            })
            .catch((error) => {
                console.error('Error marking todo as completed', error);
            });
    };

    const handleDelete = () => {
        axios
            .delete(`${apiUrl}/api/todo/${id}`)
            .then(() => {
                navigate('/');
            })
            .catch((error) => {
                console.error('Error deleting todo', error);
            });
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        axios
            .put(`${apiUrl}/api/todo/${id}`, {
                ...todo,
                description: updatedDescription,
                dueAt: updatedDueDate,
            })
            .then(() => {
                setTodo((prevTodo) => ({
                    ...prevTodo,
                    description: updatedDescription,
                    dueAt: updatedDueDate,
                }));
                setIsEditing(false);
            })
            .catch((error) => {
                console.error('Error updating todo', error);
            });
    };

    const handleNewTodo = (newTodo) => {
        setSubTodos((prevTodos) => [...prevTodos, newTodo]);
        setShowForm(false);
    };


    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!todo) {
        return <div>Todo not found.</div>;
    }

    return (

        <div className="todo-detail">
            <button
                className="back-button"
                onClick={() => navigate('/')}
            >
                Back to main menu
            </button>
            <h2>Todo Details</h2>
            {isEditing ? (
                <form className="todo-form" onSubmit={handleUpdate}>
                    <div className="form-group">
                        <label>
                            Description: <input
                                type="text"
                                value={updatedDescription}
                                onChange={(e) => setUpdatedDescription(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Due Date: <input
                                type="date"
                                value={updatedDueDate}
                                onChange={(e) => setUpdatedDueDate(e.target.value)}
                                required
                            />
                        </label>
                    </div>
                    <button className="save-button" type="submit">
                        Save Changes
                    </button>
                    <button className="cancel-button" type="button" onClick={() => setIsEditing(false)}>
                        Cancel
                    </button>
                </form>
            ) : (
                <div className="todo-info">
                    <p>
                        <strong>Description:</strong> {todo.description}
                    </p>
                    <p>
                        <strong>Created At:</strong> {todo.createdAt}
                    </p>
                    <p>
                        <strong>Due At:</strong> {todo.dueAt}
                    </p>
                    <p>
                        <strong>Status:</strong> {todo.isDone ? 'Done' : 'In progress'}
                    </p>
                    <div className="action-buttons">
                        {!todo.isDone ? (
                            <button className="mark-done-button" onClick={handleMarkAsCompleted}>
                                Mark as Done
                            </button>
                        ) : (
                            <button className="mark-progress-button" onClick={handleMarkAsCompleted}>
                                Mark as In Progress
                            </button>
                        )}
                        <button className="edit-button" onClick={() => setIsEditing(true)}>
                            Edit Todo
                        </button>
                        <button className="delete-button" onClick={handleDelete}>
                            Delete Todo
                        </button>
                    </div>
                    <button
                        className="add-todo"
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancel' : 'Add New Child Todo'}
                    </button>
                    {showForm && <NewTodoForm onNewTodo={handleNewTodo} parentId={id}/>}

                    <div className="child-todos">
                        <h3>Child Todos</h3>
                        {subTodos.length > 0 ? (
                            <ul>
                                {subTodos.map((subTodo) => (
                                    <li key={subTodo.id} className="todo-item">
                                        <div className="todo-meta">
                                            <Link to={`/todo/${subTodo.id}`} className="todo-link">
                                                {subTodo.description}
                                            </Link>
                                        </div>
                                        <div className="todo-values">
                                            <div>Due: {new Date(subTodo.dueAt).toLocaleDateString()}</div>
                                            <div className={subTodo.isDone ? '' : 'in-progress'}>
                                                {subTodo.isDone ? 'Done' : 'In Progress'}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No sub-todos found.</p>
                        )}
                    </div>
                </div>
            )}
        </div>

    );
};

export default TodoDetail;