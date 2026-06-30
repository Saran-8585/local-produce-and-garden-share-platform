const { getDB } = require('../db/database');
const Listing = require('../models/Listing');
const ExchangeRequest = require('../models/ExchangeRequest');
const Review = require('../models/Review');

exports.getStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = req.user.id;

    const activeListings = Listing.count({
      user: userId,
      status: 'Available',
      available_until: { $gte: todayStr },
    });

    const completedExchanges = ExchangeRequest.count({
      $or: [{ requester: userId }, { owner: userId }],
      status: 'Completed',
    });

    const givenFree = getDB().prepare(`
      SELECT COUNT(*) as count FROM exchange_requests er
      JOIN listings l ON er.listing_id = l.id
      WHERE er.owner_id = ? AND er.status = 'Completed' AND l.exchange_type = 'Free'
    `).get(userId).count;

    const receivedFree = getDB().prepare(`
      SELECT COUNT(*) as count FROM exchange_requests er
      JOIN listings l ON er.listing_id = l.id
      WHERE er.requester_id = ? AND er.status = 'Completed' AND l.exchange_type = 'Free'
    `).get(userId).count;

    res.json({
      activeListings,
      completedExchanges,
      givenFree,
      receivedFree,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const requests = getDB().prepare(`
      SELECT er.*, 
             l.produce_name, l.category, l.exchange_type, l.quantity, l.unit,
             owner.name AS owner_name,
             requester.name AS requester_name,
             offered.produce_name AS offered_produce_name
      FROM exchange_requests er
      JOIN listings l ON er.listing_id = l.id
      JOIN users owner ON er.owner_id = owner.id
      JOIN users requester ON er.requester_id = requester.id
      LEFT JOIN listings offered ON er.offered_listing_id = offered.id
      WHERE er.requester_id = ? OR er.owner_id = ?
      ORDER BY er.updated_at DESC
    `).all(req.user.id, req.user.id);

    const exchangeIds = requests.map(r => r.id);
    let reviewedSet = new Set();
    if (exchangeIds.length > 0) {
      const placeholders = exchangeIds.map(() => '?').join(',');
      const reviewedExchanges = getDB().prepare(`
        SELECT exchange_id FROM reviews WHERE exchange_id IN (${placeholders}) AND reviewer_id = ?
      `).all(...exchangeIds, req.user.id);
      reviewedSet = new Set(reviewedExchanges.map(r => r.exchange_id));
    }

    const history = requests.map(r => ({
      id: r.id,
      listing_id: r.listing_id,
      requester_id: r.requester_id,
      owner_id: r.owner_id,
      message: r.message,
      offered_listing_id: r.offered_listing_id,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      produce_name: r.produce_name,
      category: r.category,
      exchange_type: r.exchange_type,
      quantity: r.quantity,
      unit: r.unit,
      owner_name: r.owner_name,
      requester_name: r.requester_name,
      offered_produce_name: r.offered_produce_name,
      has_reviewed: reviewedSet.has(r.id),
    }));

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
