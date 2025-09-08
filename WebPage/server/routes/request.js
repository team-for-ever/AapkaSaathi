import express from 'express';
import { createRequest, updateRequest, getRequests, getRequestById, deleteRequest } from '../controllers/request.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createRequest);
router.put('/:id', verifyToken, updateRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.delete('/:id', verifyToken, deleteRequest);

export default router;
