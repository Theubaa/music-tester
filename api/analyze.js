const multer = require('multer');

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

// Multer middleware wrapper for Vercel
const uploadMiddleware = upload.single('audio');

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST requests are allowed'
    });
  }

  // Process the file upload
  uploadMiddleware(req, res, async (err) => {
    try {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
              error: 'File too large',
              message: 'File size must be less than 50MB'
            });
          }
        }
        return res.status(400).json({ 
          error: 'Upload error',
          message: err.message 
        });
      }

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

      // Mock analysis result (replace with actual analysis logic)
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

      res.status(200).json(analysisResult);

    } catch (error) {
      console.error('Error processing audio:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  });
};
