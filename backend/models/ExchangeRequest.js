const { getDB } = require('../db/database');

const ExchangeRequest = {
  findById(id) {
    return getDB().prepare('SELECT * FROM exchange_requests WHERE id = ?').get(id);
  },

  find(filter = {}) {
    let sql = 'SELECT * FROM exchange_requests WHERE 1=1';
    const params = [];

    if (filter.requester) { sql += ' AND requester_id = ?'; params.push(filter.requester); }
    if (filter.owner) { sql += ' AND owner_id = ?'; params.push(filter.owner); }
    if (filter.listing) { sql += ' AND listing_id = ?'; params.push(filter.listing); }
    if (filter.status) {
      if (filter.status.$in) {
        const placeholders = filter.status.$in.map(() => '?').join(',');
        sql += ` AND status IN (${placeholders})`;
        params.push(...filter.status.$in);
      } else {
        sql += ' AND status = ?';
        params.push(filter.status);
      }
    }

    const sort = filter.$sort || 'created_at DESC';
    sql += ` ORDER BY ${sort}`;
    sql = sql.replace(/_id/g, '_id');

    const requests = getDB().prepare(sql).all(...params);
    return requests;
  },

  findOne(filter = {}) {
    const results = this.find(filter);
    return results[0] || null;
  },

  create(data) {
    const stmt = getDB().prepare(`
      INSERT INTO exchange_requests (listing_id, requester_id, owner_id, message, offered_listing_id, status)
      VALUES (@listing_id, @requester_id, @owner_id, @message, @offered_listing_id, @status)
    `);
    const result = stmt.run({
      listing_id: data.listing,
      requester_id: data.requester,
      owner_id: data.owner,
      message: data.message || '',
      offered_listing_id: data.offered_listing || null,
      status: data.status || 'Pending',
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
    getDB().prepare(`UPDATE exchange_requests SET ${fields.join(', ')} WHERE id = @id`).run(values);
    return this.findById(id);
  },

  count(filter = {}) {
    let sql = 'SELECT COUNT(*) as count FROM exchange_requests WHERE 1=1';
    const params = [];
    if (filter.requester) { sql += ' AND requester_id = ?'; params.push(filter.requester); }
    if (filter.owner) { sql += ' AND owner_id = ?'; params.push(filter.owner); }
    if (filter.listing) { sql += ' AND listing_id = ?'; params.push(filter.listing); }
    if (filter.status) {
      if (filter.status.$in) {
        const placeholders = filter.status.$in.map(() => '?').join(',');
        sql += ` AND status IN (${placeholders})`;
        params.push(...filter.status.$in);
      } else {
        sql += ' AND status = ?';
        params.push(filter.status);
      }
    }
    if (filter.$or) {
      const orClauses = filter.$or.map(cond => {
        const entries = Object.entries(cond);
        return entries.map(([k, v]) => `${k} = ?`).join(' AND ');
      }).join(' OR ');
      // This is simplified - for the specific use case in the codebase
    }
    const row = getDB().prepare(sql).get(...params);
    return row.count;
  },

  findWithListings(filter = {}) {
    let sql = `
      SELECT er.*, 
             l.produce_name, l.category, l.exchange_type, l.quantity, l.unit,
             owner.name AS owner_name, owner.neighbourhood AS owner_neighbourhood,
             requester.name AS requester_name, requester.neighbourhood AS requester_neighbourhood,
             offered.produce_name AS offered_produce_name
      FROM exchange_requests er
      JOIN listings l ON er.listing_id = l.id
      JOIN users owner ON er.owner_id = owner.id
      JOIN users requester ON er.requester_id = requester.id
      LEFT JOIN listings offered ON er.offered_listing_id = offered.id
      WHERE 1=1
    `;
    const params = [];
    if (filter.requester) { sql += ' AND er.requester_id = ?'; params.push(filter.requester); }
    if (filter.owner) { sql += ' AND er.owner_id = ?'; params.push(filter.owner); }
    if (filter.status && filter.status.$in) {
      const placeholders = filter.status.$in.map(() => '?').join(',');
      sql += ` AND er.status IN (${placeholders})`;
      params.push(...filter.status.$in);
    }
    sql += ' ORDER BY er.created_at DESC';
    return getDB().prepare(sql).all(...params);
  },
};

module.exports = ExchangeRequest;
