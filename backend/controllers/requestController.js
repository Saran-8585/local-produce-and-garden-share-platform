const ExchangeRequest = require('../models/ExchangeRequest');
const Listing = require('../models/Listing');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  try {
    const { listing_id, message, offered_listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = Listing.findById(listing_id);
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
      const offered = Listing.findById(offered_listing_id);
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

    const existing = ExchangeRequest.findOne({
      listing: listing_id,
      requester: req.user.id,
      status: { $in: ['Pending', 'Accepted'] },
    });

    if (existing) {
      return res.status(400).json({ error: 'You already have a pending request for this listing' });
    }

    const request = ExchangeRequest.create({
      listing: listing_id,
      requester: req.user.id,
      owner: listing.user_id,
      message: message || '',
      offered_listing: offered_listing_id || null,
      status: 'Pending',
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create request' });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const requests = ExchangeRequest.findWithListings({ requester: req.user.id });

    const enhanced = requests.map(r => ({
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
      owner_name: r.owner_name,
      owner_neighbourhood: r.owner_neighbourhood,
      offered_produce_name: r.offered_produce_name,
    }));

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
};

exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = ExchangeRequest.findWithListings({ owner: req.user.id });

    const enhanced = requests.map(r => ({
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
      requester_name: r.requester_name,
      requester_neighbourhood: r.requester_neighbourhood,
      offered_produce_name: r.offered_produce_name,
    }));

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch received requests' });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const request = ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the listing owner can accept requests' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only accept pending requests' });
    }

    ExchangeRequest.update(req.params.id, { status: 'Accepted' });

    if (request.offered_listing_id) {
      Listing.update(request.offered_listing_id, { status: 'Unavailable' });
    }
    Listing.update(request.listing_id, { status: 'Unavailable' });

    res.json({ ...request, status: 'Accepted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept request' });
  }
};

exports.declineRequest = async (req, res) => {
  try {
    const request = ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the listing owner can decline requests' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only decline pending requests' });
    }

    ExchangeRequest.update(req.params.id, { status: 'Declined' });

    res.json({ ...request, status: 'Declined' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline request' });
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const request = ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.requester_id !== req.user.id && request.owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (request.status !== 'Accepted') {
      return res.status(400).json({ error: 'Can only complete accepted requests' });
    }

    ExchangeRequest.update(req.params.id, { status: 'Completed' });

    const userIds = [request.requester_id, request.owner_id];
    for (const uid of userIds) {
      const totalExchanges = ExchangeRequest.count({
        $or: [{ requester: uid }, { owner: uid }],
        status: 'Completed',
      });
      User.update(uid, { total_exchanges: totalExchanges });
    }

    res.json({ ...request, status: 'Completed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete request' });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const request = ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.requester_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the requester can cancel' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    ExchangeRequest.update(req.params.id, { status: 'Cancelled' });

    res.json({ ...request, status: 'Cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel request' });
  }
};
