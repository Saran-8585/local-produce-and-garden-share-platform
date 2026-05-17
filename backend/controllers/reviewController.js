const { db } = require('../db/database');

exports.createReview = (req, res) => {
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

    const exchange = db.prepare(
      "SELECT * FROM exchange_requests WHERE id = ? AND status = 'Completed'"
    ).get(exchange_id);

    if (!exchange) {
      return res.status(404).json({ error: 'Completed exchange not found' });
    }

    if (exchange.requester_id !== req.user.id && exchange.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not part of this exchange' });
    }

    if (exchange.requester_id !== reviewee_id && exchange.owner_id !== reviewee_id) {
      return res.status(400).json({ error: 'Reviewee must be the other party in the exchange' });
    }

    const existing = db.prepare(
      'SELECT id FROM reviews WHERE exchange_id = ? AND reviewer_id = ? AND reviewee_id = ?'
    ).get(exchange_id, req.user.id, reviewee_id);

    if (existing) {
      return res.status(400).json({ error: 'You have already reviewed this exchange' });
    }

    const result = db.prepare(
      'INSERT INTO reviews (exchange_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?)'
    ).run(exchange_id, req.user.id, reviewee_id, rating, comment || '');

    const avgRating = db.prepare(
      'SELECT AVG(rating) as avg, COUNT(*) as count FROM reviews WHERE reviewee_id = ?'
    ).get(reviewee_id);

    db.prepare(
      'UPDATE users SET avg_rating = ?, total_reviews = ? WHERE id = ?'
    ).run(avgRating.avg || 0, avgRating.count || 0, reviewee_id);

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review' });
  }
};

exports.getUserReviews = (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT r.*, reviewer.name as reviewer_name, reviewer.neighbourhood as reviewer_neighbourhood,
             er.listing_id, l.produce_name
      FROM reviews r
      JOIN users reviewer ON r.reviewer_id = reviewer.id
      JOIN exchange_requests er ON r.exchange_id = er.id
      JOIN listings l ON er.listing_id = l.id
      WHERE r.reviewee_id = ?
      ORDER BY r.created_at DESC
    `).all(req.params.userId);

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
