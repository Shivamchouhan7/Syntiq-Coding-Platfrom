import { Flame, Award, Calendar, CheckCircle2, XCircle, AlertTriangle, BarChart3, Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const DEFAULT_PROFILE = {
  username: "Anonymous Coder",
  level: 1,
  xp: 0,
  streak: 0,
  skills: { db: 0, algo: 0, math: 0, ds: 0 },
  submissionHistory: [],
  submissionCalendar: Array.from({ length: 365 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (364 - i));
    return {
      date: d.toISOString().split('T')[0],
      count: 0
    };
  })
};

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      setProfile(DEFAULT_PROFILE);
      setLoading(false);
      return;
    }

    setLoading(true);
    const encoded = encodeURIComponent(username);
    fetch(`http://localhost:5000/api/users/${encoded}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        if (data.status === 'success' && data.user) {
          setProfile(data.user);
        } else {
          setProfile(DEFAULT_PROFILE);
        }
      })
      .catch(() => setProfile(DEFAULT_PROFILE))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return (
    <div className="min-h-[calc(100vh-76px)] flex items-center justify-center text-slate-400">Loading profile...</div>
  );

  const maxXPForLevel = 25000;
  const xpPercentage = Math.min(100, Math.round(((profile ? profile.xp : 0) / maxXPForLevel) * 100));

  // Calendar dates: split into chunks of 7 for weeks
  const weeks = [];
  const calendarData = (profile && profile.submissionCalendar) || DEFAULT_PROFILE.submissionCalendar;
  for (let i = 0; i < calendarData.length; i += 7) {
    weeks.push(calendarData.slice(i, i + 7));
  }




  // Get submission status UI details
  const getStatusUI = (status) => {
    switch (status) {
      case 'Accepted':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-brand-success" />,
          bg: 'bg-brand-success/10 border-brand-success/20 text-brand-success'
        };
      case 'Wrong Answer':
        return {
          icon: <XCircle className="w-4 h-4 text-brand-error" />,
          bg: 'bg-brand-error/10 border-brand-error/20 text-brand-error'
        };
      case 'Time Limit Exceeded':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-brand-warning" />,
          bg: 'bg-brand-warning/10 border-brand-warning/20 text-brand-warning'
        };
      default:
        return {
          icon: <AlertTriangle className="w-4 h-4 text-slate-400" />,
          bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400'
        };
    }
  };

  // Get color for contribution levels
  const getContribColor = (count) => {
    switch (count) {
      case 0: return 'bg-white/[0.03] hover:bg-white/[0.08]';
      case 1: return 'bg-brand-primary/20 hover:bg-brand-primary/30';
      case 2: return 'bg-brand-primary/45 hover:bg-brand-primary/55';
      case 3: return 'bg-brand-primary/70 hover:bg-brand-primary/80';
      case 4: return 'bg-brand-primary hover:bg-brand-primary-hover glow-accent';
      default: return 'bg-white/[0.03]';
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] bg-bg-darker text-white py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-success/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Banner / Identity Section */}
        <div className="bg-bg-panel border border-white/5 rounded-2xl p-6 sm:p-8 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 glow-accent">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-brand-primary/20 border-2 border-brand-primary flex items-center justify-center font-bold text-3xl text-brand-primary relative shadow-lg glow-accent">
              <span>{profile.username.charAt(0).toUpperCase()}</span>
              {/* Level Badge */}
              <div className="absolute -bottom-2 -right-2 bg-brand-primary border border-white/10 px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-md">
                Lvl {profile.level}
              </div>
            </div>
            
            {/* Info */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{profile.fullname}</h1>
              <p className="text-slate-400 text-sm mt-0.5">@{profile.username}</p>
              
              {/* Level XP Bar */}
              <div className="mt-4 w-64">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>XP: {profile.xp.toLocaleString()} / {maxXPForLevel.toLocaleString()}</span>
                  <span>{xpPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-bg-darker border border-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brand-primary transition-all duration-500"
                    style={{ width: `${xpPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex gap-4 sm:gap-6">
            {/* Streak */}
            <div className="bg-bg-darker border border-white/5 rounded-xl px-5 py-4 text-center min-w-[100px]">
              <Flame className="w-6 h-6 text-brand-warning mx-auto mb-1 fill-brand-warning" />
              <div className="text-xl font-bold text-white">{profile.streak}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Active Streak</div>
            </div>

            {/* Total Solved */}
            <div className="bg-bg-darker border border-white/5 rounded-xl px-5 py-4 text-center min-w-[100px]">
              <Award className="w-6 h-6 text-brand-success mx-auto mb-1" />
              <div className="text-xl font-bold text-white">{profile.solvedCount.total}</div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Solved</div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Stats & Skills */}
          <div className="lg:col-span-1 space-y-8">
            
            {/* Difficulty Breakdown */}
            <div className="bg-bg-panel border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-primary" />
                Difficulty Solved
              </h2>

              <div className="space-y-4">
                {/* Easy */}
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-brand-success">Easy</span>
                    <span className="text-white">{profile.solvedCount.easy} <span className="text-xs text-slate-400">solved</span></span>
                  </div>
                  <div className="h-2 w-full bg-bg-darker rounded-full overflow-hidden">
                    <div className="h-full bg-brand-success" style={{ width: `${profile.solvedCount.total ? (profile.solvedCount.easy / profile.solvedCount.total) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Medium */}
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-brand-warning">Medium</span>
                    <span className="text-white">{profile.solvedCount.medium} <span className="text-xs text-slate-400">solved</span></span>
                  </div>
                  <div className="h-2 w-full bg-bg-darker rounded-full overflow-hidden">
                    <div className="h-full bg-brand-warning" style={{ width: `${profile.solvedCount.total ? (profile.solvedCount.medium / profile.solvedCount.total) * 100 : 0}%` }} />
                  </div>
                </div>

                {/* Hard */}
                <div>
                  <div className="flex justify-between text-sm font-semibold mb-1">
                    <span className="text-brand-error">Hard</span>
                    <span className="text-white">{profile.solvedCount.hard} <span className="text-xs text-slate-400">solved</span></span>
                  </div>
                  <div className="h-2 w-full bg-bg-darker rounded-full overflow-hidden">
                    <div className="h-full bg-brand-error" style={{ width: `${profile.solvedCount.total ? (profile.solvedCount.hard / profile.solvedCount.total) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Mastery */}
            <div className="bg-bg-panel border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Star className="w-5 h-5 text-brand-warning" />
                Topic Mastery
              </h2>
              <div className="space-y-4">
                {Object.entries(profile.skills).map(([skill, mastery]) => (
                  <div key={skill}>
                    <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                      <span>{skill}</span>
                      <span>{mastery}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-bg-darker rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-primary to-indigo-400" 
                        style={{ width: `${mastery}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Heatmap Calendar, Submissions, Contest History */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Heatmap Contribution Section */}
            <div className="bg-bg-panel border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-primary" />
                Activity Calendar
              </h2>
              
              {/* Heatmap Container */}
              <div className="p-3 bg-bg-darker/60 border border-white/5 rounded-xl overflow-x-auto">
                <div className="flex gap-[3px] min-w-[680px]">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-[3px]">
                      {week.map((day) => (
                        <div
                          key={day.date}
                          className={`w-[11px] h-[11px] rounded-[2px] transition-all cursor-pointer ${getContribColor(day.count)}`}
                          title={`${day.date}: ${day.count} submissions`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
                {/* Heatmap Legend */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-4 px-1">
                  <span>1 year ago</span>
                  <div className="flex items-center gap-1">
                    <span>Less</span>
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-white/[0.03]" />
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-brand-primary/20" />
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-brand-primary/45" />
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-brand-primary/70" />
                    <div className="w-2.5 h-2.5 rounded-[1px] bg-brand-primary" />
                    <span>More</span>
                  </div>
                  <span>Today</span>
                </div>
              </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-bg-panel border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-6">Recent Submissions</h2>
              <div className="space-y-3">
                {profile.recentSubmissions.map((sub, idx) => {
                  const statusUI = getStatusUI(sub.status);
                  return (
                    <div 
                      key={idx}
                      className="flex items-center justify-between p-3.5 bg-bg-darker border border-white/5 rounded-xl hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {statusUI.icon}
                        <div>
                          <span className="font-bold text-white block text-sm sm:text-base">{sub.problem}</span>
                          <span className="text-[11px] text-slate-500">{sub.time} • {sub.lang}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusUI.bg}`}>
                          {sub.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                          {sub.runtime}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contest History */}
            <div className="bg-bg-panel border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-6">Contest History</h2>
              <div className="space-y-4">
                {profile.contestHistory.map((contest, idx) => (
                  <div 
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-bg-darker border border-white/5 rounded-xl gap-4"
                  >
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">{contest.name}</h3>
                      <div className="flex gap-4 text-xs text-slate-400 mt-1">
                        <span>Rank: <strong className="text-slate-200">#{contest.rank}</strong></span>
                        <span>Solved: <strong className="text-slate-200">{contest.solved} / 4</strong></span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 border-white/5 pt-2 sm:pt-0">
                      <div>
                        <div className="text-[10px] text-slate-500 text-right uppercase tracking-wider">Rating Change</div>
                        <div className={`text-sm font-bold text-right ${contest.ratingChange >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>
                          {contest.ratingChange >= 0 ? `+${contest.ratingChange}` : contest.ratingChange}
                        </div>
                      </div>
                      <div className="h-8 w-px bg-white/5 hidden sm:block" />
                      <div>
                        <div className="text-[10px] text-slate-500 text-right uppercase tracking-wider">New Rating</div>
                        <div className="text-sm font-bold text-white text-right">{contest.currentRating}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
