import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MOCK_CONTESTS, MOCK_PROBLEMS } from '../data/mockData';
import { Trophy, ShieldAlert, Award, FileCode, Timer, CheckCircle, Flame } from 'lucide-react';

export default function ContestDetail() {
  const { id } = useParams();
  const contest = MOCK_CONTESTS.find(c => c.id === id) || MOCK_CONTESTS[0];

  const [activeSubTab, setActiveSubTab] = useState('problems'); // problems, leaderboard

  // Filter problems for contest (mock association)
  const contestProblems = MOCK_PROBLEMS.slice(0, 4);

  // Contest Specific Leaderboard (Mock Players)
  const contestants = [
    { rank: 1, name: "code_ninja_99", score: 400, time: "42:15", solved: 4 },
    { rank: 2, name: "lexical_genius", score: 380, time: "51:04", solved: 4 },
    { rank: 3, name: "competitor_unleashed", score: 290, time: "38:40", solved: 3 }, // simulated logged in user position
    { rank: 4, name: "stack_overflow_pioneer", score: 280, time: "49:10", solved: 3 },
    { rank: 5, name: "pointer_chaser", score: 180, time: "22:15", solved: 2 }
  ];

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
                  {contestants.map((c) => (
                    <tr 
                      key={c.rank} 
                      className={`hover:bg-white/[0.01] transition-colors ${
                        c.name === 'competitor_unleashed' ? 'bg-brand-primary/5 text-brand-primary font-semibold' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-center font-bold text-slate-300">
                        {c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : c.rank}
                      </td>
                      <td className="py-4 px-6 font-medium text-white">{c.name}</td>
                      <td className="py-4 px-6 text-center text-slate-300 font-semibold">{c.solved} / 4</td>
                      <td className="py-4 px-6 text-center font-bold text-brand-primary">{c.score} pts</td>
                      <td className="py-4 px-6 text-right text-slate-400 font-mono">{c.time}</td>
                    </tr>
                  ))}
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
            
            {contest.status !== 'past' ? (
              <div className="text-3xl font-extrabold text-white tracking-wider font-mono">
                {contest.countdown}
              </div>
            ) : (
              <div className="text-sm font-semibold text-slate-400">
                Completed on Jan 12, 2026
              </div>
            )}

            {contest.status === 'live' && (
              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">My Progress</span>
                  <span className="font-bold text-white">3 / 4 Solved</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: '75%' }} />
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
