import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as validationMiddleware from '../middlewares/validation.middlewre.js';

const router = express.Router();

router.route('/signup').post(validationMiddleware.signupValidation, authController.signup);
router.route('/resend-verification').post(authController.resendVerification);

export default router;
