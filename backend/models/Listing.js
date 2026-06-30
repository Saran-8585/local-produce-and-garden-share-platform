const { getDB } = require('../db/database');

const Listing = {
  findById(id) {
    const listing = getDB().prepare(`
      SELECT l.*, u.name AS grower_name, u.neighbourhood AS grower_neighbourhood,
             u.avg_rating AS grower_rating, u.total_reviews AS grower_reviews,
             u.bio AS grower_bio, u.total_listings AS grower_listings,
             u.total_exchanges AS grower_exchanges, u.created_at AS grower_joined
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ?
    `).get(id);
    return listing;
  },

  find(filter = {}) {
    let sql = 'SELECT l.*, u.name AS grower_name, u.neighbourhood AS grower_neighbourhood, u.avg_rating AS grower_rating, u.total_reviews AS grower_reviews FROM listings l JOIN users u ON l.user_id = u.id WHERE 1=1';
    const params = [];

    if (filter.category) {
      sql += ' AND l.category = ?';
      params.push(filter.category);
    }

    if (filter.exchange_type && filter.exchange_type.$in) {
      const placeholders = filter.exchange_type.$in.map(() => '?').join(',');
      sql += ` AND l.exchange_type IN (${placeholders})`;
      params.push(...filter.exchange_type.$in);
    }

    if (filter.search) {
      sql += ' AND (l.produce_name LIKE ? OR l.description LIKE ?)';
      params.push(`%${filter.search}%`, `%${filter.search}%`);
    }

    if (filter.status) {
      sql += ' AND l.status = ?';
      params.push(filter.status);
    }

    if (filter.available_until && filter.available_until.$gte) {
      sql += ' AND l.available_until >= ?';
      params.push(filter.available_until.$gte);
    }

    if (filter.user) {
      sql += ' AND l.user_id = ?';
      params.push(filter.user);
    }

    sql += ' ORDER BY l.created_at DESC';

    const listings = getDB().prepare(sql).all(...params);
    return listings;
  },

  create(data) {
    const stmt = getDB().prepare(`
      INSERT INTO listings (user_id, produce_name, category, description, quantity, unit, exchange_type, swap_for, harvest_date, available_until, location_name, latitude, longitude, status)
      VALUES (@user_id, @produce_name, @category, @description, @quantity, @unit, @exchange_type, @swap_for, @harvest_date, @available_until, @location_name, @latitude, @longitude, @status)
    `);
    const result = stmt.run({
      user_id: data.user,
      produce_name: data.produce_name,
      category: data.category,
      description: data.description || '',
      quantity: data.quantity,
      unit: data.unit,
      exchange_type: data.exchange_type,
      swap_for: data.swap_for || '',
      harvest_date: data.harvest_date,
      available_until: data.available_until,
      location_name: data.location_name,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      status: data.status || 'Available',
    });
    return this.findById(result.lastInsertRowid);
  },

  update(id, data) {
    const fields = [];
    const values = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const col = key === 'user' ? 'user_id' : key;
        fields.push(`${col} = @${key}`);
        values[key] = value;
      }
    }
    if (fields.length === 0) return this.findById(id);
    values.id = id;
    fields.push("updated_at = datetime('now')");
    getDB().prepare(`UPDATE listings SET ${fields.join(', ')} WHERE id = @id`).run(values);
    return this.findById(id);
  },

  delete(id) {
    getDB().prepare('DELETE FROM listings WHERE id = ?').run(id);
  },

  count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM listings WHERE 1=1';
    const params = [];
    if (filter.user) { sql += ' AND user_id = ?'; params.push(filter.user); }
    if (filter.status) { sql += ' AND status = ?'; params.push(filter.status); }
    if (filter.available_until && filter.available_until.$gte) { sql += ' AND available_until >= ?'; params.push(filter.available_until.$gte); }
    if (filter.listing) { sql += ' AND id = ?'; params.push(filter.listing); }
    const row = getDB().prepare(sql).get(...params);
    return row.count;
  },
};

module.exports = Listing;
