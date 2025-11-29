const express = require('express');
const authController = require('../controllers/auth.controller');
const validationMiddleware = require('../middlewares/validation.middlewre');

const router = express.Router();

router.route('/signup').post(validationMiddleware.signupValidation, authController.signup);

module.exports = router;
