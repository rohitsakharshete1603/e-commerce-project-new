const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, page = 1, limit = 9 } = req.query;
    const filter = {};
    if (category) filter.category = { $regex: new RegExp('^' + category + '$', 'i') };
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    const sortMap = { price_asc: { price: 1 }, price_desc: { price: -1 }, newest: { createdAt: -1 }, rating: { rating: -1 } };
    const sortObj = sortMap[sort] || { createdAt: -1 };
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(50, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, products, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (err) {
    if (err.kind === 'ObjectId') return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;