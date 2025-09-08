import express from 'express';
import { createProfile, updateProfile, getProfile, getProfileById } from '../controllers/profile.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createProfile);
router.put('/', verifyToken, updateProfile);
router.get('/me', verifyToken, getProfile);
router.get('/:id', getProfileById);

export default router;
