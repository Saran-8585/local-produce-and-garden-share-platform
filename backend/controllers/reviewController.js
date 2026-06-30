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

    if (req.user.id == reviewee_id) {
      return res.status(400).json({ error: 'Cannot review yourself' });
    }

    const exchange = ExchangeRequest.findOne({ listing: exchange_id, status: 'Completed' });
    if (!exchange) {
      return res.status(404).json({ error: 'Completed exchange not found' });
    }

    if (exchange.requester_id !== req.user.id && exchange.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not part of this exchange' });
    }

    if (exchange.requester_id !== reviewee_id && exchange.owner_id !== reviewee_id) {
      return res.status(400).json({ error: 'Reviewee must be the other party in the exchange' });
    }

    const existing = Review.findOne({
      exchange: exchange_id,
      reviewer: req.user.id,
      reviewee: reviewee_id,
    });

    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this exchange' });
    }

    const review = Review.create({
      exchange: exchange_id,
      reviewer: req.user.id,
      reviewee: reviewee_id,
      rating,
      comment: comment || '',
    });

    const stats = Review.getRatingStats(reviewee_id);
    User.update(reviewee_id, {
      avg_rating: Math.round(stats.avg * 10) / 10,
      total_reviews: stats.count,
    });

    res.status(201).json(review);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'You have already reviewed this exchange' });
    }
    res.status(500).json({ error: 'Failed to create review' });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = Review.findWithReviewer({ reviewee: req.params.userId });

    const enhanced = reviews.map(r => ({
      id: r.id,
      exchange_id: r.exchange_id,
      reviewer_id: r.reviewer_id,
      reviewee_id: r.reviewee_id,
      rating: r.rating,
      comment: r.comment,
      created_at: r.created_at,
      reviewer_name: r.reviewer_name,
      reviewer_neighbourhood: r.reviewer_neighbourhood,
      listing_id: r.listing_id,
      produce_name: r.produce_name,
    }));

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
