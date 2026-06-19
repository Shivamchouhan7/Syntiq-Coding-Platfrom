import express from 'express';
import {
  runCode,
  submitCode,
  getSubmissionsHistory,
  getSubmissionById,
} from '../controllers/submissionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All submission routes require authentication
router.use(authMiddleware);

// POST /api/submissions/run
// Run code against visible test cases only — no DB write
router.post('/run', runCode);

// POST /api/submissions/submit
// Submit code against all hidden test cases — saves to DB via Prisma
router.post('/submit', submitCode);

// GET /api/submissions/
// Return submission history for the authenticated user
router.get('/', getSubmissionsHistory);

// GET /api/submissions/:id
// Return a single submission by ID (scoped to authenticated user)
router.get('/:id', getSubmissionById);

export default router;
