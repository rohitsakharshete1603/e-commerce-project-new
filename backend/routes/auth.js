const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const userRes = (user, token) => ({
  success: true,
  token,
  user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, isAdmin: user.isAdmin, address: user.address },
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone = '' } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    if (await User.findOne({ email })) return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    const user = await User.create({ name, email, password, phone });
    res.status(201).json(userRes(user, genToken(user._id)));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    res.json(userRes(user, genToken(user._id)));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

module.exports = router;