import express from 'express';
import { verifyDocument, uploadDocument } from '../controllers/verification.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/verify', authMiddleware, verifyDocument);
router.post('/upload', authMiddleware, uploadDocument);

export default router;
