const { getDB } = require('../db/database');

const User = {
  findById(id) {
    return getDB().prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  findByEmail(email) {
    return getDB().prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  create(data) {
    const stmt = getDB().prepare(`
      INSERT INTO users (name, email, password, neighbourhood, bio, avg_rating, total_reviews, total_listings, total_exchanges)
      VALUES (@name, @email, @password, @neighbourhood, @bio, @avg_rating, @total_reviews, @total_listings, @total_exchanges)
    `);
    const result = stmt.run({
      name: data.name,
      email: data.email,
      password: data.password,
      neighbourhood: data.neighbourhood,
      bio: data.bio || '',
      avg_rating: 0,
      total_reviews: 0,
      total_listings: 0,
      total_exchanges: 0,
    });
    return this.findById(result.lastInsertRowid);
  },

  update(id, data) {
    const fields = [];
    const values = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        fields.push(`${key} = @${key}`);
        values[key] = value;
      }
    }
    if (fields.length === 0) return this.findById(id);
    values.id = id;
    fields.push("updated_at = datetime('now')");
    getDB().prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = @id`).run(values);
    return this.findById(id);
  },

  toJSON(user) {
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  },
};

module.exports = User;
