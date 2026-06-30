const { getDB } = require('../db/database');

const Review = {
  findById(id) {
    return getDB().prepare('SELECT * FROM reviews WHERE id = ?').get(id);
  },

  find(filter = {}) {
    let sql = 'SELECT * FROM reviews WHERE 1=1';
    const params = [];
    if (filter.reviewee) { sql += ' AND reviewee_id = ?'; params.push(filter.reviewee); }
    if (filter.reviewer) { sql += ' AND reviewer_id = ?'; params.push(filter.reviewer); }
    if (filter.exchange) {
      if (filter.exchange.$in) {
        const placeholders = filter.exchange.$in.map(() => '?').join(',');
        sql += ` AND exchange_id IN (${placeholders})`;
        params.push(...filter.exchange.$in);
      } else {
        sql += ' AND exchange_id = ?';
        params.push(filter.exchange);
      }
    }
    if (filter.$sort) {
      sql += ` ORDER BY ${filter.$sort}`;
    } else {
      sql += ' ORDER BY created_at DESC';
    }
    return getDB().prepare(sql).all(...params);
  },

  findOne(filter = {}) {
    const results = this.find(filter);
    return results[0] || null;
  },

  create(data) {
    const stmt = getDB().prepare(`
      INSERT INTO reviews (exchange_id, reviewer_id, reviewee_id, rating, comment)
      VALUES (@exchange_id, @reviewer_id, @reviewee_id, @rating, @comment)
    `);
    const result = stmt.run({
      exchange_id: data.exchange,
      reviewer_id: data.reviewer,
      reviewee_id: data.reviewee,
      rating: data.rating,
      comment: data.comment || '',
    });
    return this.findById(result.lastInsertRowid);
  },

  findWithReviewer(filter = {}) {
    let sql = `
      SELECT rv.*, reviewer.name AS reviewer_name, reviewer.neighbourhood AS reviewer_neighbourhood,
             l.id AS listing_id, l.produce_name
      FROM reviews rv
      JOIN users reviewer ON rv.reviewer_id = reviewer.id
      JOIN exchange_requests er ON rv.exchange_id = er.id
      JOIN listings l ON er.listing_id = l.id
      WHERE 1=1
    `;
    const params = [];
    if (filter.reviewee) { sql += ' AND rv.reviewee_id = ?'; params.push(filter.reviewee); }
    sql += ' ORDER BY rv.created_at DESC';
    return getDB().prepare(sql).all(...params);
  },

  getRatingStats(revieweeId) {
    const row = getDB().prepare(`
      SELECT COALESCE(AVG(rating), 0) as avg, COUNT(*) as count
      FROM reviews WHERE reviewee_id = ?
    `).get(revieweeId);
    return { avg: row.avg, count: row.count };
  },
};

module.exports = Review;
