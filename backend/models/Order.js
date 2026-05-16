const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String },          // original product _id (string)
  name:      { type: String },
  emoji:     { type: String, default: '🛋️' },
  price:     { type: Number },
  quantity:  { type: Number, default: 1 },
}, { _id: false });

const addressSchema = new mongoose.Schema({
  name:     String,
  phone:    String,
  email:    String,
  street:   String,
  city:     String,
  state:    String,
  pincode:  String,
  landmark: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items:           { type: [orderItemSchema], required: true },
  deliveryAddress: addressSchema,
  paymentMethod:   { type: String, default: 'COD' },
  notes:           { type: String, default: '' },
  subtotal:        { type: Number, default: 0 },
  deliveryCharge:  { type: Number, default: 299 },
  totalAmount:     { type: Number, required: true },
  status:          { type: String, default: 'Processing',
                     enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] },
  isPaid:          { type: Boolean, default: false },
  isDelivered:     { type: Boolean, default: false },
  estimatedDelivery: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);