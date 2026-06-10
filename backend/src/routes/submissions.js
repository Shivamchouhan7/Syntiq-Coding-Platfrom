import express from 'express';
import { submitCode, getSubmissionsHistory, getSubmissionById } from '../controllers/submissionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply authMiddleware to all submission routes
router.use(authMiddleware);

// Submit code for a problem (Run / Submit)
router.post('/', submitCode);

// Get submissions list/history
router.get('/', getSubmissionsHistory);

// Get detailed submission by ID
router.get('/:id', getSubmissionById);

export default router;
