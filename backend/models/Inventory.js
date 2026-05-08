const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    change: { type: Number, required: true }, // +ve for addition, -ve for sales/removal
    reason: { type: String, enum: ['restock', 'sale', 'return', 'adjustment', 'initial'], default: 'restock' },
    currentStock: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
