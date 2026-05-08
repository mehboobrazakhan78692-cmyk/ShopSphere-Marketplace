const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Add new address
// @route   POST /api/auth/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  
  if (req.body.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses.push(req.body);
  await user.save();
  
  res.status(201).json({ success: true, data: user.addresses });
});

// @desc    Delete address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
  await user.save();
  res.json({ success: true, data: user.addresses });
});

// @desc    Update address
// @route   PUT /api/auth/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const index = user.addresses.findIndex(addr => addr._id.toString() === req.params.id);
  
  if (index === -1) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (req.body.isDefault) {
    user.addresses.forEach(addr => addr.isDefault = false);
  }

  user.addresses[index] = { ...user.addresses[index].toObject(), ...req.body };
  await user.save();
  
  res.json({ success: true, data: user.addresses });
});

module.exports = { addAddress, deleteAddress, updateAddress };
