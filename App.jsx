import React, { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [stippledImageUrl, setStippledImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle file selection and create preview
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    // Clear previous state
    setError(null);
    setStippledImageUrl(null);
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Clean up previous preview URL to prevent memory leaks
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  // Convert image to stippling art via API
  const handleConvertToStipple = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Prepare form data for API
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Call the stippling API
      const response = await fetch('https://stippling-backend.onrender.com/stipple', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      // Get the image blob from response
      const blob = await response.blob();
      
      // Clean up previous stippled image URL
      if (stippledImageUrl) {
        URL.revokeObjectURL(stippledImageUrl);
      }
      
      // Create URL for the stippled image
      const imageUrl = URL.createObjectURL(blob);
      setStippledImageUrl(imageUrl);

    } catch (err) {
      console.error('Error converting image:', err);
      setError(err.message || 'Failed to convert image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Download the stippled image
  const handleDownload = () => {
    if (stippledImageUrl) {
      const link = document.createElement('a');
      link.href = stippledImageUrl;
      link.download = `stippled-art-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Cleanup URLs on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (stippledImageUrl) URL.revokeObjectURL(stippledImageUrl);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Stippling Art Generator
          </h1>
          <p className="mt-3 text-lg text-gray-600 sm:text-xl md:mt-5">
            Transform your images into beautiful stippling artwork
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8">
          
          {/* File Upload Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose an image to convert
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {previewUrl && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Original Image</h3>
              <div className="flex justify-center">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-96 max-w-full rounded-lg shadow-md object-contain"
                />
              </div>
            </div>
          )}

          {/* Convert Button */}
          {selectedFile && (
            <div className="mb-8 text-center">
              <button
                onClick={handleConvertToStipple}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Converting...
                  </>
                ) : (
                  'Convert to Stipple Art'
                )}
              </button>
            </div>
          )}

          {/* Stippled Result */}
          {stippledImageUrl && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Stippled Artwork</h3>
              <div className="flex justify-center mb-4">
                <img 
                  src={stippledImageUrl} 
                  alt="Stippled Art" 
                  className="max-h-96 max-w-full rounded-lg shadow-md object-contain"
                />
              </div>
              
              {/* Download Button */}
              <div className="text-center">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Stippled Art
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Upload an image and transform it into stunning stippling artwork
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
