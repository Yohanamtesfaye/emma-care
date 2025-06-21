require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());

// Start serial reader
require('./serialReader');

// Enhanced API endpoint
app.get('/api/data', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM sensor_data 
      ORDER BY timestamp DESC 
      LIMIT 20
    `);
    console.log(`📤 Sending ${rows.length} records to client`);
    res.json(rows);
  } catch (err) {
    console.error('🛑 API Error:', err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});