const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/user/:id').get(authController.getone);

module.exports = router;
