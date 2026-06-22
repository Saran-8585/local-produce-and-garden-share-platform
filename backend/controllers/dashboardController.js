const mongoose = require('mongoose');
const Listing = require('../models/Listing');
const ExchangeRequest = require('../models/ExchangeRequest');
const Review = require('../models/Review');

exports.getStats = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const activeListings = await Listing.countDocuments({
      user: userId,
      status: 'Available',
      available_until: { $gte: todayStr },
    });

    const completedExchanges = await ExchangeRequest.countDocuments({
      $or: [{ requester: userId }, { owner: userId }],
      status: 'Completed',
    });

    const givenFreeResult = await ExchangeRequest.aggregate([
      { $match: { owner: userId, status: 'Completed' } },
      { $lookup: { from: 'listings', localField: 'listing', foreignField: '_id', as: 'listingDoc' } },
      { $unwind: '$listingDoc' },
      { $match: { 'listingDoc.exchange_type': 'Free' } },
      { $count: 'count' },
    ]);
    const givenFree = givenFreeResult[0]?.count || 0;

    const receivedFreeResult = await ExchangeRequest.aggregate([
      { $match: { requester: userId, status: 'Completed' } },
      { $lookup: { from: 'listings', localField: 'listing', foreignField: '_id', as: 'listingDoc' } },
      { $unwind: '$listingDoc' },
      { $match: { 'listingDoc.exchange_type': 'Free' } },
      { $count: 'count' },
    ]);
    const receivedFree = receivedFreeResult[0]?.count || 0;

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
    const requests = await ExchangeRequest.find({
      $or: [{ requester: req.user.id }, { owner: req.user.id }],
    })
      .populate('listing', 'produce_name category exchange_type quantity unit')
      .populate('owner', 'name')
      .populate('requester', 'name')
      .populate('offered_listing', 'produce_name')
      .sort({ updated_at: -1 });

    const exchangeIds = requests.map(r => r._id);
    const reviewedExchanges = await Review.find({
      exchange: { $in: exchangeIds },
      reviewer: req.user.id,
    }).select('exchange');

    const reviewedSet = new Set(reviewedExchanges.map(r => r.exchange.toString()));

    const history = requests.map(r => {
      const json = r.toJSON();
      const isOwner = json.owner && json.owner.id === req.user.id;

      return {
        ...json,
        listing_id: json.listing ? json.listing.id : null,
        produce_name: json.listing ? json.listing.produce_name : null,
        category: json.listing ? json.listing.category : null,
        exchange_type: json.listing ? json.listing.exchange_type : null,
        quantity: json.listing ? json.listing.quantity : null,
        unit: json.listing ? json.listing.unit : null,
        owner_name: json.owner ? json.owner.name : null,
        owner_id: json.owner ? json.owner.id : null,
        requester_name: json.requester ? json.requester.name : null,
        requester_id: json.requester ? json.requester.id : null,
        offered_produce_name: json.offered_listing ? json.offered_listing.produce_name : null,
        has_reviewed: reviewedSet.has(r._id.toString()),
      };
    });

    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};
