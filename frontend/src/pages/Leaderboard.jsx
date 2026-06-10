import { useState } from 'react';
import { Trophy, Search, UserPlus, UserMinus, Star, Flame, Sparkles } from 'lucide-react';

const MOCK_LEADERBOARD = [
  { rank: 1, avatar: "A", username: "alex_coder", rating: 2840, solved: 342, streak: 45, isFriend: false },
  { rank: 2, avatar: "S", username: "sarah_dev", rating: 2610, solved: 298, streak: 12, isFriend: true },
  { rank: 3, avatar: "M", username: "mike_algorithms", rating: 2490, solved: 275, streak: 8, isFriend: false },
  { rank: 4, avatar: "K", username: "kate_structs", rating: 2210, solved: 189, streak: 0, isFriend: false },
  { rank: 5, avatar: "J", username: "john_dp", rating: 1980, solved: 145, streak: 3, isFriend: false }
];

export default function Leaderboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('global'); // global, friends
  const [leaderboardData, setLeaderboardData] = useState(MOCK_LEADERBOARD);


  const handleToggleFriend = (username) => {
    setLeaderboardData(prev =>
      prev.map(user =>
        user.username === username ? { ...user, isFriend: !user.isFriend } : user
      )
    );
  };

  const filteredData = leaderboardData.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'friends') {
      return matchesSearch && user.isFriend;
    }
    return matchesSearch;
  });

  // Split top 3 for special display
  const topThree = leaderboardData.slice(0, 3);

  return (
    <div className="min-h-[calc(100vh-76px)] bg-bg-darker text-white py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-success/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-warning/10 border border-brand-warning/20 text-xs font-semibold text-brand-warning mb-4 animate-pulse">
            <Trophy className="w-3.5 h-3.5" />
            Competitive Arena Standings
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-warning via-amber-400 to-brand-primary">Leaderboard</span>
          </h1>
          <p className="text-slate-400 text-base max-w-xl mx-auto">
            Rankings of top developers worldwide based on rating, problem accuracy, and active streaks.
          </p>
        </div>

        {/* Top 3 Podium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
          {/* Rank 2 */}
          {topThree[1] && (
            <div className="order-2 md:order-1 bg-bg-panel border border-white/5 rounded-2xl p-6 text-center hover:border-slate-400/30 transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-400 text-bg-darker font-bold w-8 h-8 rounded-full flex items-center justify-center border border-white/20">
                2
              </div>
              <div className="w-16 h-16 rounded-full bg-slate-500/20 border-2 border-slate-400 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                {topThree[1].avatar}
              </div>
              <h3 className="font-bold text-lg text-white">{topThree[1].username}</h3>
              <p className="text-xs text-slate-400 mb-4">Rating: {topThree[1].rating}</p>
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-4">
                <div>
                  <div className="text-slate-400">Solved</div>
                  <div className="font-semibold text-white">{topThree[1].solved}</div>
                </div>
                <div>
                  <div className="text-slate-400">Streak</div>
                  <div className="font-semibold text-brand-warning flex items-center justify-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 fill-brand-warning" />
                    {topThree[1].streak}d
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold/Featured) */}
          {topThree[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-brand-warning/10 to-bg-panel border border-brand-warning/30 rounded-2xl p-8 text-center hover:border-brand-warning/50 transition-all duration-300 transform hover:-translate-y-1.5 relative shadow-xl shadow-brand-warning/5">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-brand-warning text-bg-darker font-extrabold w-10 h-10 rounded-full flex items-center justify-center border-2 border-brand-warning/50 shadow-lg glow-accent">
                1
              </div>
              <div className="absolute top-4 right-4 text-brand-warning animate-bounce">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="w-20 h-20 rounded-full bg-brand-warning/20 border-2 border-brand-warning flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-brand-warning glow-accent">
                {topThree[0].avatar}
              </div>
              <h3 className="font-extrabold text-xl text-white">{topThree[0].username}</h3>
              <p className="text-sm text-brand-warning font-semibold mb-6">Rating: {topThree[0].rating}</p>
              <div className="grid grid-cols-2 gap-4 text-sm border-t border-white/10 pt-4">
                <div>
                  <div className="text-slate-400">Solved</div>
                  <div className="font-bold text-white text-base">{topThree[0].solved}</div>
                </div>
                <div>
                  <div className="text-slate-400">Streak</div>
                  <div className="font-bold text-brand-warning text-base flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 fill-brand-warning" />
                    {topThree[0].streak}d
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {topThree[2] && (
            <div className="order-3 bg-bg-panel border border-white/5 rounded-2xl p-6 text-center hover:border-amber-700/30 transition-all duration-300 transform hover:-translate-y-1 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center border border-white/20">
                3
              </div>
              <div className="w-16 h-16 rounded-full bg-amber-900/20 border-2 border-amber-700 flex items-center justify-center mx-auto mb-4 text-xl font-bold text-amber-600">
                {topThree[2].avatar}
              </div>
              <h3 className="font-bold text-lg text-white">{topThree[2].username}</h3>
              <p className="text-xs text-slate-400 mb-4">Rating: {topThree[2].rating}</p>
              <div className="grid grid-cols-2 gap-2 text-xs border-t border-white/5 pt-4">
                <div>
                  <div className="text-slate-400">Solved</div>
                  <div className="font-semibold text-white">{topThree[2].solved}</div>
                </div>
                <div>
                  <div className="text-slate-400">Streak</div>
                  <div className="font-semibold text-brand-warning flex items-center justify-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 fill-brand-warning" />
                    {topThree[2].streak}d
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-bg-panel border border-white/5 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="flex bg-bg-darker p-1 rounded-xl border border-white/5 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('global')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'global'
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Global List
            </button>
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'friends'
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Friends
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:max-w-xs">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user..."
              className="w-full bg-bg-darker border border-white/10 hover:border-white/20 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-bg-panel border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6 text-center">Rank</th>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6 text-center">Solved</th>
                  <th className="py-4 px-6 text-center">Rating</th>
                  <th className="py-4 px-6 text-center">Streak</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {filteredData.length > 0 ? (
                  filteredData.map((user) => (
                    <tr
                      key={user.username}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-4 px-6 font-bold text-center w-20">
                        {user.rank === 1 && <span className="text-brand-warning">🥇 1</span>}
                        {user.rank === 2 && <span className="text-slate-400">🥈 2</span>}
                        {user.rank === 3 && <span className="text-amber-700">🥉 3</span>}
                        {user.rank > 3 && <span className="text-slate-500">{user.rank}</span>}
                      </td>

                      {/* User Avatar + Username */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-slate-300 ${user.rank === 1 ? 'border-brand-warning/40 text-brand-warning' : ''}`}>
                            {user.avatar}
                          </div>
                          <div>
                            <span className="font-semibold text-white group-hover:text-brand-primary transition-colors block">
                              {user.username}
                            </span>
                            {user.isFriend && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-brand-success font-semibold mt-0.5">
                                <Star className="w-2.5 h-2.5 fill-brand-success" />
                                Friend
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Solved Problems */}
                      <td className="py-4 px-6 text-center font-semibold text-slate-200">
                        {user.solved}
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-6 text-center">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          user.rating >= 2500 
                            ? 'bg-brand-error/10 text-brand-error border border-brand-error/20' 
                            : user.rating >= 2000 
                            ? 'bg-brand-warning/10 text-brand-warning border border-brand-warning/20'
                            : 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20'
                        }`}>
                          {user.rating}
                        </span>
                      </td>

                      {/* Streak */}
                      <td className="py-4 px-6 text-center">
                        {user.streak > 0 ? (
                          <span className="inline-flex items-center gap-1 text-brand-warning font-semibold">
                            <Flame className="w-4 h-4 fill-brand-warning" />
                            {user.streak}d
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleFriend(user.username)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            user.isFriend
                              ? 'bg-white/5 border-white/10 hover:bg-brand-error/10 hover:border-brand-error/30 hover:text-brand-error text-slate-400'
                              : 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary hover:bg-brand-primary hover:text-white'
                          }`}
                        >
                          {user.isFriend ? (
                            <>
                              <UserMinus className="w-3.5 h-3.5" />
                              Unfriend
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-3.5 h-3.5" />
                              Add Friend
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500">
                      No competitors found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
