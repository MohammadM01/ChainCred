const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');
const mintRoutes = require('./routes/mint');
const verifyRoutes = require('./routes/verify');
const resumeRoutes = require('./routes/resume');
const certificateRoutes = require('./routes/certificates');
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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static file serving for uploaded files
app.use('/files', express.static(path.join(__dirname, '../uploads')));

// Specific file serving route for better error handling
app.get('/files/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);
  
  // Check if file exists
  if (!fs.existsSync(filePath)) {
    // Try to find the file by certificate ID if it's not found directly
    const uploadsDir = path.join(__dirname, '../uploads');
    const availableFiles = fs.readdirSync(uploadsDir);
    
    // Check if this might be a certificate ID and look for matching files
    let suggestedFiles = [];
    if (filename.includes('-') && filename.length > 32) {
      // This looks like a certificate ID, try to find matching files
      const baseId = filename.split('-')[0]; // Get the timestamp part
      suggestedFiles = availableFiles.filter(file => file.startsWith(baseId));
    }
    
    return res.status(404).json({ 
      success: false, 
      error: 'File not found',
      filename: filename,
      path: filePath,
      availableFiles: availableFiles.slice(0, 10), // Show first 10 available files
      suggestedFiles: suggestedFiles, // Show files that might match
      note: 'If you see suggested files, the certificate ID in the database might not match the actual filename. Try using one of the suggested files instead.'
    });
  }
  
  // Determine content type based on file extension
  const ext = path.extname(filename).toLowerCase();
  let contentType = 'application/octet-stream';
  
  if (ext === '.pdf') {
    contentType = 'application/pdf';
  } else if (ext === '.json') {
    contentType = 'application/json';
  }
  
  // Set headers and send file
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.sendFile(filePath);
});

// New route to serve files by certificate ID
app.get('/certificate/:certificateId', async (req, res) => {
  try {
    const { certificateId } = req.params;
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Uploads directory not found' 
      });
    }
    
    const availableFiles = fs.readdirSync(uploadsDir);
    
    // Look for files that might match this certificate ID
    let matchingFiles = [];
    
    // Check for exact matches first
    const exactPdf = `${certificateId}.pdf`;
    const exactJson = `${certificateId}.json`;
    
    if (availableFiles.includes(exactPdf)) {
      matchingFiles.push({ type: 'pdf', filename: exactPdf, exact: true });
    }
    if (availableFiles.includes(exactJson)) {
      matchingFiles.push({ type: 'json', filename: exactJson, exact: true });
    }
    
    // If no exact matches, look for partial matches (timestamp-based)
    if (matchingFiles.length === 0 && certificateId.includes('-')) {
      const timestamp = certificateId.split('-')[0];
      const partialMatches = availableFiles.filter(file => file.startsWith(timestamp));
      
      partialMatches.forEach(file => {
        if (file.endsWith('.pdf')) {
          matchingFiles.push({ type: 'pdf', filename: file, exact: false });
        } else if (file.endsWith('.json')) {
          matchingFiles.push({ type: 'json', filename: file, exact: false });
        }
      });
    }
    
    if (matchingFiles.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No matching files found for this certificate ID',
        certificateId: certificateId,
        availableFiles: availableFiles.slice(0, 20),
        note: 'The certificate ID might not match the actual filename. Check the available files list.'
      });
    }
    
    // Return the matching files
    res.json({
      success: true,
      certificateId: certificateId,
      matchingFiles: matchingFiles,
      note: 'Use the /files/[filename] endpoint to access these files directly'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test route to verify file serving
app.get('/test/files', (req, res) => {
  const uploadsDir = path.join(__dirname, '../uploads');
  try {
    if (!fs.existsSync(uploadsDir)) {
      return res.json({ 
        success: false, 
        error: 'Uploads directory does not exist',
        path: uploadsDir
      });
    }
    
    const files = fs.readdirSync(uploadsDir);
    res.json({
      success: true,
      uploadsDir: uploadsDir,
      fileCount: files.length,
      files: files.slice(0, 20) // Show first 20 files
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      uploadsDir: uploadsDir
    });
  }
});

// Routes (using defined variables to avoid redundant requires)
app.use('/', indexRoutes);  // Mount at root for health check
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/mint', mintRoutes);
app.use('/api/verify', verifyRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/certificates', certificateRoutes);

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
