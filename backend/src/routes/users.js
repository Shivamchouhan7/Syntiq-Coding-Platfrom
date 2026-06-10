import express from 'express';
import { getUserByUsername } from '../controllers/userController.js';

const router = express.Router();

// Get public profile by username
router.get('/:username', getUserByUsername);

export default router;
