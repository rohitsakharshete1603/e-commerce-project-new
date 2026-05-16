const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod = 'COD', notes = '', subtotal = 0, deliveryCharge = 299, totalAmount } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items in order' });

    const enrichedItems = await Promise.all(items.map(async (item) => {
      let name = item.name || 'Product';
      let price = item.price || 0;
      let emoji = item.emoji || '🛋️';
      try {
        const product = await Product.findById(item.productId).lean();
        if (product) { name = product.name; price = product.price; emoji = product.emoji; }
      } catch (_) {}
      return { productId: item.productId, name, emoji, price, quantity: item.quantity || 1 };
    }));

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

    const finalSubtotal = subtotal || enrichedItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const finalDelivery = finalSubtotal >= 5000 ? 0 : (deliveryCharge || 299);
    const finalTotal = totalAmount || finalSubtotal + finalDelivery;

    const order = await Order.create({
      user: req.user._id, items: enrichedItems, deliveryAddress, paymentMethod, notes,
      subtotal: finalSubtotal, deliveryCharge: finalDelivery, totalAmount: finalTotal, estimatedDelivery,
    });

    res.status(201).json({
      success: true,
      order: {
        orderId: order._id, _id: order._id, items: order.items,
        deliveryAddress: order.deliveryAddress, paymentMethod: order.paymentMethod,
        subtotal: order.subtotal, deliveryCharge: order.deliveryCharge,
        totalAmount: order.totalAmount, status: order.status,
        estimatedDelivery: order.estimatedDelivery, createdAt: order.createdAt,
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, orders });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;