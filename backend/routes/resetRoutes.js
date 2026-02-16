import express from 'express';
import { resetData } from '../controllers/resetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.post('/', protect, resetData);

export default router;
