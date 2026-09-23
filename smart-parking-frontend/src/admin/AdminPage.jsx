import { useState } from 'react';
import Header from '../components/Header';
import AdminPanel from './AdminPanel';
import './admin.css';

const ADMIN_ID = 'admin';
const ADMIN_PASSWORD = 'admin1234';

function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (id === ADMIN_ID && password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid ID or password');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="app">
        <Header />
        <div className="admin-login">
          <form className="admin-login-form" onSubmit={handleLogin}>
            <h2>Admin Login</h2>
            <label>
              ID
              <input value={id} onChange={(e) => setId(e.target.value)} autoFocus />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error && <p className="parking-form-error">{error}</p>}
            <button type="submit" className="btn">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <AdminPanel />
    </div>
  );
}

export default AdminPage;
