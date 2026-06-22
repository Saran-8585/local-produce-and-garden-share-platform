const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  produce_name: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Vegetables', 'Fruits', 'Herbs', 'Seeds & Saplings', 'Flowers', 'Other']
  },
  description: { type: String, default: '' },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  exchange_type: {
    type: String,
    required: true,
    enum: ['Free', 'Swap', 'Both']
  },
  swap_for: { type: String, default: '' },
  harvest_date: { type: String, required: true },
  available_until: { type: String, required: true },
  location_name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  status: {
    type: String,
    default: 'Available',
    enum: ['Available', 'Unavailable']
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('Listing', listingSchema);
