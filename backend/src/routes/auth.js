import express from 'express';
import { signup, login, getMe } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Register a new user
router.post('/signup', signup);

// Login user
router.post('/login', login);

// Get current user profile (protected route)
router.get('/me', authMiddleware, getMe);

export default router;
