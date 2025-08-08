const express = require('express');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  }
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Music Analysis API is running',
    timestamp: new Date().toISOString()
  });
});

// Audio analysis endpoint
app.post('/api/analyze', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No audio file provided',
        message: 'Please upload an audio file using the "audio" field'
      });
    }

    const audioBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const fileSize = req.file.size;

    console.log(`Processing audio file: ${fileName} (${fileSize} bytes)`);

    // For now, return a mock response since we need to implement the actual analysis
    // This will be replaced with the actual analysis logic
    const analysisResult = {
      success: true,
      fileName: fileName,
      fileSize: fileSize,
      analysis: {
        bpm: Math.floor(Math.random() * 60) + 80, // Mock BPM between 80-140
        key: ['C', 'D', 'E', 'F', 'G', 'A', 'B'][Math.floor(Math.random() * 7)] + ['major', 'minor'][Math.floor(Math.random() * 2)],
        danceability: Math.random().toFixed(3),
        mood: {
          happy: Math.random().toFixed(3),
          sad: Math.random().toFixed(3),
          relaxed: Math.random().toFixed(3),
          aggressive: Math.random().toFixed(3)
        }
      },
      timestamp: new Date().toISOString()
    };

    res.json(analysisResult);

  } catch (error) {
    console.error('Error processing audio:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        message: 'File size must be less than 50MB'
      });
    }
  }
  
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    message: 'The requested resource was not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎵 Audio Analysis API: POST http://localhost:${PORT}/api/analyze`);
  console.log(`🌐 Web Interface: http://localhost:${PORT}`);
});

module.exports = app;
