import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../utils/supabase.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const formatUser = (user) => {
  if (!user) return null;
  const friends = user.skills?.friends || [];
  const cleanSkills = { ...user.skills };
  delete cleanSkills.friends;

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
    skills: cleanSkills,
    friends,
    contestHistory: [],
    recentSubmissions: [],
    createdAt: user.created_at
  };
};

// Generate Token helper
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const signup = async (req, res) => {
  try {
    const { username, email, password, fullname } = req.body;

    if (!username || !email || !password || !fullname) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields (username, email, password, fullname) are required'
      });
    }

    // Check if username already exists
    const { data: existingUserByUsername, error: usernameError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (usernameError) throw usernameError;
    if (existingUserByUsername) {
      return res.status(400).json({
        status: 'error',
        message: 'Username is already taken'
      });
    }

    // Check if email already exists
    const { data: existingUserByEmail, error: emailError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (emailError) throw emailError;
    if (existingUserByEmail) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already taken'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUser = {
      id: crypto.randomUUID(),
      username,
      email,
      password: hashedPassword,
      fullname,
      avatar_color: '#' + Math.floor(Math.random()*16777215).toString(16),
      xp: 0,
      level: 1,
      streak: 0,
      solved_count: {
        easy: 0,
        medium: 0,
        hard: 0,
        total: 0
      },
      skills: {
        "Arrays": 0,
        "Strings": 0,
        "DP": 0,
        "Trees": 0,
        "Graphs": 0,
        "Sorting": 0
      }
    };

    const { data: user, error: insertError } = await supabase
      .from('profiles')
      .insert([newUser])
      .select()
      .single();

    if (insertError) throw insertError;

    const token = generateToken(user.id);
    const safeUser = formatUser(user);

    res.status(201).json({
      status: 'success',
      token,
      user: safeUser
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to register user due to a server error'
    });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Username/Email and Password are required'
      });
    }

    // Find user by username or email
    const { data: user, error: findError } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.eq.${username},email.eq.${username}`)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw findError;
    }

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }

    // Compare passwords
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid username or password'
      });
    }

    const token = generateToken(user.id);
    const safeUser = formatUser(user);

    res.json({
      status: 'success',
      token,
      user: safeUser
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to authenticate user due to a server error'
    });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user contains { id } from authMiddleware
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();
      
    if (error || !user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }
    
    const safeUser = formatUser(user);

    res.json({
      status: 'success',
      user: safeUser
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch user'
    });
  }
};
