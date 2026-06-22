const mongoose = require('mongoose');

const exchangeRequestSchema = new mongoose.Schema({
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  offered_listing: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', default: null },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Accepted', 'Declined', 'Completed', 'Cancelled']
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

module.exports = mongoose.model('ExchangeRequest', exchangeRequestSchema);
