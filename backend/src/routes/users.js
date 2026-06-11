import express from 'express';
import { getUserByUsername, toggleFriend } from '../controllers/userController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Get public profile by username
router.get('/:username', getUserByUsername);

// Toggle friend status (protected route)
router.post('/toggle-friend', authMiddleware, toggleFriend);

export default router;
