import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Globe, Eye, EyeOff, Loader2 } from 'lucide-react';

const Github = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password })
      });

      const data = await res.json();

      if (data.status === 'success' && data.token) {
        onLogin(data.token, data.user);
        navigate('/dashboard');
      } else {
        setErrorMsg(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = () => {
    // OAuth flow placeholder — not yet connected to a real provider
    setErrorMsg('OAuth login is not available yet. Please use email and password.');
  };

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center justify-center bg-bg-darker px-4 py-12">
      {/* Background radial glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-brand-primary/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-bg-panel border border-white/5 rounded-2xl p-8 relative z-10 glow-accent">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-primary/10 p-2.5 rounded-xl border border-brand-primary/30 mb-3">
            <Terminal className="w-6 h-6 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-1">Accelerate your coding journey with Syntiq</p>
        </div>
        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 bg-brand-error/10 border border-brand-error/30 text-brand-error text-sm font-medium px-4 py-3 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider" htmlFor="login-password">
                Password
              </label>
              <a href="#" className="text-xs font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors">
                Forgot Password?
              </a>
            </div>
            
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded bg-bg-darker border-white/10 text-brand-primary focus:ring-brand-primary focus:ring-offset-bg-darker"
            />
            <label htmlFor="remember-me" className="ml-2 text-sm text-slate-400 select-none">
              Remember me
            </label>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/35 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-6 items-center">
          <div className="flex-grow border-t border-white/5"></div>
          <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold uppercase tracking-wider">
            or continue with
          </span>
          <div className="flex-grow border-t border-white/5"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleOAuthLogin('github')}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 px-4 rounded-xl border border-white/5 hover:border-white/10 transition-all text-sm"
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
          <button
            type="button"
            onClick={() => handleOAuthLogin('google')}
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 px-4 rounded-xl border border-white/5 hover:border-white/10 transition-all text-sm"
          >
            <Globe className="w-4 h-4" />
            Google
          </button>
        </div>

        {/* Footer link */}
        <p className="mt-8 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors">
            Sign Up
          </Link>
        </p>

      </div>
    </div>
  );
}
