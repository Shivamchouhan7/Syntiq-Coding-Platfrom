import jwt from 'jsonwebtoken';
import { getDb } from '../models/db.js';

export default function authMiddleware(req, res, next) {
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
    
    // Fetch current state of user from DB
    const db = getDb();
    const user = db.users.find(u => u.id === decoded.userId);

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication failed: User no longer exists'
      });
    }

    // Attach user (excluding password) to request
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication failed: Invalid or expired token'
    });
  }
}
