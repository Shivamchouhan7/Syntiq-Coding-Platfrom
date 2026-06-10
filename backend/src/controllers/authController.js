import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, saveDb } from '../models/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkeychangeinproduction';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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

    const db = getDb();

    // Check if user already exists
    const existingUser = db.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase()
    );

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Username or Email is already taken'
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUser = {
      id: `u_${Date.now()}`,
      username,
      email,
      password: hashedPassword,
      fullname,
      avatarColor: '#' + Math.floor(Math.random()*16777215).toString(16),
      xp: 0,
      level: 1,
      streak: 0,
      solvedCount: {
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
      },
      contestHistory: [],
      recentSubmissions: [],
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    saveDb(db);

    const token = generateToken(newUser.id);
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      status: 'success',
      token,
      user: userWithoutPassword
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

    const db = getDb();

    // Find user by username or email
    const user = db.users.find(
      u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === username.toLowerCase()
    );

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
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      status: 'success',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to authenticate user due to a server error'
    });
  }
};

export const getMe = (req, res) => {
  res.json({
    status: 'success',
    user: req.user
  });
};
