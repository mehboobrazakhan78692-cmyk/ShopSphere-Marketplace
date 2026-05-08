const express = require('express');
const router = express.Router();
const { register, login, logout, refresh, getMe, getUsers, deleteUser, updateUserRole, updateProfile } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

const { registerValidationRules, loginValidationRules, validate } = require('../middleware/validateMiddleware');

const { addAddress, deleteAddress, updateAddress } = require('../controllers/addressController');

router.post('/register', registerValidationRules(), validate, register);
router.post('/login', loginValidationRules(), validate, login);
router.get('/logout', logout);
router.get('/refresh', refresh);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// Address Routes
router.route('/addresses').post(protect, addAddress);
router.route('/addresses/:id').put(protect, updateAddress).delete(protect, deleteAddress);

// Admin Routes
router.get('/users', protect, admin, getUsers);
router.route('/users/:id').delete(protect, admin, deleteUser);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
