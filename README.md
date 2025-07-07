# Stippling Image Generator API

A FastAPI backend that converts uploaded images into stippled black-and-white art using dithering techniques. The app processes images by converting them to grayscale and applying Floyd-Steinberg dithering to create a stippling effect.

## Features

- **Image Upload**: Accepts images in multiple formats (JPEG, PNG, BMP, TIFF, WebP)
- **Stippling Effect**: Converts images to artistic black-and-white stippled art
- **Fast Processing**: Uses Pillow for efficient image processing
- **Production Ready**: Includes proper error handling, logging, and health checks
- **Cloud Deployable**: Ready for deployment on Render, Railway, or similar platforms

## API Endpoints

- `GET /` - API information and health check
- `GET /health` - Health check endpoint for deployment platforms
- `POST /stipple` - Upload and process an image to create stippled art

## Local Development

### Prerequisites

- Python 3.9 or higher
- pip package manager

### Installation

1. Clone or download this repository:
```bash
git clone <repository-url>
cd stippling-generator
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running Locally

Start the development server:
```bash
uvicorn main:app --host 0.0.0.0 --port 10000 --reload
```

The API will be available at:
- **Application**: http://localhost:10000
- **Interactive API docs**: http://localhost:10000/docs
- **Alternative API docs**: http://localhost:10000/redoc

### Testing the API

You can test the API using curl:
```bash
curl -X POST "http://localhost:10000/stipple" \
     -H "accept: image/png" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@path/to/your/image.jpg" \
     --output stippled_output.png
```

Or use the interactive documentation at http://localhost:10000/docs to upload and test images directly in your browser.

## Production Deployment

### Deploy on Render

1. **Create a new Web Service** on [Render](https://render.com)

2. **Connect your repository** or upload your code

3. **Configure the service**:
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
   - **Port**: `10000`

4. **Environment Variables** (if needed):
   - Set any additional configuration variables

5. **Deploy**: Click "Create Web Service"

### Deploy on Railway

1. **Create a new project** on [Railway](https://railway.app)

2. **Connect your repository** or deploy from GitHub

3. **Configure deployment**:
   - Railway will automatically detect it's a Python app
   - Ensure the start command is: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Railway automatically sets the `PORT` environment variable

4. **Deploy**: Railway will automatically build and deploy

### Deploy on Other Platforms

For other platforms like Heroku, Fly.io, or DigitalOcean App Platform:

1. **Ensure the start command** uses the correct port:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000}
   ```

2. **Add a Procfile** (for Heroku):
   ```
   web: uvicorn main:app --host 0.0.0.0 --port $PORT
   ```

3. **Configure health checks** to use the `/health` endpoint

## API Usage Examples

### Python Example
```python
import requests

# Upload and process an image
with open('input_image.jpg', 'rb') as f:
    files = {'file': f}
    response = requests.post('http://localhost:10000/stipple', files=files)
    
    if response.status_code == 200:
        with open('stippled_output.png', 'wb') as output:
            output.write(response.content)
        print("Stippled image saved!")
    else:
        print(f"Error: {response.json()}")
```

### JavaScript/Node.js Example
```javascript
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function processImage() {
    const form = new FormData();
    form.append('file', fs.createReadStream('input_image.jpg'));
    
    try {
        const response = await axios.post('http://localhost:10000/stipple', form, {
            headers: form.getHeaders(),
            responseType: 'stream'
        });
        
        const writer = fs.createWriteStream('stippled_output.png');
        response.data.pipe(writer);
        
        writer.on('finish', () => console.log('Stippled image saved!'));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

processImage();
```

## Technical Details

### Image Processing Pipeline

1. **Input Validation**: Checks file format and size
2. **Format Conversion**: Ensures image is in RGB format
3. **Grayscale Conversion**: Converts color image to grayscale
4. **Dithering**: Applies Floyd-Steinberg dithering to create 1-bit black/white image
5. **Output Formatting**: Converts back to RGB and outputs as PNG

### Supported Image Formats

- JPEG/JPG
- PNG
- BMP
- TIFF
- WebP

### Error Handling

The API includes comprehensive error handling for:
- Unsupported file formats
- Invalid image files
- Processing errors
- Server errors

## Performance Considerations

- Images are processed in memory for fast performance
- Large images may require more processing time
- Consider implementing file size limits for production use
- The app is stateless and can be horizontally scaled

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is open source and available under the MIT License.