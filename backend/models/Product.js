const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },
  oldPrice:    { type: Number, default: 0 },
  emoji:       { type: String, default: '🛋️' },
  category:    { type: String, required: true, trim: true },
  badge:       { type: String, default: '' },   // 'New' | 'Best Seller' | 'Sale'
  stock:       { type: Number, default: 10 },
  rating:      { type: Number, default: 4, min: 0, max: 5 },
  numReviews:  { type: Number, default: 0 },
  material:    { type: String, default: 'Solid Wood' },
  dimensions:  { type: String, default: '' },
  warranty:    { type: String, default: '1 Year' },
}, { timestamps: true });

// Full-text search index on name and description
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);