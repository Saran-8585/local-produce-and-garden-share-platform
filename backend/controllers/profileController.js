const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(User.toJSON(user));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, neighbourhood, bio } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (neighbourhood !== undefined) updates.neighbourhood = neighbourhood;
    if (bio !== undefined) updates.bio = bio;

    const user = User.update(req.user.id, updates);
    res.json(User.toJSON(user));
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
