const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendTokenResponse, generateAccessToken } = require('../utils/tokenUtils');
const { logAnalytics } = require('../utils/postgresLogger');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(400);
    throw new Error('User already exists');
  }
  const user = await User.create({ name, email, password, phone, role });
  await logAnalytics('user_registration', 1, { userId: user._id, role: user.role });
  sendTokenResponse(user, 201, res);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }
  await logAnalytics('user_login', 1, { userId: user._id, role: user.role });
  sendTokenResponse(user, 200, res);
});

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Public
const logout = asyncHandler(async (req, res) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'User logged out' });
});

// @desc    Refresh token
// @route   GET /api/auth/refresh
// @access  Public
const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401);
    throw new Error('Refresh token not found');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401);
      throw new Error('User not found');
    }

    const accessToken = generateAccessToken(user._id);
    res.status(200).json({ success: true, token: accessToken });
  } catch (err) {
    res.status(401);
    throw new Error('Invalid refresh token');
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, data: user });
});

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json({ success: true, data: users });
});

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  await user.deleteOne();
  res.json({ success: true, message: 'User removed' });
});

// @desc    Update user role
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.role = req.body.role || user.role;
  const updatedUser = await user.save();
  res.json({ success: true, data: updatedUser });
});

// @desc    Update current user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  user.name  = req.body.name  || user.name;
  user.phone = req.body.phone || user.phone;
  // Don't allow changing email if another user has it
  if (req.body.email && req.body.email !== user.email) {
    const emailExists = await User.findOne({ email: req.body.email });
    if (emailExists) { res.status(400); throw new Error('Email already in use'); }
    user.email = req.body.email;
  }
  const updated = await user.save();
  res.json({ success: true, data: updated });
});

module.exports = { register, login, logout, refresh, getMe, getUsers, deleteUser, updateUserRole, updateProfile };
