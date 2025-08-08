# Deployment Guide

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Web Interface: http://localhost:3000
   - API Health Check: http://localhost:3000/api/health

### Testing

Run the API tests:
```bash
node test-api-simple.js
```

## Vercel Deployment

### Method 1: Using Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `music-analysis-api` (or your preferred name)
   - Directory: `.` (current directory)
   - Override settings: `N`

5. **Your API will be deployed to:**
   ```
   https://your-project-name.vercel.app
   ```

### Method 2: Using GitHub Integration

1. **Push your code to GitHub**

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Deploy

### Method 3: Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy using Vercel CLI**
   ```bash
   vercel --prod
   ```

## API Usage After Deployment

### Health Check
```bash
curl https://your-project-name.vercel.app/api/health
```

### Audio Analysis
```bash
curl -X POST \
  https://your-project-name.vercel.app/api/analyze \
  -F "audio=@/path/to/your/audio.mp3"
```

### JavaScript Example
```javascript
const formData = new FormData();
formData.append('audio', audioFile);

const response = await fetch('https://your-project-name.vercel.app/api/analyze', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

### Python Example
```python
import requests

with open('audio.mp3', 'rb') as f:
    files = {'audio': f}
    response = requests.post('https://your-project-name.vercel.app/api/analyze', files=files)
    result = response.json()
    print(result)
```

## Environment Variables

If you need to set environment variables:

```bash
vercel env add
```

## Troubleshooting

### Common Issues

1. **Build Errors**
   - Ensure all dependencies are in `package.json`
   - Check Node.js version compatibility

2. **API Not Working**
   - Verify the deployment URL
   - Check Vercel function logs
   - Test with the health endpoint first

3. **CORS Issues**
   - The API includes CORS headers
   - If issues persist, check browser console

### Checking Logs

```bash
vercel logs
```

### Redeploying

```bash
vercel --prod
```

## Production Considerations

1. **File Size Limits**
   - Vercel has a 50MB limit for serverless functions
   - Consider chunking large files if needed

2. **Rate Limiting**
   - Vercel has built-in rate limiting
   - Consider implementing additional rate limiting if needed

3. **Security**
   - The API accepts any audio file
   - Consider adding file type validation
   - Add authentication if needed

## Monitoring

- Use Vercel Analytics for monitoring
- Check function logs regularly
- Monitor API usage and performance

## Support

For issues:
1. Check Vercel documentation
2. Review function logs
3. Test locally first
4. Check GitHub issues
