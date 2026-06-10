import express from 'express';
import { getAllContests, getContestById } from '../controllers/contestController.js';

const router = express.Router();

// Get all contests
router.get('/', getAllContests);

// Get contest by ID
router.get('/:id', getContestById);

export default router;
