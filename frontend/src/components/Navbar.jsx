import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Terminal, Trophy, Compass, LogOut } from 'lucide-react';

export default function Navbar({ isLoggedIn, setIsLoggedIn, user }) {
  const navigate = useNavigate();

  const displayName = user?.username || 'User';
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/5 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-brand-primary/10 p-2 rounded-lg border border-brand-primary/30 group-hover:border-brand-primary/60 transition-all duration-300 glow-accent">
          <Terminal className="w-5 h-5 text-brand-primary" />
        </div>
        <span className="text-xl font-bold font-sans tracking-tight text-white group-hover:text-brand-primary transition-colors">
          SYN<span className="text-brand-primary">TIQ</span>
        </span>
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center gap-8">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => 
            `flex items-center gap-2 text-sm font-medium transition-all hover:text-brand-primary ${
              isActive ? 'text-brand-primary border-b-2 border-brand-primary pb-1' : 'text-slate-400 pb-1 border-b-2 border-transparent'
            }`
          }
        >
          <Compass className="w-4 h-4" />
          Problems
        </NavLink>
        <NavLink 
          to="/contests" 
          className={({ isActive }) => 
            `flex items-center gap-2 text-sm font-medium transition-all hover:text-brand-primary ${
              isActive ? 'text-brand-primary border-b-2 border-brand-primary pb-1' : 'text-slate-400 pb-1 border-b-2 border-transparent'
            }`
          }
        >
          <Trophy className="w-4 h-4" />
          Contests
        </NavLink>
        <NavLink 
          to="/leaderboard" 
          className={({ isActive }) => 
            `flex items-center gap-2 text-sm font-medium transition-all hover:text-brand-primary ${
              isActive ? 'text-brand-primary border-b-2 border-brand-primary pb-1' : 'text-slate-400 pb-1 border-b-2 border-transparent'
            }`
          }
        >
          <Trophy className="w-4 h-4 text-brand-warning" />
          Leaderboard
        </NavLink>
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Link 
              to={`/profile/${displayName}`}
              className="flex items-center gap-2 group px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/40 font-bold overflow-hidden">
                <span className="text-xs">{avatarInitial}</span>
              </div>
              <span className="hidden sm:inline text-sm text-slate-300 font-medium group-hover:text-white transition-colors">
                {displayName}
              </span>
            </Link>
            <button 
              id="nav-logout-btn"
              onClick={() => {
                setIsLoggedIn();
                navigate('/');
              }}
              className="text-slate-400 hover:text-brand-error p-2 rounded-lg hover:bg-white/5 transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <Link 
              id="nav-login-btn"
              to="/login" 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Log In
            </Link>
            <Link 
              id="nav-signup-btn"
              to="/signup" 
              className="text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary-hover px-4 py-2 rounded-lg transition-all duration-300 shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 border border-brand-primary/50"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
