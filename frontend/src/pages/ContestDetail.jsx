import { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { useParams, Link } from 'react-router-dom';
import { Trophy, ShieldAlert, Award, FileCode, Timer, CheckCircle, Flame } from 'lucide-react';

export default function ContestDetail({ isLoggedIn }) {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [contestProblems, setContestProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [activeSubTab, setActiveSubTab] = useState('problems'); // problems, leaderboard

  useEffect(() => {
    // 1. Fetch contest details
    const fetchContest = fetch(`${API_BASE}/contests/${id}`)
      .then(res => res.json())
      .then(data => data.contest || null)
      .catch(err => {
        console.error('Error fetching contest details:', err);
        return null;
      });

    // 2. Fetch problems
    const fetchProblems = fetch(`${API_BASE}/problems`)
      .then(res => res.json())
      .then(data => data.problems || [])
      .catch(err => {
        console.error('Error fetching problems:', err);
        return [];
      });

    Promise.all([fetchContest, fetchProblems]).then(([contestData, allProbs]) => {
      if (contestData) {
        const associatedProblems = allProbs.filter(p => contestData.problems.includes(p.id));
        setContestProblems(associatedProblems);
        setContest(contestData);
      }
      setLoading(false);
    });
  }, [id]);

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getContestCountdown = (c, currentTimestamp) => {
    if (!c) return '';
    const start = new Date(c.start_time).getTime();
    const end = new Date(c.end_time).getTime();

    if (c.status === 'live') {
      const diff = end - currentTimestamp;
      if (diff <= 0) return 'Ended';
      const sec = Math.floor(diff / 1000) % 60;
      const min = Math.floor(diff / (1000 * 60)) % 60;
      const hour = Math.floor(diff / (1000 * 60 * 60)) % 24;
      const pad = (n) => String(n).padStart(2, '0');
      return `${pad(hour)}:${pad(min)}:${pad(sec)}`;
    } else if (c.status === 'upcoming') {
      const diff = start - currentTimestamp;
      if (diff <= 0) return 'Starting...';
      const sec = Math.floor(diff / 1000) % 60;
      const min = Math.floor(diff / (1000 * 60)) % 60;
      const hour = Math.floor(diff / (1000 * 60 * 60)) % 24;
      const day = Math.floor(diff / (1000 * 60 * 60 * 24));
      const pad = (n) => String(n).padStart(2, '0');
      if (day > 0) {
        return `Starts in ${day}d ${hour}h ${min}m`;
      } else {
        return `Starts in ${hour}h ${min}m ${sec}s`;
      }
    } else {
      const endDate = new Date(c.end_time);
      const dateStr = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      return `Ended ${dateStr} at ${timeStr}`;
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 bg-bg-darker min-h-screen flex items-center justify-center">
        <div className="bg-bg-panel border border-brand-primary/30 w-full max-w-sm rounded-2xl p-6 glow-accent relative text-center">
          <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mx-auto mb-4 border border-brand-primary/30 glow-accent animate-pulse">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white">Contest Entry Required</h3>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            You must be logged in to participate in Syntiq contests, solve problems, and rank on the scoreboard.
          </p>
          <div className="flex gap-3 w-full mt-6">
            <Link
              to="/contests"
              className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-3 rounded-xl border border-white/10 transition-colors text-center"
            >
              Back to Lobby
            </Link>
            <Link
              to="/login"
              className="flex-grow bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-brand-primary/25 text-center flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 bg-bg-darker min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Synchronizing arena details with Supabase...</p>
        </div>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 bg-bg-darker min-h-screen text-center text-slate-400">
        <ShieldAlert className="w-16 h-16 text-brand-error/60 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Contest Not Found</h2>
        <p className="text-xs mb-6">The contest you are trying to view does not exist or has been deleted.</p>
        <Link to="/contests" className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-6 py-3 rounded-xl transition-all">
          Back to Contest Lobby
        </Link>
      </div>
    );
  }

  // Contest Specific Leaderboard (Mock Players combined with database scores if needed)
  const contestants = contest.scoreboard || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-bg-darker min-h-screen space-y-8">
      
      {/* Contest Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold">
        <Link to="/contests" className="text-slate-400 hover:text-white transition-colors">
          Contest Lobby
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-white">{contest.name}</span>
      </div>

      {/* Main Grid Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Tabs (Problems, Rules, Leaderboard) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <div className="bg-bg-panel border border-white/5 rounded-2xl p-6 relative overflow-hidden">
            {/* Ambient light glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-primary/5 blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                contest.status === 'live' ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 animate-pulse' :
                contest.status === 'upcoming' ? 'bg-brand-warning/10 text-brand-warning border border-brand-warning/20' :
                'bg-slate-800 text-slate-400'
              }`}>
                {contest.status}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">Difficulty: {contest.difficulty}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{contest.name}</h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
              Syntiq rating algorithms calculate points based on accuracy, edge case protection, and submission speed. No external modules allowed.
            </p>
          </div>

          {/* Sub Navigation */}
          <div className="flex border-b border-white/5 bg-bg-panel/20 rounded-xl overflow-hidden p-1">
            <button
              onClick={() => setActiveSubTab('problems')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'problems' ? 'bg-bg-panel text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-4 h-4" />
              Contest Problems ({contestProblems.length})
            </button>
            <button
              onClick={() => setActiveSubTab('leaderboard')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-lg transition-all ${
                activeSubTab === 'leaderboard' ? 'bg-bg-panel text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Standing Scoreboard
            </button>
          </div>

          {/* 1. Problems SubTab */}
          {activeSubTab === 'problems' && (
            <div className="space-y-4">
              {contest.status === 'upcoming' ? (
                <div className="bg-bg-panel border border-white/5 rounded-2xl p-8 text-center text-slate-400">
                  <ShieldAlert className="w-12 h-12 text-brand-warning/40 mx-auto mb-4" />
                  <h3 className="text-base font-bold text-white mb-2">Problem Set is Encrypted</h3>
                  <p className="text-xs leading-relaxed max-w-md mx-auto">
                    The problems will unlock automatically when the counter hits zero. Make sure you register beforehand to get a slot!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contestProblems.map((p, idx) => (
                    <div 
                      key={p.id}
                      className="bg-bg-panel border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center justify-between transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-sm text-slate-300">
                          {String.fromCharCode(65 + idx)}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm group-hover:text-brand-primary transition-colors">
                            {p.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-semibold">
                            <span className={
                              p.difficulty === 'Easy' ? 'text-brand-success' :
                              p.difficulty === 'Medium' ? 'text-brand-warning' :
                              'text-brand-error'
                            }>{p.difficulty}</span>
                            <span>•</span>
                            <span>Score: {100 * (idx + 1)} pts</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        id={`solve-contest-p-${p.id}`}
                        to={`/problem/${p.id}`}
                        className="bg-white/5 hover:bg-brand-primary hover:text-white border border-white/10 text-slate-300 text-xs font-semibold px-4 py-2 rounded-lg transition-all"
                      >
                        Code Solution
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. Leaderboard SubTab */}
          {activeSubTab === 'leaderboard' && (
            <div className="bg-bg-panel border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-bg-panel/40">
                    <th className="py-4 px-6 text-center w-16">Rank</th>
                    <th className="py-4 px-6">Contestant Name</th>
                    <th className="py-4 px-6 text-center">Solved</th>
                    <th className="py-4 px-6 text-center">Score</th>
                    <th className="py-4 px-6 text-right">Time Used</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {contestants.length > 0 ? (
                    contestants.map((c) => (
                      <tr 
                        key={c.rank} 
                        className={`hover:bg-white/[0.01] transition-colors`}
                      >
                        <td className="py-4 px-6 text-center font-bold text-slate-300">
                          {c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : c.rank}
                        </td>
                        <td className="py-4 px-6 font-medium text-white">{c.username}</td>
                        <td className="py-4 px-6 text-center text-slate-300 font-semibold">{c.solved ? c.solved.length : 0} / 4</td>
                        <td className="py-4 px-6 text-center font-bold text-brand-primary">{c.penalty ? 400 - c.penalty : 0} pts</td>
                        <td className="py-4 px-6 text-right text-slate-400 font-mono">{c.lastSubmit}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        No scoreboard entries yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

        {/* Right Column: Status Summary, Clock Timer */}
        <div className="space-y-6">
          
          {/* Live countdown widget */}
          <div className="bg-bg-panel border border-white/5 rounded-2xl p-6 text-center space-y-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <Timer className="w-4 h-4 text-brand-primary" />
              {contest.status === 'live' ? 'Time Remaining' : contest.status === 'upcoming' ? 'Starts In' : 'Contest Ended'}
            </h3>
            
            <div className={`${contest.status !== 'past' ? 'text-3xl font-extrabold text-white tracking-wider font-mono' : 'text-sm font-semibold text-slate-400'}`}>
              {getContestCountdown(contest, now)}
            </div>

            {contest.status === 'live' && (
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">My Progress</span>
                  <span className="font-bold text-white">0 / {contestProblems.length} Solved</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
            )}

            {contest.status === 'upcoming' && (
              <div className="bg-brand-success/10 border border-brand-success/20 rounded-xl p-3 flex items-center gap-2 text-left">
                <CheckCircle className="w-5 h-5 text-brand-success flex-shrink-0" />
                <span className="text-xs text-brand-success font-semibold leading-relaxed">
                  Your seat is reserved. A launch link will be sent to your profile inbox.
                </span>
              </div>
            )}
          </div>

          {/* Quick contest rules / info */}
          <div className="bg-bg-panel border border-white/5 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Official Arena Rules</h3>
            <ul className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <Flame className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>Penalty logic: 10 minutes penalty added for every failed submission compile.</span>
              </li>
              <li className="flex items-start gap-2">
                <Award className="w-4 h-4 text-brand-warning flex-shrink-0" />
                <span>Leaderboard rankings resolve immediately upon submission acceptance.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
