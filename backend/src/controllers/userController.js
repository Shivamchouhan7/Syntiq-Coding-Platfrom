import supabase from '../utils/supabase.js';

const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const formatUser = (user, submissions = [], calendar = []) => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullname: user.fullname,
    avatarColor: user.avatar_color || '#808080',
    xp: user.xp || 0,
    level: user.level || 1,
    streak: user.streak || 0,
    solvedCount: user.solved_count || { easy: 0, medium: 0, hard: 0, total: 0 },
    skills: user.skills || {
      "Arrays": 0,
      "Strings": 0,
      "DP": 0,
      "Trees": 0,
      "Graphs": 0,
      "Sorting": 0
    },
    contestHistory: [],
    recentSubmissions: submissions.map(sub => ({
      problem: sub.problems?.title || 'Unknown Problem',
      status: sub.status,
      lang: sub.language,
      runtime: sub.execution_time || 'N/A',
      time: timeAgo(sub.created_at)
    })),
    submissionCalendar: calendar,
    createdAt: user.created_at
  };
};

export const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Fetch user's recent submissions
    const { data: dbSubmissions } = await supabase
      .from('submissions')
      .select(`
        status,
        language,
        execution_time,
        created_at,
        problems (
          title
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch user's submissions in the last year to calculate contribution calendar
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    const { data: calendarSubs } = await supabase
      .from('submissions')
      .select('created_at')
      .eq('user_id', user.id)
      .gte('created_at', oneYearAgo.toISOString());

    const countMap = {};
    if (calendarSubs) {
      calendarSubs.forEach(sub => {
        try {
          const dStr = new Date(sub.created_at).toISOString().split('T')[0];
          countMap[dStr] = (countMap[dStr] || 0) + 1;
        } catch (e) {
          // ignore parsing error
        }
      });
    }

    const submissionCalendar = [];
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - 364); // One year ago

    for (let i = 0; i < 365; i++) {
      const dateStr = baseDate.toISOString().split("T")[0];
      const count = countMap[dateStr] || 0;
      submissionCalendar.push({ date: dateStr, count: Math.min(count, 4) });
      baseDate.setDate(baseDate.getDate() + 1);
    }

    const safeUser = formatUser(user, dbSubmissions || [], submissionCalendar);
    res.json({ status: 'success', user: safeUser });
  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({ status: 'error', message: 'Server error retrieving user profile' });
  }
};

