import express from 'express';
import { analyzeCode, getHint } from '../controllers/aiController.js';
// We might want to use authMiddleware here if we want to restrict AI to logged in users, 
// but for now we'll allow it if they are on the page. If auth is required, uncomment and add.
// import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// router.use(authMiddleware);

// POST /api/ai/analyze
router.post('/analyze', analyzeCode);

// POST /api/ai/hint
router.post('/hint', getHint);

export default router;
