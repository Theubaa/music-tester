const multer = require('multer');
const fs = require('fs');
const path = require('path');

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

// Enhanced audio analysis function
function analyzeAudio(audioBuffer) {
  const bufferLength = audioBuffer.length;
  
  // Calculate basic audio features
  let sum = 0;
  let rms = 0;
  let zeroCrossings = 0;
  let peakCount = 0;
  let lastSample = 0;
  
  for (let i = 0; i < bufferLength; i++) {
    const sample = audioBuffer[i];
    sum += Math.abs(sample);
    rms += sample * sample;
    
    // Count zero crossings
    if (i > 0 && ((sample >= 0 && audioBuffer[i-1] < 0) || (sample < 0 && audioBuffer[i-1] >= 0))) {
      zeroCrossings++;
    }
    
    // Count peaks (simplified)
    if (i > 0 && Math.abs(sample) > 0.1 && Math.abs(sample) > Math.abs(lastSample)) {
      peakCount++;
    }
    lastSample = sample;
  }
  
  const average = sum / bufferLength;
  rms = Math.sqrt(rms / bufferLength);
  const energy = rms * rms;
  const dynamicRange = Math.max(...audioBuffer.map(Math.abs)) - Math.min(...audioBuffer.map(Math.abs));
  
  // Estimate BPM based on zero crossings and peaks
  const zeroCrossingRate = zeroCrossings / bufferLength;
  const peakRate = peakCount / bufferLength;
  const estimatedBPM = Math.max(60, Math.min(180, 60 + (zeroCrossingRate * 500) + (peakRate * 300)));
  
  // Estimate key based on energy distribution and frequency content
  const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
  const modes = ['major', 'minor'];
  const keyIndex = Math.floor((energy * 7) % 7);
  const modeIndex = Math.floor((dynamicRange * 2) % 2);
  const estimatedKey = keys[keyIndex] + ' ' + modes[modeIndex];
  
  // Calculate mood characteristics based on audio features
  const intensity = Math.min(1, energy * 5);
  const complexity = Math.min(1, zeroCrossingRate * 10);
  const smoothness = Math.min(1, 1 - complexity);
  
  // Danceability: high energy + moderate complexity
  const danceability = Math.min(1, Math.max(0, (intensity * 0.6 + complexity * 0.4)));
  
  // Happy: high energy + high complexity
  const happy = Math.min(1, Math.max(0, (intensity * 0.7 + complexity * 0.3)));
  
  // Sad: low energy + low complexity
  const sad = Math.min(1, Math.max(0, (1 - intensity) * 0.8 + (1 - complexity) * 0.2));
  
  // Relaxed: low energy + smooth
  const relaxed = Math.min(1, Math.max(0, (1 - intensity) * 0.6 + smoothness * 0.4));
  
  // Aggressive: high energy + high complexity + high peaks
  const aggressive = Math.min(1, Math.max(0, intensity * 0.5 + complexity * 0.3 + (peakRate * 2) * 0.2));
  
  return {
    bpm: Math.round(estimatedBPM),
    key: estimatedKey,
    danceability: danceability.toFixed(3),
    mood: {
      happy: happy.toFixed(3),
      sad: sad.toFixed(3),
      relaxed: relaxed.toFixed(3),
      aggressive: aggressive.toFixed(3)
    },
    features: {
      energy: intensity.toFixed(3),
      complexity: complexity.toFixed(3),
      dynamicRange: dynamicRange.toFixed(3),
      zeroCrossings: zeroCrossings,
      peaks: peakCount
    }
  };
}

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

      // Convert buffer to Float32Array for analysis
      const floatArray = new Float32Array(audioBuffer.buffer);
      
      // Perform audio analysis
      const analysis = analyzeAudio(floatArray);

      const analysisResult = {
        success: true,
        fileName: fileName,
        fileSize: fileSize,
        analysis: analysis,
        timestamp: new Date().toISOString()
      };

      console.log('Analysis completed:', analysis);
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
