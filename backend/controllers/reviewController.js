const Review = require('../models/Review');
const ExchangeRequest = require('../models/ExchangeRequest');
const User = require('../models/User');

exports.createReview = async (req, res) => {
  try {
    const { exchange_id, reviewee_id, rating, comment } = req.body;

    if (!exchange_id || !reviewee_id || !rating) {
      return res.status(400).json({ error: 'Exchange ID, reviewee, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (req.user.id === reviewee_id) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }

    const exchange = await ExchangeRequest.findOne({ _id: exchange_id, status: 'Completed' });
    if (!exchange) {
      return res.status(404).json({ error: 'Completed exchange not found' });
    }

    if (exchange.requester.toString() !== req.user.id && exchange.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not part of this exchange' });
    }

    if (exchange.requester.toString() !== reviewee_id && exchange.owner.toString() !== reviewee_id) {
      return res.status(400).json({ error: 'Reviewee must be the other party in the exchange' });
    }

    const existing = await Review.findOne({
      exchange: exchange_id,
      reviewer: req.user.id,
      reviewee: reviewee_id,
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this exchange' });
    }

    const review = await Review.create({
      exchange: exchange_id,
      reviewer: req.user.id,
      reviewee: reviewee_id,
      rating,
      comment: comment || '',
    });

    const stats = await Review.aggregate([
      { $match: { reviewee: review.reviewee } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);

    const { avg = 0, count = 0 } = stats[0] || {};
    await User.findByIdAndUpdate(reviewee_id, { avg_rating: Math.round(avg * 10) / 10, total_reviews: count });

    res.status(201).json(review);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You have already reviewed this exchange' });
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate('reviewer', 'name neighbourhood')
      .populate({
        path: 'exchange',
        select: 'listing',
        populate: { path: 'listing', select: 'produce_name' },
      })
      .sort({ created_at: -1 });

    const enhanced = reviews.map(r => ({
      ...r.toJSON(),
      reviewer_name: r.reviewer ? r.reviewer.name : null,
      reviewer_neighbourhood: r.reviewer ? r.reviewer.neighbourhood : null,
      listing_id: r.exchange && r.exchange.listing ? r.exchange.listing.id : null,
      produce_name: r.exchange && r.exchange.listing ? r.exchange.listing.produce_name : null,
    }));

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
