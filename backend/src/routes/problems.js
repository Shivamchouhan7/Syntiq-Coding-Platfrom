import express from 'express';
import { getAllProblems, getProblemById, createProblem, createProblemsBulk } from '../controllers/problemController.js';

const router = express.Router();

// Get list of all problems
router.get('/', getAllProblems);

// Get a single problem by ID
router.get('/:id', getProblemById);

// Bulk create problems
router.post('/bulk', createProblemsBulk);

// Create a new problem
router.post('/', createProblem);

export default router;
