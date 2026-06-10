import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import ProblemDetail from './pages/ProblemDetail';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';

const API_BASE = 'http://localhost:5000/api';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // On mount, check localStorage for existing token and validate it
  useEffect(() => {
    const token = localStorage.getItem('syntiq_token');
    const storedUser = localStorage.getItem('syntiq_user');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
        // Optionally verify token against backend
        fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.status === 'success' && data.user) {
              setUser(data.user);
              localStorage.setItem('syntiq_user', JSON.stringify(data.user));
            } else {
              // Token expired or invalid
              handleLogout();
            }
          })
          .catch(() => {
            // Backend unreachable, keep local state
          });
      } catch {
        handleLogout();
      }
    }
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('syntiq_token', token);
    localStorage.setItem('syntiq_user', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('syntiq_token');
    localStorage.removeItem('syntiq_user');
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-bg-darker text-slate-200 font-sans">
        <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={handleLogout} user={user} />
        
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contests" element={<Contests isLoggedIn={isLoggedIn} />} />
            <Route path="/contest/:id" element={<ContestDetail isLoggedIn={isLoggedIn} />} />
            <Route path="/problem/:id" element={<ProblemDetail isLoggedIn={isLoggedIn} user={user} />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile/:username" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
