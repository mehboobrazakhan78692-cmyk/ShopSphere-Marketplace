const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
    type: {
      type: String,
      enum: ['inward', 'outward', 'return', 'adjustment'],
      required: true,
    },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    referenceId: { type: String }, // Order ID or Purchase Order ID
    comment: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who made the change
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
