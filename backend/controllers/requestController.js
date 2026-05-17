const { db } = require('../db/database');

exports.createRequest = (req, res) => {
  try {
    const { listing_id, message, offered_listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listing_id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.user_id === req.user.id) {
      return res.status(400).json({ error: 'Cannot request your own listing' });
    }

    if (listing.status !== 'Available') {
      return res.status(400).json({ error: 'Listing is not available' });
    }

    if (new Date(listing.available_until) < new Date()) {
      return res.status(400).json({ error: 'Listing has expired' });
    }

    if (offered_listing_id) {
      const offered = db.prepare('SELECT * FROM listings WHERE id = ?').get(offered_listing_id);
      if (!offered) {
        return res.status(404).json({ error: 'Offered listing not found' });
      }
      if (offered.user_id !== req.user.id) {
        return res.status(400).json({ error: 'Offered listing must belong to you' });
      }
      if (offered.status !== 'Available') {
        return res.status(400).json({ error: 'Offered listing must be available' });
      }
    }

    const existing = db.prepare(
      "SELECT id FROM exchange_requests WHERE listing_id = ? AND requester_id = ? AND status IN ('Pending','Accepted')"
    ).get(listing_id, req.user.id);
    if (existing) {
      return res.status(400).json({ error: 'You already have a pending request for this listing' });
    }

    const result = db.prepare(
      "INSERT INTO exchange_requests (listing_id, requester_id, owner_id, message, offered_listing_id, status) VALUES (?, ?, ?, ?, ?, 'Pending')"
    ).run(listing_id, req.user.id, listing.user_id, message || '', offered_listing_id || null);

    const request = db.prepare('SELECT * FROM exchange_requests WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create request' });
  }
};

exports.getSentRequests = (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT er.*, l.produce_name, l.category, l.exchange_type,
             u.name as owner_name, u.neighbourhood as owner_neighbourhood,
             ol.produce_name as offered_produce_name
      FROM exchange_requests er
      JOIN listings l ON er.listing_id = l.id
      JOIN users u ON er.owner_id = u.id
      LEFT JOIN listings ol ON er.offered_listing_id = ol.id
      WHERE er.requester_id = ?
      ORDER BY er.created_at DESC
    `).all(req.user.id);

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
};

exports.getReceivedRequests = (req, res) => {
  try {
    const requests = db.prepare(`
      SELECT er.*, l.produce_name, l.category, l.exchange_type,
             u.name as requester_name, u.neighbourhood as requester_neighbourhood,
             ol.produce_name as offered_produce_name
      FROM exchange_requests er
      JOIN listings l ON er.listing_id = l.id
      JOIN users u ON er.requester_id = u.id
      LEFT JOIN listings ol ON er.offered_listing_id = ol.id
      WHERE er.owner_id = ?
      ORDER BY er.created_at DESC
    `).all(req.user.id);

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch received requests' });
  }
};

exports.acceptRequest = (req, res) => {
  try {
    const request = db.prepare('SELECT * FROM exchange_requests WHERE id = ?').get(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the listing owner can accept requests' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only accept pending requests' });
    }

    db.prepare("UPDATE exchange_requests SET status = 'Accepted', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

    if (request.offered_listing_id) {
      db.prepare("UPDATE listings SET status = 'Unavailable' WHERE id = ?").run(request.offered_listing_id);
    }
    db.prepare("UPDATE listings SET status = 'Unavailable' WHERE id = ?").run(request.listing_id);

    const updated = db.prepare('SELECT * FROM exchange_requests WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept request' });
  }
};

exports.declineRequest = (req, res) => {
  try {
    const request = db.prepare('SELECT * FROM exchange_requests WHERE id = ?').get(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the listing owner can decline requests' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only decline pending requests' });
    }

    db.prepare("UPDATE exchange_requests SET status = 'Declined', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    const updated = db.prepare('SELECT * FROM exchange_requests WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline request' });
  }
};

exports.completeRequest = (req, res) => {
  try {
    const request = db.prepare('SELECT * FROM exchange_requests WHERE id = ?').get(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.requester_id !== req.user.id && request.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (request.status !== 'Accepted') {
      return res.status(400).json({ error: 'Can only complete accepted requests' });
    }

    db.prepare("UPDATE exchange_requests SET status = 'Completed', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);

    db.prepare('UPDATE users SET total_exchanges = (SELECT COUNT(*) FROM exchange_requests WHERE (requester_id = ? OR owner_id = ?) AND status = \'Completed\') WHERE id = ?').run(req.user.id, req.user.id, req.user.id);

    const otherUserId = request.requester_id === req.user.id ? request.owner_id : request.requester_id;
    db.prepare('UPDATE users SET total_exchanges = (SELECT COUNT(*) FROM exchange_requests WHERE (requester_id = ? OR owner_id = ?) AND status = \'Completed\') WHERE id = ?').run(otherUserId, otherUserId, otherUserId);

    const updated = db.prepare('SELECT * FROM exchange_requests WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete request' });
  }
};

exports.cancelRequest = (req, res) => {
  try {
    const request = db.prepare('SELECT * FROM exchange_requests WHERE id = ?').get(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.requester_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the requester can cancel' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    db.prepare("UPDATE exchange_requests SET status = 'Cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(req.params.id);
    const updated = db.prepare('SELECT * FROM exchange_requests WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel request' });
  }
};
