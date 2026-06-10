import jwt from 'jsonwebtoken';
import supabase from '../utils/supabase.js';

const formatUser = (user) => {
  if (!user) return null;
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
    recentSubmissions: [],
    createdAt: user.created_at
  };
};

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed: No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction');
    
    // Check if the decoded.userId is a valid UUID to prevent Postgres syntax errors
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decoded.userId);
    if (!isValidUuid) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed: Invalid user ID format'
      });
    }

    // Fetch current state of user from Supabase profiles
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed: User no longer exists'
      });
    }

    // Attach formatted user to request
    req.user = formatUser(user);
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed: Invalid or expired token'
    });
  }
}
