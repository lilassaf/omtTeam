const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  // Top-level fields
  sys_id: { type: String, required: true, unique: true },
  number: { type: String },
  // Other order fields as needed...
  
  // The complete raw order data
  rawOrder: { type: Schema.Types.Mixed }, // Mixed type allows any structure
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add index for better query performance
orderSchema.index({ sys_id: 1 }, { unique: true });
orderSchema.index({ 'rawOrder.order.sys_id': 1 }); // Index the nested field

const Order = mongoose.model('order', orderSchema);

module.exports = Order;