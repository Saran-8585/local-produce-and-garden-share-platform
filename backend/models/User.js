const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  neighbourhood: { type: String, required: true },
  bio: { type: String, default: '' },
  avg_rating: { type: Number, default: 0 },
  total_reviews: { type: Number, default: 0 },
  total_listings: { type: Number, default: 0 },
  total_exchanges: { type: Number, default: 0 },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      delete ret.password;
    }
  }
});

module.exports = mongoose.model('User', userSchema);
