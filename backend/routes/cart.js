const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// In-memory cart stored in user session via JWT
// Cart is stored in MongoDB on the User model as a virtual
// For simplicity, we use a cart array embedded in requests

// ---- GET /api/cart — get cart (from localStorage via frontend) ----
// Cart is managed on the frontend in localStorage and sent to backend only at checkout
// This route validates cart items against the database

router.post('/validate', protect, async (req, res) => {
  try {
    const { items } = req.body; // [{ productId, quantity }]
    if (!items || items.length === 0) {
      return res.json({ success: true, items: [], subtotal: 0 });
    }

    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (product && product.isActive) {
        const qty = Math.min(item.quantity, product.stock);
        const lineTotal = product.price * qty;
        subtotal += lineTotal;
        validatedItems.push({
          productId: product._id,
          name:      product.name,
          emoji:     product.emoji,
          price:     product.price,
          oldPrice:  product.oldPrice,
          image:     product.image,
          category:  product.category,
          quantity:  qty,
          stock:     product.stock,
          lineTotal
        });
      }
    }

    const deliveryCharge = subtotal >= 5000 ? 0 : 299;
    const total = subtotal + deliveryCharge;

    res.json({ success: true, items: validatedItems, subtotal, deliveryCharge, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
