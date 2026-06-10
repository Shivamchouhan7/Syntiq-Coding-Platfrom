import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Signup({ onLogin }) {
  const navigate = useNavigate();
  const [fullname, setFullname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live password strength indicator logic
  const strength = useMemo(() => {
    if (!password) {
      return { label: 'None', val: 0, color: 'bg-slate-700' };
    }
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return { label: 'Weak', val: 33, color: 'bg-brand-error' };
    } else if (score <= 4) {
      return { label: 'Medium', val: 66, color: 'bg-brand-warning' };
    } else {
      return { label: 'Strong', val: 100, color: 'bg-brand-success' };
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname || !username || !email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match!");
      return;
    }
    if (!termsAccepted) {
      setErrorMsg("Please accept the Terms of Service.");
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, username, email, password })
      });

      const data = await res.json();

      if (data.status === 'success' && data.token) {
        onLogin(data.token, data.user);
        navigate('/dashboard');
      } else {
        setErrorMsg(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Unable to connect to server. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-76px)] flex items-center justify-center bg-bg-darker px-4 py-12">
      {/* Background radial glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-brand-primary/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-bg-panel border border-white/5 rounded-2xl p-8 relative z-10 glow-accent">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-brand-primary/10 p-2.5 rounded-xl border border-brand-primary/30 mb-2">
            <Terminal className="w-6 h-6 text-brand-primary" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-sm mt-0.5">Start your coding practice journey</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 bg-brand-error/10 border border-brand-error/30 text-brand-error text-sm font-medium px-4 py-3 rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1" htmlFor="fullname">
              Full Name
            </label>
            <input
              id="fullname"
              type="text"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              placeholder="Alex Rivera"
              className="w-full bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              required
            />
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="competitor_unleashed"
              className="w-full bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1" htmlFor="signup-email">
              Email Address
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1" htmlFor="signup-password">
              Password
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl pl-4 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
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
            
            {/* Live Password Strength Meter */}
            {password && (
              <div className="mt-2">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                  <span>Strength: <span className="font-semibold text-white">{strength.label}</span></span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${strength.color} transition-all duration-500`} 
                    style={{ width: `${strength.val}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1" htmlFor="confirm-password">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
              required
            />
            {confirmPassword && password !== confirmPassword && (
              <span className="text-xs text-brand-error mt-1 block">Passwords do not match</span>
            )}
          </div>

          {/* Terms checkbox */}
          <div className="flex items-center">
            <input
              id="terms-checkbox"
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="w-4 h-4 rounded bg-bg-darker border-white/10 text-brand-primary focus:ring-brand-primary focus:ring-offset-bg-darker"
              required
            />
            <label htmlFor="terms-checkbox" className="ml-2 text-sm text-slate-400 select-none">
              I agree to the <a href="#" className="text-brand-primary hover:underline">Terms of Service</a> & <a href="#" className="text-brand-primary hover:underline">Privacy Policy</a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            id="signup-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-primary hover:bg-brand-primary-hover disabled:bg-brand-primary/50 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md shadow-brand-primary/20 hover:shadow-brand-primary/35 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer link */}
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-primary hover:text-brand-primary-hover transition-colors">
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
}
