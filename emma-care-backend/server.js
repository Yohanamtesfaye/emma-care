require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const UserInteraction = require('./models/UserInteraction');

const app = express();
app.use(cors());
app.use(express.json());

// Start serial reader
require('./serialReader');

// Initialize user interactions table
UserInteraction.createTable();

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

// Get user interactions
app.get('/api/interactions', async (req, res) => {
  try {
    const { userId, limit = 1000 } = req.query;
    
    if (userId) {
      const interactions = await UserInteraction.getInteractionsByUser(userId, limit);
      res.json(interactions);
    } else {
      const interactions = await UserInteraction.getAllInteractions(limit);
      res.json(interactions);
    }
  } catch (err) {
    console.error('🛑 Interactions API Error:', err);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

// Save user interaction
app.post('/api/interactions', async (req, res) => {
  try {
    const interactionId = await UserInteraction.saveInteraction(req.body);
    res.json({ success: true, id: interactionId });
  } catch (err) {
    console.error('🛑 Save Interaction Error:', err);
    res.status(500).json({ error: 'Failed to save interaction' });
  }
});

// Get AI training statistics
app.get('/api/ai-stats', async (req, res) => {
  try {
    const stats = await UserInteraction.getFeedbackStats();
    res.json(stats);
  } catch (err) {
    console.error('🛑 AI Stats Error:', err);
    res.status(500).json({ error: 'Failed to fetch AI stats' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});