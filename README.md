# Music Analysis API

A web-based audio analysis tool that analyzes music files for BPM, key, danceability, and mood characteristics. This project provides both a web interface and a REST API.

## Features

- **BPM Detection**: Analyzes beats per minute
- **Key Detection**: Identifies musical key and mode
- **Danceability**: Measures how danceable a track is
- **Mood Analysis**: Analyzes emotional characteristics:
  - Happy 😁
  - Sad 😢
  - Relaxed 😌
  - Aggressive 👊

## Local Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Music-detailer-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Web Interface: http://localhost:3000
   - API Health Check: http://localhost:3000/api/health

## API Usage

### Endpoints

#### Health Check
```bash
GET /api/health
```

#### Audio Analysis
```bash
POST /api/analyze
Content-Type: multipart/form-data
```

**Request Body:**
- `audio`: Audio file (MP3, WAV, etc.)

**Response:**
```json
{
  "success": true,
  "fileName": "song.mp3",
  "fileSize": 1234567,
  "analysis": {
    "bpm": 120,
    "key": "C major",
    "danceability": "0.756",
    "mood": {
      "happy": "0.234",
      "sad": "0.123",
      "relaxed": "0.456",
      "aggressive": "0.789"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Example API Usage

#### Using cURL
```bash
curl -X POST \
  http://localhost:3000/api/analyze \
  -H 'Content-Type: multipart/form-data' \
  -F 'audio=@/path/to/your/audio.mp3'
```

#### Using JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('http://localhost:3000/api/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

#### Using Python
```python
import requests

with open('audio.mp3', 'rb') as f:
    files = {'audio': f}
    response = requests.post('http://localhost:3000/api/analyze', files=files)
    result = response.json()
    print(result)
```

## Testing

Run the API tests:
```bash
node test-api.js
```

## Deployment

### Vercel Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Set environment variables** (if needed)
   ```bash
   vercel env add
   ```

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## Project Structure

```
Music-detailer-main/
├── api/
│   └── analyze.js          # Vercel serverless function
├── models/                 # ML models for analysis
├── src/
│   ├── main.js            # Main application logic
│   ├── featureExtraction.js
│   ├── inference.js
│   └── lib/               # External libraries
├── index.html             # Web interface
├── server.js              # Express server
├── package.json
└── README.md
```

## API Limits

- **File Size**: Maximum 50MB per audio file
- **Supported Formats**: MP3, WAV, OGG, M4A, and other audio formats
- **Rate Limiting**: No rate limiting implemented (add as needed)

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (invalid file, wrong format)
- `405`: Method not allowed
- `500`: Internal server error

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

AGPL-3.0

## Credits

- **Music Technology Group** - Original implementation
- **Essentia.js** - Audio analysis library
- **TensorFlow.js** - Machine learning framework
