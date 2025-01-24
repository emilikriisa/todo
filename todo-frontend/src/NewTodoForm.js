import axios from "axios";
import { useState } from "react";
import PropTypes from "prop-types";

const NewTodoForm = ({ onNewTodo, parentId }) => {
    const apiUrl = "http://localhost:8182";
    const [description, setDescription] = useState('');
    const [dueAt, setDueAt] = useState('');
    const [descriptionError, setDescriptionError] = useState('');
    const [dueAtError, setDueAtError] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        if (description.length > 100) {
            setDescriptionError("Description must be 100 characters or fewer.");
            return;
        }

        if (!description.trim()) {
            setDescriptionError("Please provide valid description.");
            return;
        }

        setDescriptionError('');

        const today = new Date().toISOString().split('T')[0]; // Get today's date in 'YYYY-MM-DD' format
        if (dueAt && dueAt < today) {
            setDueAtError("Due date must be a future date.");
            return;
        }

        setDueAtError('');

        const newTodo = {
            description,
            dueAt,
            isDone: false,
            parentId
        };

        axios
            .post(`${apiUrl}/api/todo`, newTodo)
            .then((response) => {
                onNewTodo(response.data); // notify parent of new to do
                setDescription('');
                setDueAt('');
            })
            .catch((error) => {
                console.error('There was an error creating the todo!', error);
                setDescriptionError("There was an error creating the todo.");
            });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Description:</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
            </div>
            {descriptionError && <div style={{ color: 'red', marginBottom: '10px' }}>{descriptionError}</div>}
            <div>
                <label>Due Date:</label>
                <input
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    required
                />
            </div>
            {dueAtError && <div style={{ color: 'red', marginBottom: '10px' }}>{dueAtError}</div>}

            <button type="submit">Create Todo</button>
        </form>
    );
};

NewTodoForm.propTypes = {
    onNewTodo: PropTypes.func.isRequired,
    parentId: PropTypes.string,
};

export default NewTodoForm;
