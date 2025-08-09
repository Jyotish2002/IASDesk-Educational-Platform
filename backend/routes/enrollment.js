import express from 'express';
import { enrollStudent, verifyPayment } from '../controllers/enrollmentController';
import { auth } from '../middleware/auth';
import { checkAdminEnrollment } from '../middleware/adminAuth';

const router = express.Router();

// Enrollment route
router.post('/enroll', auth, checkAdminEnrollment, enrollStudent);

// Payment verification route
router.post('/payment/verify', auth, checkAdminEnrollment, verifyPayment);

export default router;