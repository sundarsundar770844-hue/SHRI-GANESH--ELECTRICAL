import express from 'express';
import { signup, login, googleAuth, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();
router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
