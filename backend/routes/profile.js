const express     = require('express');
const router      = express.Router();
const User        = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/profile  — get logged-in user profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/profile  — update profile details
router.put('/', protect, async (req, res) => {
  try {
    const { name, phone, address, avatar } = req.body;
    const updates = {};
    if (name)    updates.name    = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (address) updates.address = address;
    if (avatar !== undefined) updates.avatar = avatar; // base64 or URL

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    // Also update the cached user in token response
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/profile/change-password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both current and new password are required' });

    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

    const user = await User.findById(req.user._id);
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save(); // pre-save hook hashes it

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;