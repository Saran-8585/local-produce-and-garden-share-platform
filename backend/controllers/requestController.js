const ExchangeRequest = require('../models/ExchangeRequest');
const Listing = require('../models/Listing');
const User = require('../models/User');

exports.createRequest = async (req, res) => {
  try {
    const { listing_id, message, offered_listing_id } = req.body;

    if (!listing_id) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const listing = await Listing.findById(listing_id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.user.toString() === req.user.id) {
      return res.status(400).json({ error: 'Cannot request your own listing' });
    }

    if (listing.status !== 'Available') {
      return res.status(400).json({ error: 'Listing is not available' });
    }

    if (new Date(listing.available_until) < new Date()) {
      return res.status(400).json({ error: 'Listing has expired' });
    }

    if (offered_listing_id) {
      const offered = await Listing.findById(offered_listing_id);
      if (!offered) {
        return res.status(404).json({ error: 'Offered listing not found' });
      }
      if (offered.user.toString() !== req.user.id) {
        return res.status(400).json({ error: 'Offered listing must belong to you' });
      }
      if (offered.status !== 'Available') {
        return res.status(400).json({ error: 'Offered listing must be available' });
      }
    }

    const existing = await ExchangeRequest.findOne({
      listing: listing_id,
      requester: req.user.id,
      status: { $in: ['Pending', 'Accepted'] },
    });

    if (existing) {
      return res.status(400).json({ error: 'You already have a pending request for this listing' });
    }

    const request = await ExchangeRequest.create({
      listing: listing_id,
      requester: req.user.id,
      owner: listing.user,
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
    const requests = await ExchangeRequest.find({ requester: req.user.id })
      .populate('listing', 'produce_name category exchange_type')
      .populate('owner', 'name neighbourhood')
      .populate('offered_listing', 'produce_name')
      .sort({ created_at: -1 });

    const enhanced = requests.map(r => ({
      ...r.toJSON(),
      listing_id: r.listing ? r.listing.id : null,
      produce_name: r.listing ? r.listing.produce_name : null,
      category: r.listing ? r.listing.category : null,
      exchange_type: r.listing ? r.listing.exchange_type : null,
      owner_name: r.owner ? r.owner.name : null,
      owner_neighbourhood: r.owner ? r.owner.neighbourhood : null,
      offered_produce_name: r.offered_listing ? r.offered_listing.produce_name : null,
    }));

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sent requests' });
  }
};

exports.getReceivedRequests = async (req, res) => {
  try {
    const requests = await ExchangeRequest.find({ owner: req.user.id })
      .populate('listing', 'produce_name category exchange_type')
      .populate('requester', 'name neighbourhood')
      .populate('offered_listing', 'produce_name')
      .sort({ created_at: -1 });

    const enhanced = requests.map(r => ({
      ...r.toJSON(),
      listing_id: r.listing ? r.listing.id : null,
      produce_name: r.listing ? r.listing.produce_name : null,
      category: r.listing ? r.listing.category : null,
      exchange_type: r.listing ? r.listing.exchange_type : null,
      requester_name: r.requester ? r.requester.name : null,
      requester_neighbourhood: r.requester ? r.requester.neighbourhood : null,
      offered_produce_name: r.offered_listing ? r.offered_listing.produce_name : null,
    }));

    res.json(enhanced);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch received requests' });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the listing owner can accept requests' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only accept pending requests' });
    }

    request.status = 'Accepted';
    await request.save();

    if (request.offered_listing) {
      await Listing.findByIdAndUpdate(request.offered_listing, { status: 'Unavailable' });
    }
    await Listing.findByIdAndUpdate(request.listing, { status: 'Unavailable' });

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept request' });
  }
};

exports.declineRequest = async (req, res) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the listing owner can decline requests' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only decline pending requests' });
    }

    request.status = 'Declined';
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline request' });
  }
};

exports.completeRequest = async (req, res) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.requester.toString() !== req.user.id && request.owner.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    if (request.status !== 'Accepted') {
      return res.status(400).json({ error: 'Can only complete accepted requests' });
    }

    request.status = 'Completed';
    await request.save();

    const userIds = [request.requester.toString(), request.owner.toString()];
    for (const uid of userIds) {
      const totalExchanges = await ExchangeRequest.countDocuments({
        $or: [{ requester: uid }, { owner: uid }],
        status: 'Completed',
      });
      await User.findByIdAndUpdate(uid, { total_exchanges: totalExchanges });
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete request' });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const request = await ExchangeRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.requester.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Only the requester can cancel' });
    }
    if (request.status !== 'Pending') {
      return res.status(400).json({ error: 'Can only cancel pending requests' });
    }

    request.status = 'Cancelled';
    await request.save();

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel request' });
  }
};
