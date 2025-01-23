import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TodoList from './TodoList';
import TodoDetail from './TodoDetail';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TodoList />} />
                <Route path="/todo/:id" element={<TodoDetail />} />
            </Routes>
        </Router>
    );
};

export default App;