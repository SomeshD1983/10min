from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image
import io
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Stippling Image Generator",
    description="A FastAPI backend that converts images to stippled black-and-white art using dithering",
    version="1.0.0"
)

# Supported image formats
SUPPORTED_FORMATS = {"image/jpeg", "image/jpg", "image/png", "image/bmp", "image/tiff", "image/webp"}

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Stippling Image Generator API", 
        "status": "healthy",
        "endpoints": {
            "stipple": "POST /stipple - Upload an image to convert to stippled art"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint for deployment platforms"""
    return {"status": "healthy"}

@app.post("/stipple")
async def create_stippled_image(file: UploadFile = File(...)):
    """
    Convert an uploaded image to stippled black-and-white art using dithering.
    
    Args:
        file: Uploaded image file (JPEG, PNG, BMP, TIFF, WebP)
    
    Returns:
        StreamingResponse: Processed image as PNG
    """
    try:
        # Validate file type
        if file.content_type not in SUPPORTED_FORMATS:
            raise HTTPException(
                status_code=400, 
                detail=f"Unsupported file format. Supported formats: {', '.join(SUPPORTED_FORMATS)}"
            )
        
        # Read the uploaded file
        contents = await file.read()
        logger.info(f"Processing file: {file.filename}, size: {len(contents)} bytes")
        
        # Open image with Pillow
        try:
            image = Image.open(io.BytesIO(contents))
        except Exception as e:
            logger.error(f"Error opening image: {str(e)}")
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Convert to RGB first (handles RGBA, CMYK, etc.)
        if image.mode != 'RGB':
            image = image.convert('RGB')
            logger.info(f"Converted image from {image.mode} to RGB")
        
        # Convert to grayscale
        grayscale_image = image.convert('L')
        logger.info("Converted image to grayscale")
        
        # Apply dithering by converting to 1-bit mode (black and white)
        # This creates the stippling effect through Floyd-Steinberg dithering
        stippled_image = grayscale_image.convert('1')
        logger.info("Applied stippling effect using 1-bit dithering")
        
        # Convert back to RGB for PNG output (1-bit images can be problematic for some viewers)
        final_image = stippled_image.convert('RGB')
        
        # Save the processed image to BytesIO buffer
        img_buffer = io.BytesIO()
        final_image.save(img_buffer, format='PNG', optimize=True)
        img_buffer.seek(0)
        
        logger.info("Successfully processed image")
        
        # Return the processed image as streaming response
        return StreamingResponse(
            io.BytesIO(img_buffer.read()),
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename=stippled_{file.filename.split('.')[0]}.png"
            }
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error processing image")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=10000)