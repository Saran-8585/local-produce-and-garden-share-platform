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
      filter.$or = [
        { produce_name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    if (req.query.availability !== 'All') {
      filter.status = 'Available';
      filter.available_until = { $gte: new Date().toISOString().split('T')[0] };
    }

    let listings = await Listing.find(filter)
      .populate('user', 'name neighbourhood avg_rating total_reviews')
      .sort({ created_at: -1 });

    if (req.query.neighbourhood && req.query.neighbourhood !== 'All') {
      listings = listings.filter(l => l.user && l.user.neighbourhood === req.query.neighbourhood);
    }

    const enhanced = listings.map(l => {
      const daysSinceHarvest = Math.floor((new Date() - new Date(l.harvest_date)) / (1000 * 60 * 60 * 24));
      const daysUntilExpiry = Math.ceil((new Date(l.available_until) - new Date()) / (1000 * 60 * 60 * 24));

      return {
        ...l.toJSON(),
        user_id: l.user ? l.user.id : null,
        grower_name: l.user ? l.user.name : null,
        grower_neighbourhood: l.user ? l.user.neighbourhood : null,
        grower_rating: l.user ? l.user.avg_rating : 0,
        grower_reviews: l.user ? l.user.total_reviews : 0,
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
    const listing = await Listing.findById(req.params.id)
      .populate('user', 'name neighbourhood avg_rating total_reviews bio total_listings total_exchanges created_at');

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const daysSinceHarvest = Math.floor((new Date() - new Date(listing.harvest_date)) / (1000 * 60 * 60 * 24));
    const daysUntilExpiry = Math.ceil((new Date(listing.available_until) - new Date()) / (1000 * 60 * 60 * 24));

    const enhanced = {
      ...listing.toJSON(),
      user_id: listing.user ? listing.user.id : null,
      grower_name: listing.user ? listing.user.name : null,
      grower_neighbourhood: listing.user ? listing.user.neighbourhood : null,
      grower_rating: listing.user ? listing.user.avg_rating : 0,
      grower_reviews: listing.user ? listing.user.total_reviews : 0,
      grower_bio: listing.user ? listing.user.bio : '',
      grower_joined: listing.user ? listing.user.created_at : null,
      grower_listings: listing.user ? listing.user.total_listings : 0,
      grower_exchanges: listing.user ? listing.user.total_exchanges : 0,
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

    if (!produce_name || !category || !quantity || !unit || !exchange_type || !harvest_date || !available_until || !location_name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    const listing = await Listing.create({
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

    const totalListings = await Listing.countDocuments({ user: req.user.id });
    await User.findByIdAndUpdate(req.user.id, { total_listings: totalListings });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
};

exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.user.toString() !== req.user.id) {
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

    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update listing' });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(req.params.id);

    const totalListings = await Listing.countDocuments({ user: req.user.id });
    await User.findByIdAndUpdate(req.user.id, { total_listings: totalListings });

    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};

exports.getUserListings = async (req, res) => {
  try {
    const listings = await Listing.find({ user: req.params.userId })
      .populate('user', 'name neighbourhood')
      .sort({ created_at: -1 });

    const enhanced = listings.map(l => ({
      ...l.toJSON(),
      user_id: l.user ? l.user.id : null,
      grower_name: l.user ? l.user.name : null,
      grower_neighbourhood: l.user ? l.user.neighbourhood : null,
    }));

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user listings' });
  }
};

exports.toggleStatus = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    if (listing.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const newStatus = listing.status === 'Available' ? 'Unavailable' : 'Available';

    if (newStatus === 'Unavailable') {
      const pendingCount = await ExchangeRequest.countDocuments({
        listing: req.params.id,
        status: { $in: ['Pending', 'Accepted'] },
      });
      if (pendingCount > 0) {
        return res.status(400).json({ error: `This listing has ${pendingCount} active request(s). Please resolve them first.` });
      }
    }

    const updated = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle status' });
  }
};
