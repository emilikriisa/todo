import axios from "axios";
import {useState} from "react";

const NewTodoForm = ({ onNewTodo, parentId }) => {
    const apiUrl = "http://localhost:8182";
    const [description, setDescription] = useState('');
    const [dueAt, setDueAt] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        const newTodo = {
            description,
            dueAt,
            isDone: false, // Default status for new todos
            parentId // Add parentId if present
        };

        axios
            .post(`${apiUrl}/api/todo`, newTodo)
            .then((response) => {
                onNewTodo(response.data); // Notify parent of the new todo
                setDescription(''); // Clear form fields
                setDueAt('');
            })
            .catch((error) => {
                console.error('There was an error creating the todo!', error);
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
            <div>
                <label>Due Date:</label>
                <input
                    type="date"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    requiredn
                />
            </div>
            <button type="submit">Create Todo</button>
        </form>
    );
};

export default NewTodoForm;