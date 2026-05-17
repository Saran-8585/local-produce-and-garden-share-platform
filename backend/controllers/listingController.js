const { db } = require('../db/database');

exports.getAllListings = (req, res) => {
  try {
    let query = `
      SELECT l.*, u.name as grower_name, u.neighbourhood as grower_neighbourhood,
             u.avg_rating as grower_rating, u.total_reviews as grower_reviews
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (req.query.category && req.query.category !== 'All') {
      query += ' AND l.category = ?';
      params.push(req.query.category);
    }

    if (req.query.exchange_type && req.query.exchange_type !== 'All') {
      query += ' AND (l.exchange_type = ? OR l.exchange_type = \'Both\')';
      params.push(req.query.exchange_type);
    }

    if (req.query.neighbourhood && req.query.neighbourhood !== 'All') {
      query += ' AND u.neighbourhood = ?';
      params.push(req.query.neighbourhood);
    }

    if (req.query.availability !== 'All') {
      query += ' AND l.status = \'Available\'';
      query += ' AND date(l.available_until) >= date(\'now\')';
    }

    if (req.query.search) {
      query += ' AND (l.produce_name LIKE ? OR l.description LIKE ?)';
      params.push(`%${req.query.search}%`, `%${req.query.search}%`);
    }

    query += ' ORDER BY l.created_at DESC';

    const listings = db.prepare(query).all(...params);

    const enhanved = listings.map(l => ({
      ...l,
      days_since_harvest: Math.floor((new Date() - new Date(l.harvest_date)) / (1000 * 60 * 60 * 24)),
      days_until_expiry: Math.ceil((new Date(l.available_until) - new Date()) / (1000 * 60 * 60 * 24))
    }));

    res.json(enhanved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

exports.getListingById = (req, res) => {
  try {
    const listing = db.prepare(`
      SELECT l.*, u.name as grower_name, u.neighbourhood as grower_neighbourhood,
             u.avg_rating as grower_rating, u.total_reviews as grower_reviews,
             u.bio as grower_bio, u.created_at as grower_joined,
             u.total_listings as grower_listings, u.total_exchanges as grower_exchanges
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `).get(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const enhanved = {
      ...listing,
      days_since_harvest: Math.floor((new Date() - new Date(listing.harvest_date)) / (1000 * 60 * 60 * 24)),
      days_until_expiry: Math.ceil((new Date(listing.available_until) - new Date()) / (1000 * 60 * 60 * 24))
    };

    res.json(enhanved);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

exports.createListing = (req, res) => {
  try {
    const { produce_name, category, description, quantity, unit, exchange_type, swap_for, harvest_date, available_until, location_name, latitude, longitude, status } = req.body;

    if (!produce_name || !category || !quantity || !unit || !exchange_type || !harvest_date || !available_until || !location_name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const result = db.prepare(`
      INSERT INTO listings (user_id, produce_name, category, description, quantity, unit, exchange_type, swap_for, harvest_date, available_until, location_name, latitude, longitude, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, produce_name, category, description || '', quantity, unit, exchange_type, swap_for || '', harvest_date, available_until, location_name, latitude, longitude, status || 'Available');

    db.prepare('UPDATE users SET total_listings = (SELECT COUNT(*) FROM listings WHERE user_id = ?) WHERE id = ?').run(req.user.id, req.user.id);

    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
};

exports.updateListing = (req, res) => {
  try {
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    const { produce_name, category, description, quantity, unit, exchange_type, swap_for, harvest_date, available_until, location_name, latitude, longitude, status } = req.body;

    db.prepare(`
      UPDATE listings SET produce_name=?, category=?, description=?, quantity=?, unit=?, exchange_type=?, swap_for=?, harvest_date=?, available_until=?, location_name=?, latitude=?, longitude=?, status=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(
      produce_name || listing.produce_name,
      category || listing.category,
      description !== undefined ? description : listing.description,
      quantity || listing.quantity,
      unit || listing.unit,
      exchange_type || listing.exchange_type,
      swap_for !== undefined ? swap_for : listing.swap_for,
      harvest_date || listing.harvest_date,
      available_until || listing.available_until,
      location_name || listing.location_name,
      latitude !== undefined ? latitude : listing.latitude,
      longitude !== undefined ? longitude : listing.longitude,
      status || listing.status,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update listing' });
  }
};

exports.deleteListing = (req, res) => {
  try {
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    db.prepare('DELETE FROM listings WHERE id = ?').run(req.params.id);
    db.prepare('UPDATE users SET total_listings = (SELECT COUNT(*) FROM listings WHERE user_id = ?) WHERE id = ?').run(req.user.id, req.user.id);

    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};

exports.getUserListings = (req, res) => {
  try {
    const listings = db.prepare(`
      SELECT l.*, u.name as grower_name, u.neighbourhood as grower_neighbourhood
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
    `).all(req.params.userId);

    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
};

exports.toggleStatus = (req, res) => {
  try {
    const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const newStatus = listing.status === 'Available' ? 'Unavailable' : 'Available';

    if (newStatus === 'Unavailable') {
      const pending = db.prepare(
        "SELECT COUNT(*) as count FROM exchange_requests WHERE listing_id = ? AND status IN ('Pending','Accepted')"
      ).get(req.params.id);
      if (pending.count > 0) {
        return res.status(400).json({ error: `This listing has ${pending.count} active request(s). Please resolve them first.` });
      }
    }

    db.prepare("UPDATE listings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(newStatus, req.params.id);

    const updated = db.prepare('SELECT * FROM listings WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle status' });
  }
};
