const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { getUserProfile, registerUser, loginUser } = require('../controllers/userController');

// @route   POST /api/users/register
// @desc    Đăng ký tài khoản mới
router.post('/register', registerUser);

// @route   POST /api/users/login
// @desc    Đăng nhập hệ thống
router.post('/login', loginUser);

// @route   GET /api/users/profile
// @desc    Lấy thông tin cá nhân của user (Sẽ cần bảo mật sau)
router.get('/profile', protect, getUserProfile);

module.exports = router;