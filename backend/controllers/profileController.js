const { db } = require('../db/database');

exports.getProfile = (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, name, email, neighbourhood, bio, avg_rating, total_reviews, total_listings, total_exchanges, created_at
      FROM users WHERE id = ?
    `).get(req.params.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.updateProfile = (req, res) => {
  try {
    const { name, neighbourhood, bio } = req.body;

    db.prepare(
      'UPDATE users SET name = COALESCE(?, name), neighbourhood = COALESCE(?, neighbourhood), bio = COALESCE(?, bio) WHERE id = ?'
    ).run(name || null, neighbourhood || null, bio !== undefined ? bio : null, req.user.id);

    const user = db.prepare(
      'SELECT id, name, email, neighbourhood, bio, avg_rating, total_reviews, total_listings, total_exchanges, created_at FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
