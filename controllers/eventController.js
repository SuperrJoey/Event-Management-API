const pool = require('../models/db');
const { isPastDate } = require('../utils/validators');


const createEvent = async (req, res) => {
    try {
        const { title, date_time, location, capacity } = req.body;

        if (!title || !date_time, !location || !capacity ) {
            return res.status(400).json({ error: 'All fields ae required'});
        }

        if (capacity <= 0 || capacity > 1000) {
            return res.status(400).json({ error: 'Capacity must be between 1 and 1000'});
        }

        const result = await pool.query(
            'INSERT INTO events (title, date_time, location, capacity) VALUES ($1, $2, $3, $4) RETURNING id',
      [title, date_time, location, capacity]
        );

        res.status(201).json({ event_id: result.rows[0].id, message: 'Event created successfully'});
    } catch (err) {
        console.error("Create event Error:", err);
        res.status(500).json({ error: 'Internal Server error' });
    }
};

const getEventDetails = async (req, res) => {
    const eventId = req.params.id;

    try {
        const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
        
        if (eventResult.rows.length === 0) {
            return res.status(404).json({ error: 'event not found' });
        }

        const event = eventResult.rows[0];

        const usersResult = await pool.query(`
             SELECT users.id, users.name, users.email
      FROM users
      JOIN event_registrations ON users.id = event_registrations.user_id
      WHERE event_registrations.event_id = $1
    `, [eventId]);

    event.registrations = usersResult.rows;
    res.json(event);
    } catch (err) {
        console.error('Get event details error:', err);
        res.status(500).json({ error : 'Internal server error'});
    }
};

const registerForEvent = async (req, res) => {
  const eventId = req.params.id;
  const { user_id } = req.body;

  try {
    // Check event exists
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (eventResult.rows.length === 0)
      return res.status(404).json({ error: 'Event not found' });

    const event = eventResult.rows[0];

    // Prevent past event registration
    if (isPastDate(event.date_time))
      return res.status(400).json({ error: 'Cannot register for a past event' });

    // Check if already registered
    const exists = await pool.query(
      'SELECT 1 FROM event_registrations WHERE event_id = $1 AND user_id = $2',
      [eventId, user_id]
    );
    if (exists.rows.length > 0)
      return res.status(409).json({ error: 'User already registered for this event' });

    // Check if event is full
    const regCount = await pool.query(
      'SELECT COUNT(*) FROM event_registrations WHERE event_id = $1',
      [eventId]
    );
    if (parseInt(regCount.rows[0].count) >= event.capacity)
      return res.status(400).json({ error: 'Event is full' });

    // Register user
    await pool.query(
      'INSERT INTO event_registrations (event_id, user_id) VALUES ($1, $2)',
      [eventId, user_id]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const cancelRegistration = async (req, res) => {
  const { id: eventId, userId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM event_registrations WHERE event_id = $1 AND user_id = $2 RETURNING *',
      [eventId, userId]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: 'User not registered for this event' });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (err) {
    console.error('Cancel Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const listUpcomingEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM events WHERE date_time > NOW()
       ORDER BY date_time ASC, location ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('List Upcoming Events Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getEventStats = async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await pool.query('SELECT * FROM events WHERE id = $1', [eventId]);
    if (event.rows.length === 0)
      return res.status(404).json({ error: 'Event not found' });

    const capacity = event.rows[0].capacity;

    const count = await pool.query(
      'SELECT COUNT(*) FROM event_registrations WHERE event_id = $1', [eventId]
    );

    const total = parseInt(count.rows[0].count);
    const percentage = ((total / capacity) * 100).toFixed(2);

    res.json({
      total_registrations: total,
      remaining_capacity: capacity - total,
      percentage_used: `${percentage}%`
    });
  } catch (err) {
    console.error('Stats Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createEvent };module.exports = {
  createEvent,
  getEventDetails,
  registerForEvent,
  cancelRegistration,
  listUpcomingEvents,
  getEventStats
};