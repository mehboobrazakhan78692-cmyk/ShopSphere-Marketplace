const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    location: {
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    manager: { type: String },
    contact: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
