import { useState, useMemo, useEffect } from 'react';
import { API_BASE } from '../config';
import { Link } from 'react-router-dom';
import { Search, Compass, ShieldAlert, Award, CheckCircle, HelpCircle, ArrowRight, Zap, Target } from 'lucide-react';

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Daily Coding Challenge Countdown
  const [challengeTarget] = useState(() => Date.now() + (6 * 3600 + 45 * 60 + 12) * 1000);
  const [challengeTime, setChallengeTime] = useState('');

  // Categories list
  const categories = ['All', 'Arrays', 'Strings', 'Trees', 'Graphs', 'DP', 'Sorting'];

  useEffect(() => {
    const token = localStorage.getItem('syntiq_token');
    
    // 1. Fetch problems
    const fetchProblems = fetch(`${API_BASE}/problems`)
      .then(res => res.json())
      .then(data => data.problems || [])
      .catch(err => {
        console.error('Fetch problems error:', err);
        return [];
      });

    // 2. Fetch submissions if logged in
    const fetchSubmissions = token
      ? fetch(`${API_BASE}/submissions`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => data.submissions || [])
          .catch(err => {
            console.error('Fetch submissions error:', err);
            return [];
          })
      : Promise.resolve([]);

    // 3. Fetch user profile if logged in
    const fetchProfile = token
      ? fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => data.user || null)
          .catch(err => {
            console.error('Fetch profile error:', err);
            return null;
          })
      : Promise.resolve(null);

    Promise.all([fetchProblems, fetchSubmissions, fetchProfile])
      .then(([probs, subs, profile]) => {
        // Map submission status to problems
        const mapped = probs.map(p => {
          const problemSubs = subs.filter(s => s.problemId === p.id);
          let status = 'new';
          if (problemSubs.some(s => s.status === 'Accepted')) {
            status = 'solved';
          } else if (problemSubs.length > 0) {
            status = 'attempted';
          }
          return { ...p, status };
        });
        setProblems(mapped);
        setUserProfile(profile);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error combining dashboard data:', err);
        setLoading(false);
      });
  }, []);

  // Challenge countdown tick
  useEffect(() => {
    const updateTime = () => {
      const diff = challengeTarget - Date.now();
      if (diff <= 0) {
        setChallengeTime('Ended');
        return;
      }
      const sec = Math.floor(diff / 1000) % 60;
      const min = Math.floor(diff / (1000 * 60)) % 60;
      const hour = Math.floor(diff / (1000 * 60 * 60));
      const pad = (n) => String(n).padStart(2, '0');
      setChallengeTime(`${pad(hour)}:${pad(min)}:${pad(sec)}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [challengeTarget]);

  // Handle filtering
  const filteredProblems = useMemo(() => {
    let filtered = problems;

    // Search filter
    if (search.trim()) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.statement && p.statement.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'All') {
      filtered = filtered.filter(p => p.difficulty === difficultyFilter);
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    return filtered;
  }, [problems, search, difficultyFilter, categoryFilter, statusFilter]);

  // Count user stats
  const totalSolved = problems.filter(p => p.status === 'solved').length;
  const totalCount = problems.length;
  const progressPercent = totalCount > 0 ? Math.round((totalSolved / totalCount) * 100) : 0;

  // Recommended problem
  const recommendedProblem = problems.find(p => p.recommended && p.status !== 'solved') || problems[0];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10 bg-bg-darker min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Synchronizing with Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-bg-darker min-h-screen">
      
      {/* Upper row: Header with Welcome */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Compass className="w-8 h-8 text-brand-primary" />
            Problem Explorer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Choose from curated tracks, practice algorithms, and benchmark your code execution.
          </p>
        </div>
        
        {/* Streak / XP summary */}
        <div className="flex gap-4">
          <div className="bg-bg-panel border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Streak</div>
              <div className="text-sm font-bold text-white">{userProfile ? `${userProfile.streak} Days` : '0 Days'}</div>
            </div>
          </div>
          <div className="bg-bg-panel border border-white/5 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center text-brand-primary">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">XP</div>
              <div className="text-sm font-bold text-white">{userProfile ? userProfile.xp : 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left is filter + table, Right is widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Problems & Filters (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-bg-panel border border-white/5 rounded-xl p-5 space-y-4">
            
            {/* Search + Categories scroll */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  id="problem-search"
                  type="text"
                  placeholder="Search problems by name or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  id="category-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                >
                  <option value="All">All Categories</option>
                  {categories.slice(1).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <select
                  id="status-filter"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-all"
                >
                  <option value="All">All Statuses</option>
                  <option value="solved">Solved</option>
                  <option value="attempted">Attempted</option>
                  <option value="new">New</option>
                </select>
              </div>
            </div>

            {/* Difficulty Pills */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/5">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2">Difficulty:</span>
              {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                <button
                  key={diff}
                  id={`diff-${diff.toLowerCase()}`}
                  onClick={() => setDifficultyFilter(diff)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    difficultyFilter === diff
                      ? 'bg-brand-primary/10 border-brand-primary text-brand-primary font-bold'
                      : 'bg-bg-darker border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

          </div>

          {/* Problems List Card */}
          <div className="bg-bg-panel border border-white/5 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-bg-panel/50">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Showing {filteredProblems.length} Problem{filteredProblems.length !== 1 && 's'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Title</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Difficulty</th>
                    <th className="py-4 px-6">Acceptance</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map((prob) => (
                      <tr 
                        key={prob.id} 
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Status Icon */}
                        <td className="py-4 px-6">
                          {prob.status === 'solved' ? (
                            <CheckCircle className="w-5 h-5 text-brand-success" />
                          ) : prob.status === 'attempted' ? (
                            <ShieldAlert className="w-5 h-5 text-brand-warning" />
                          ) : (
                            <HelpCircle className="w-5 h-5 text-slate-600" />
                          )}
                        </td>

                        {/* Title */}
                        <td className="py-4 px-6">
                          <Link 
                            to={`/problem/${prob.id}`} 
                            className="font-semibold text-white group-hover:text-brand-primary transition-colors text-sm"
                          >
                            {prob.title}
                          </Link>
                        </td>

                        {/* Category Tag */}
                        <td className="py-4 px-6">
                          <span className="text-xs text-slate-400 font-medium px-2.5 py-1 rounded-md bg-white/5">
                            {prob.category || 'General'}
                          </span>
                        </td>

                        {/* Difficulty */}
                        <td className="py-4 px-6">
                          <span className={`text-xs font-semibold ${
                            prob.difficulty === 'Easy' ? 'text-brand-success' :
                            prob.difficulty === 'Medium' ? 'text-brand-warning' :
                            'text-brand-error'
                          }`}>
                            {prob.difficulty}
                          </span>
                        </td>

                        {/* Acceptance */}
                        <td className="py-4 px-6 text-sm text-slate-400 font-medium">
                          {prob.acceptance || '0%'}
                        </td>

                        {/* Action Link */}
                        <td className="py-4 px-6 text-right">
                          <Link
                            id={`solve-btn-${prob.id}`}
                            to={`/problem/${prob.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-primary-hover transition-colors"
                          >
                            {prob.status === 'solved' ? 'Solve Again' : 'Solve'}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-slate-500">
                        No problems found matching the filters. Try refining your parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Right Side: Widgets (takes 1 col) */}
        <div className="space-y-6">
          
          {/* Progress Widget */}
          <div className="bg-bg-panel border border-white/5 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 rounded-full bg-brand-primary/5 blur-xl" />
            
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Practice Stats</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-white">{totalSolved} / {totalCount}</span>
              <span className="text-xs text-brand-success font-semibold px-2 py-0.5 rounded bg-brand-success/10">
                {progressPercent}% Solved
              </span>
            </div>
            
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-brand-success rounded-full transition-all duration-1000" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-bg-darker rounded-lg p-2 border border-white/5">
                <div className="text-brand-success font-bold text-sm">
                  {problems.filter(p => p.difficulty === 'Easy' && p.status === 'solved').length}
                </div>
                <div className="text-slate-400">Easy</div>
              </div>
              <div className="bg-bg-darker rounded-lg p-2 border border-white/5">
                <div className="text-brand-warning font-bold text-sm">
                  {problems.filter(p => p.difficulty === 'Medium' && p.status === 'solved').length}
                </div>
                <div className="text-slate-400">Medium</div>
              </div>
              <div className="bg-bg-darker rounded-lg p-2 border border-white/5">
                <div className="text-brand-error font-bold text-sm">
                  {problems.filter(p => p.difficulty === 'Hard' && p.status === 'solved').length}
                </div>
                <div className="text-slate-400">Hard</div>
              </div>
            </div>
          </div>

          {/* Daily Coding Challenge */}
          <div className="bg-gradient-to-br from-bg-panel to-bg-panel/40 border border-brand-primary/20 rounded-xl p-6 relative overflow-hidden glow-accent">
            <div className="absolute top-3 right-3">
              <Target className="w-5 h-5 text-brand-primary animate-pulse" />
            </div>
            
            <span className="text-[10px] font-bold tracking-widest text-brand-primary uppercase bg-brand-primary/10 border border-brand-primary/20 px-2 py-0.5 rounded">
              Daily Challenge
            </span>
            <h3 className="text-lg font-bold text-white mt-3 mb-1">Longest Palindromic Substring</h3>
            <p className="text-xs text-slate-400 mb-4">Solve to earn double XP and a +1 streak bonus today.</p>
            
            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-medium">Ends In</span>
                <span className="text-sm font-bold text-slate-300 font-mono">{challengeTime}</span>
              </div>
              
              <Link
                id="daily-challenge-btn"
                to="/problem/longest-palindromic-substring"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-brand-primary/20"
              >
                Solve Challenge
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Recommended Problem Widget */}
          {recommendedProblem && (
            <div className="bg-bg-panel border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Recommended for You</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      recommendedProblem.difficulty === 'Easy' ? 'bg-brand-success/10 text-brand-success border border-brand-success/20' :
                      recommendedProblem.difficulty === 'Medium' ? 'bg-brand-warning/10 text-brand-warning border border-brand-warning/20' :
                      'bg-brand-error/10 text-brand-error border border-brand-error/20'
                    }`}>
                      {recommendedProblem.difficulty}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{recommendedProblem.category}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{recommendedProblem.title}</h4>
                </div>
                
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {recommendedProblem.statement}
                </p>

                <Link
                  id="recom-solve-btn"
                  to={`/problem/${recommendedProblem.id}`}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1 mt-2"
                >
                  Jump to Problem
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
