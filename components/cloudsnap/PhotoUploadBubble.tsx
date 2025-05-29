import { useState, useRef } from 'react';
import { Button } from '../ui/button';

interface PhotoUploadBubbleProps {
  onPhotosSelected: (files: File[]) => void;
  onUploadComplete: (result: { totalFiles: number; totalSizeMB: number }) => void;
}

const PhotoUploadBubble = ({ onPhotosSelected, onUploadComplete }: PhotoUploadBubbleProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    setSelectedFiles(imageFiles);
    onPhotosSelected(imageFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('photos', file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      const response = await fetch('http://192.168.0.17:8081/api/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      setTimeout(() => {
        onUploadComplete({
          totalFiles: result.totalFiles,
          totalSizeMB: result.totalSizeMB
        });
      }, 500);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const totalSizeMB = selectedFiles.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);

  return (
    <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-sm border border-separator max-w-[90%] animate-bubble-enter">
      {selectedFiles.length === 0 ? (
        <div>
          <p className="font-rubik text-sm text-gray-700 mb-3">
            Select photos from your device to upload to CloudSnap.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-accent-primary hover:bg-blue-600 text-white font-rubik"
          >
            Select Photos
          </Button>
        </div>
      ) : (
        <div>
          <p className="font-rubik text-sm text-gray-700 mb-2">
            Selected {selectedFiles.length} photo{selectedFiles.length !== 1 ? 's' : ''} 
            ({totalSizeMB.toFixed(1)} MB)
          </p>
          
          {/* Show thumbnails */}
          <div className="grid grid-cols-4 gap-2 mb-3 max-h-32 overflow-y-auto">
            {selectedFiles.slice(0, 12).map((file, index) => (
              <div
                key={index}
                className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-xs border overflow-hidden"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Selected ${index + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
              </div>
            ))}
            {selectedFiles.length > 12 && (
              <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-xs">
                +{selectedFiles.length - 12}
              </div>
            )}
          </div>

          {isUploading ? (
            <div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-accent-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 font-rubik">
                Uploading... {Math.round(uploadProgress)}%
              </p>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex-1 font-rubik"
              >
                Change
              </Button>
              <Button
                onClick={handleUpload}
                className="flex-1 bg-accent-primary hover:bg-blue-600 text-white font-rubik"
              >
                Upload
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUploadBubble;
