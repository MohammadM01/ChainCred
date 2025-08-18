const express = require('express');
const cors = require('cors');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const mintRoutes = require('./routes/mint');
const verifyRoutes = require('./routes/verify');

const app = express();

/**
 * Main app configuration.
 * Enables CORS for frontend (localhost:3000).
 * Parses JSON and urlencoded bodies.
 * Mounts all routes under /api where appropriate.
 * For ChainCred MVP: Keeps it minimal, no extra middleware.
 */

// CORS for frontend integration (fixed origin to 3000)
app.use(cors({
  origin: 'http://localhost:3000',  // For React frontend; add more if needed
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (use the defined variables for clarity)
app.use('/', indexRoutes);  // Mount index at root '/' for health check
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/mint', mintRoutes);
app.use('/api/verify', verifyRoutes);

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

module.exports = app;
