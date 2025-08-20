const express = require('express');
const cors = require('cors');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const mintRoutes = require('./routes/mint');
const verifyRoutes = require('./routes/verify');
const resumeRoutes = require('./routes/resume');
const app = express();

/**
 * Main app configuration.
 * Enables CORS for frontend (localhost:3000).
 * Parses JSON and urlencoded bodies.
 * Mounts all routes under /api where appropriate.
 * For ChainCred MVP: Keeps it minimal, no extra middleware.
 */

// CORS for frontend integration (support localhost:3000 and Vite:5173)
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes (using defined variables to avoid redundant requires)
app.use('/', indexRoutes);  // Mount at root for health check
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/mint', mintRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/resume', resumeRoutes);

// Demo metadata route (serves seeded demo metadata) - removable for production
app.get('/demo/metadata/:id', (req, res) => {
  const id = req.params.id;
  // For seeded demo we'll return a JSON with expected shape
  const demo = {
    certificateID: id,
    studentWallet: '0x000000000000000000000000000000000000dEaD',
    issuerWallet: '0x000000000000000000000000000000000000bEEF',
    fileUrl: 'https://example.com/demo.pdf',
    metadataUrl: `${req.protocol}://${req.get('host')}/demo/metadata/${id}`,
    fileHash: 'demo-filehash-123',
    issuedDateISO: new Date().toISOString(),
  };
  res.json(demo);
});

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

module.exports = app;
