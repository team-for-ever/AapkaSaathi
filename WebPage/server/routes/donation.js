import express from 'express';
import { createDonation, updateDonation, getDonations, getDonationById, deleteDonation } from '../controllers/donation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, createDonation);
router.put('/:id', verifyToken, updateDonation);
router.get('/', getDonations);
router.get('/:id', getDonationById);
router.delete('/:id', verifyToken, deleteDonation);

export default router;
