const Listing = require('../models/Listing');
const User = require('../models/User');
const ExchangeRequest = require('../models/ExchangeRequest');

exports.getAllListings = async (req, res) => {
  try {
    const filter = {};

    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    if (req.query.exchange_type && req.query.exchange_type !== 'All') {
      filter.exchange_type = { $in: [req.query.exchange_type, 'Both'] };
    }

    if (req.query.search) {
      filter.search = req.query.search;
    }

    if (req.query.availability !== 'All') {
      filter.status = 'Available';
      filter.available_until = { $gte: new Date().toISOString().split('T')[0] };
    }

    let listings = Listing.find(filter);

    if (req.query.neighbourhood && req.query.neighbourhood !== 'All') {
      listings = listings.filter(l => l.grower_neighbourhood === req.query.neighbourhood);
    }

    const enhanced = listings.map(l => {
      const daysSinceHarvest = Math.floor((new Date() - new Date(l.harvest_date)) / (1000 * 60 * 60 * 24));
      const daysUntilExpiry = Math.ceil((new Date(l.available_until) - new Date()) / (1000 * 60 * 60 * 24));

      return {
        id: l.id,
        user_id: l.user_id,
        produce_name: l.produce_name,
        category: l.category,
        description: l.description,
        quantity: l.quantity,
        unit: l.unit,
        exchange_type: l.exchange_type,
        swap_for: l.swap_for,
        harvest_date: l.harvest_date,
        available_until: l.available_until,
        location_name: l.location_name,
        latitude: l.latitude,
        longitude: l.longitude,
        status: l.status,
        created_at: l.created_at,
        updated_at: l.updated_at,
        grower_name: l.grower_name,
        grower_neighbourhood: l.grower_neighbourhood,
        grower_rating: l.grower_rating || 0,
        grower_reviews: l.grower_reviews || 0,
        days_since_harvest: daysSinceHarvest,
        days_until_expiry: daysUntilExpiry,
      };
    });

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const daysSinceHarvest = Math.floor((new Date() - new Date(listing.harvest_date)) / (1000 * 60 * 60 * 24));
    const daysUntilExpiry = Math.ceil((new Date(listing.available_until) - new Date()) / (1000 * 60 * 60 * 24));

    const enhanced = {
      id: listing.id,
      user_id: listing.user_id,
      produce_name: listing.produce_name,
      category: listing.category,
      description: listing.description,
      quantity: listing.quantity,
      unit: listing.unit,
      exchange_type: listing.exchange_type,
      swap_for: listing.swap_for,
      harvest_date: listing.harvest_date,
      available_until: listing.available_until,
      location_name: listing.location_name,
      latitude: listing.latitude,
      longitude: listing.longitude,
      status: listing.status,
      created_at: listing.created_at,
      updated_at: listing.updated_at,
      grower_name: listing.grower_name,
      grower_neighbourhood: listing.grower_neighbourhood,
      grower_rating: listing.grower_rating || 0,
      grower_reviews: listing.grower_reviews || 0,
      grower_bio: listing.grower_bio || '',
      grower_joined: listing.grower_joined,
      grower_listings: listing.grower_listings || 0,
      grower_exchanges: listing.grower_exchanges || 0,
      days_since_harvest: daysSinceHarvest,
      days_until_expiry: daysUntilExpiry,
    };

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch listing' });
  }
};

exports.createListing = async (req, res) => {
  try {
    const { produce_name, category, description, quantity, unit, exchange_type, swap_for, harvest_date, available_until, location_name, latitude, longitude, status } = req.body;

    if (!produce_name || !category || !quantity || !unit || !exchange_type || !harvest_date || !available_until || !location_name) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const listing = Listing.create({
      user: req.user.id,
      produce_name,
      category,
      description: description || '',
      quantity,
      unit,
      exchange_type,
      swap_for: swap_for || '',
      harvest_date,
      available_until,
      location_name,
      latitude,
      longitude,
      status: status || 'Available',
    });

    const totalListings = Listing.count({ user: req.user.id });
    User.update(req.user.id, { total_listings: totalListings });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this listing' });
    }

    const { produce_name, category, description, quantity, unit, exchange_type, swap_for, harvest_date, available_until, location_name, latitude, longitude, status } = req.body;

    const updates = {};
    if (produce_name) updates.produce_name = produce_name;
    if (category) updates.category = category;
    if (description !== undefined) updates.description = description;
    if (quantity) updates.quantity = quantity;
    if (unit) updates.unit = unit;
    if (exchange_type) updates.exchange_type = exchange_type;
    if (swap_for !== undefined) updates.swap_for = swap_for;
    if (harvest_date) updates.harvest_date = harvest_date;
    if (available_until) updates.available_until = available_until;
    if (location_name) updates.location_name = location_name;
    if (latitude !== undefined) updates.latitude = latitude;
    if (longitude !== undefined) updates.longitude = longitude;
    if (status) updates.status = status;

    const updated = Listing.update(req.params.id, updates);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update listing' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    Listing.delete(req.params.id);

    const totalListings = Listing.count({ user: req.user.id });
    User.update(req.user.id, { total_listings: totalListings });

    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};

exports.getUserListings = async (req, res) => {
  try {
    const listings = Listing.find({ user: req.params.userId });

    const enhanced = listings.map(l => ({
      id: l.id,
      user_id: l.user_id,
      produce_name: l.produce_name,
      category: l.category,
      description: l.description,
      quantity: l.quantity,
      unit: l.unit,
      exchange_type: l.exchange_type,
      swap_for: l.swap_for,
      harvest_date: l.harvest_date,
      available_until: l.available_until,
      location_name: l.location_name,
      latitude: l.latitude,
      longitude: l.longitude,
      status: l.status,
      created_at: l.created_at,
      updated_at: l.updated_at,
      grower_name: l.grower_name,
      grower_neighbourhood: l.grower_neighbourhood,
    }));

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const listing = Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const newStatus = listing.status === 'Available' ? 'Unavailable' : 'Available';

    if (newStatus === 'Unavailable') {
      const pendingCount = ExchangeRequest.count({
        listing: req.params.id,
        status: { $in: ['Pending', 'Accepted'] },
      });
      if (pendingCount > 0) {
        return res.status(400).json({ error: `This listing has ${pendingCount} active request(s). Please resolve them first.` });
      }
    }

    const updated = Listing.update(req.params.id, { status: newStatus });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle status' });
  }
};
