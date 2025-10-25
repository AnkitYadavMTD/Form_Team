import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AdminCreateForm from './pages/AdminCreateForm';
import AdminDashboard from './pages/AdminDashboard';
import PublicForm from './pages/PublicForm';
import Home from './pages/Home';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isPublicForm = location.pathname.startsWith('/form/');

  return (
    <div className="App">
      <header className={`App-header ${isPublicForm ? 'public-form-header' : ''}`}>
        <h1>Team Form Builder</h1>
      </header>
      {!isPublicForm && (
        <nav style={{ marginBottom: '20px' }}>
          <a href="/admin" style={{ marginRight: '10px' }}>Create Form</a>
          <a href="/admin/dashboard" style={{ marginRight: '10px' }}>Dashboard</a>
          <a href="/">Home</a>
        </nav>
      )}
      <main>
        <Routes>
          <Route path="/admin" element={<AdminCreateForm />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/form/:id" element={<PublicForm />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
