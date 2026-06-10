import express from 'express';
import { getAllProblems, getProblemById, createProblem } from '../controllers/problemController.js';

const router = express.Router();

// Get list of all problems
router.get('/', getAllProblems);

// Get a single problem by ID
router.get('/:id', getProblemById);

// Create a new problem
router.post('/', createProblem);

export default router;
