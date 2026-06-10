import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Calendar, Users, Clock, CheckCircle2 } from 'lucide-react';

export default function Contests({ isLoggedIn }) {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Register toggler for mock user
  const handleRegister = (id) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setContests(prev => prev.map(c => {
      if (c.id === id) {
        const alreadyReg = c.registered;
        return {
          ...c,
          registered: !alreadyReg,
          participants: alreadyReg ? c.participants - 1 : c.participants + 1
        };
      }
      return c;
    }));
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/contests')
      .then(res => res.json())
      .then(data => {
        const list = data.contests || [];
        
        // Map to include target timestamps for ticking countdowns
        const mapped = list.map(c => {
          let targetTime = null;
          if (c.status === 'live') {
            const parts = (c.countdown || '00:45:12').split(':');
            if (parts.length === 3) {
              const h = parseInt(parts[0], 10) || 0;
              const m = parseInt(parts[1], 10) || 0;
              const s = parseInt(parts[2], 10) || 0;
              targetTime = Date.now() + (h * 3600 + m * 60 + s) * 1000;
            } else {
              targetTime = Date.now() + 45 * 60 * 1000;
            }
          } else if (c.status === 'upcoming') {
            const match = (c.countdown || '').match(/Starts in (\d+)h (\d+)m/);
            if (match) {
              const h = parseInt(match[1], 10) || 0;
              const m = parseInt(match[2], 10) || 0;
              targetTime = Date.now() + (h * 3600 + m * 60) * 1000;
            } else {
              targetTime = Date.now() + 135 * 60 * 1000; // 2h 15m fallback
            }
          }

          return {
            ...c,
            targetTime,
            // default registered state (can mock/read)
            registered: c.id === 'c1' || c.id === 'c3'
          };
        });

        setContests(mapped);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching contests:', err);
        setLoading(false);
      });
  }, []);

  // Timer Tick useEffect
  useEffect(() => {
    if (contests.length === 0) return;

    const interval = setInterval(() => {
      setContests(prev => prev.map(c => {
        if (!c.targetTime) return c;
        const diff = c.targetTime - Date.now();
        let newCountdown = '';
        
        if (diff <= 0) {
          newCountdown = c.status === 'live' ? 'Ended' : 'Starting...';
        } else {
          const sec = Math.floor(diff / 1000) % 60;
          const min = Math.floor(diff / (1000 * 60)) % 60;
          const hour = Math.floor(diff / (1000 * 60 * 60));
          const pad = (n) => String(n).padStart(2, '0');

          if (c.status === 'live') {
            newCountdown = `${pad(hour)}:${pad(min)}:${pad(sec)}`;
          } else {
            newCountdown = `Starts in ${hour}h ${min}m ${sec}s`;
          }
        }

        return {
          ...c,
          countdown: newCountdown
        };
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [contests.length]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 bg-bg-darker min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Synchronizing competitive arena with Supabase...</p>
        </div>
      </div>
    );
  }

  const liveContests = contests.filter(c => c.status === 'live');
  const upcomingContests = contests.filter(c => c.status === 'upcoming');
  const pastContests = contests.filter(c => c.status === 'past');

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-bg-darker min-h-screen space-y-10">
      
      {/* Lobby Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Trophy className="w-8 h-8 text-brand-primary" />
            Competitive Arena
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Participate in real-time coding events, gain rating points, and test your speed limits.
          </p>
        </div>

        {liveContests.length > 0 && (
          <div className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-4 py-2.5 rounded-xl">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-ping" />
            <span className="text-xs text-brand-primary font-bold">{liveContests.length} Active Live Contest{liveContests.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* 1. LIVE CONTESTS SECTION */}
      {liveContests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-brand-primary uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
            Live Now
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {liveContests.map(c => (
              <div 
                key={c.id} 
                className="bg-gradient-to-br from-bg-panel to-bg-panel/40 border border-brand-primary/30 rounded-2xl p-6 relative overflow-hidden glow-accent flex flex-col justify-between"
              >
                {/* Background lighting */}
                <div className="absolute top-[-20%] right-[-10%] w-36 h-36 rounded-full bg-brand-primary/10 blur-2xl pointer-events-none" />

                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs text-brand-primary font-bold px-2 py-0.5 rounded bg-brand-primary/10 border border-brand-primary/20 uppercase tracking-wide">
                      Rated Contest
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      Ends in {c.countdown}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">{c.name}</h3>
                  <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                    Four problems spanning basic hashing up to advanced dynamic programming. Speed and precision determine rankings.
                  </p>
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-brand-primary" />
                      {c.participants} active
                    </div>
                    <div>Duration: <span className="text-white font-bold">{c.duration}</span></div>
                  </div>

                  <Link
                    id={`enter-contest-${c.id}`}
                    to={isLoggedIn ? `/contest/${c.id}` : '/login'}
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-brand-primary/20"
                  >
                    Enter Arena
                  </Link>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. UPCOMING CONTESTS SECTION */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upcoming Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingContests.map(c => (
            <div 
              key={c.id} 
              className="bg-bg-panel border border-white/5 hover:border-white/10 rounded-2xl p-6 flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-400 font-semibold px-2 py-0.5 rounded bg-white/5 border border-white/10 uppercase tracking-wide">
                    {c.difficulty} Track
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-brand-warning font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {c.countdown}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{c.name}</h3>
                <p className="text-slate-400 text-xs mb-6 leading-relaxed">
                  Join other coders for this competitive challenge. Perfect for polishing skills on {c.difficulty.toLowerCase()} level concepts.
                </p>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-4">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {c.participants} registered
                  </div>
                  <div>Duration: <span className="text-white font-bold">{c.duration}</span></div>
                </div>

                <button
                  id={`register-contest-${c.id}`}
                  onClick={() => handleRegister(c.id)}
                  className={`text-xs font-bold px-5 py-2.5 rounded-xl transition-all border flex items-center gap-1 ${
                    c.registered 
                      ? 'bg-brand-success/15 border-brand-success/30 text-brand-success' 
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {c.registered ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Registered
                    </>
                  ) : (
                    'Register Now'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PAST CONTESTS SECTION */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Past Contests</h2>
        <div className="bg-bg-panel border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-bg-panel/40">
                  <th className="py-4 px-6">Contest Name</th>
                  <th className="py-4 px-6">Timeline</th>
                  <th className="py-4 px-6">Participants</th>
                  <th className="py-4 px-6">Difficulty</th>
                  <th className="py-4 px-6 text-right">Results</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {pastContests.map(c => (
                  <tr key={c.id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">{c.name}</td>
                    <td className="py-4 px-6 text-xs text-slate-400">{c.countdown}</td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-medium">{c.participants}</td>
                    <td className="py-4 px-6 text-xs">
                      <span className={`font-semibold ${
                        c.difficulty === 'Easy' ? 'text-brand-success' :
                        c.difficulty === 'Medium' ? 'text-brand-warning' :
                        'text-brand-error'
                      }`}>
                        {c.difficulty}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        id={`past-contest-${c.id}`}
                        to={isLoggedIn ? `/contest/${c.id}` : '/login'}
                        className="text-xs font-bold text-brand-primary hover:underline"
                      >
                        View Scoreboard &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
}
