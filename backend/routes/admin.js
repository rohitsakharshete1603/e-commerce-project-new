const express     = require('express');
const router      = express.Router();
const Product     = require('../models/Product');
const Order       = require('../models/Order');
const User        = require('../models/User');
const { protect } = require('../middleware/auth');

// Admin guard middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next();
  res.status(403).json({ success: false, message: 'Admin access required' });
};

// ── DASHBOARD STATS ─────────────────────────────────────────
// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [totalProducts, totalOrders, totalUsers, orders] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.find().select('totalAmount status createdAt'),
    ]);
    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 }).limit(5)
      .populate('user', 'name email');
    res.json({ success: true, stats: { totalProducts, totalOrders, totalUsers, totalRevenue }, recentOrders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── PRODUCTS CRUD ────────────────────────────────────────────
// GET /api/admin/products
router.get('/products', protect, adminOnly, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/admin/products
router.post('/products', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PUT /api/admin/products/:id
router.put('/products/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── ORDERS ───────────────────────────────────────────────────
// GET /api/admin/orders
router.get('/orders', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).populate('user', 'name email');
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/admin/orders/:id/status
router.put('/orders/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// ── USERS ────────────────────────────────────────────────────
// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/admin/users/:id/toggle-admin
router.put('/users/:id/toggle-admin', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: 'Cannot change your own admin status' });
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ success: true, user: { _id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;