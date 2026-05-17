const { db } = require('../db/database');

exports.getStats = (req, res) => {
  try {
    const activeListings = db.prepare(
      "SELECT COUNT(*) as count FROM listings WHERE user_id = ? AND status = 'Available' AND date(available_until) >= date('now')"
    ).get(req.user.id).count;

    const completedExchanges = db.prepare(
      "SELECT COUNT(*) as count FROM exchange_requests WHERE (requester_id = ? OR owner_id = ?) AND status = 'Completed'"
    ).get(req.user.id, req.user.id).count;

    const givenFree = db.prepare(`
      SELECT COUNT(*) as count FROM exchange_requests er
      JOIN listings l ON er.listing_id = l.id
      WHERE (er.owner_id = ?) AND er.status = 'Completed' AND l.exchange_type = 'Free'
    `).get(req.user.id).count;

    const receivedFree = db.prepare(`
      SELECT COUNT(*) as count FROM exchange_requests er
      JOIN listings l ON er.listing_id = l.id
      WHERE (er.requester_id = ?) AND er.status = 'Completed' AND l.exchange_type = 'Free'
    `).get(req.user.id).count;

    res.json({
      activeListings,
      completedExchanges,
      givenFree,
      receivedFree
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

exports.getHistory = (req, res) => {
  try {
    const history = db.prepare(`
      SELECT er.id, er.status, er.created_at, er.updated_at,
             l.produce_name, l.category, l.exchange_type, l.quantity, l.unit,
             owner.name as owner_name, owner.id as owner_id,
             requester.name as requester_name, requester.id as requester_id,
             ol.produce_name as offered_produce_name,
             (SELECT COUNT(*) FROM reviews WHERE exchange_id = er.id AND reviewer_id = ?) as has_reviewed
      FROM exchange_requests er
      JOIN listings l ON er.listing_id = l.id
      JOIN users owner ON er.owner_id = owner.id
      JOIN users requester ON er.requester_id = requester.id
      LEFT JOIN listings ol ON er.offered_listing_id = ol.id
      WHERE (er.requester_id = ? OR er.owner_id = ?)
      ORDER BY er.updated_at DESC
    `).all(req.user.id, req.user.id, req.user.id);

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
