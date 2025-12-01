import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import * as validationMiddleware from '../middlewares/validation.middlewre.js';

const router = express.Router();

router.route('/signup').post(validationMiddleware.signupValidation, authController.signup);
router.route('/resend-verification').post(authController.resendVerification);
router.route('/verifiy').get(authController.verifyEmail);
router.route('/verifiy').post(authController.verifyEmail);
export default router;
