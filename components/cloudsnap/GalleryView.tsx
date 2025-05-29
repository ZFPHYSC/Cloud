import { useState, useEffect } from 'react';
import { ViewType } from '../../pages/Index';
import { X } from 'lucide-react';
import { Button } from '../ui/button';

interface GalleryViewProps {
  onNavigate: (view: ViewType) => void;
}

interface Photo {
  filename: string;
  path: string;
  size: number;
  uploadDate: string;
}

const GalleryView = ({ onNavigate }: GalleryViewProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('http://192.168.0.17:8081/api/photos');
      if (response.ok) {
        const data = await response.json();
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <div className="text-gray-500 font-rubik">Loading photos...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header with iPhone safe area padding */}
      <div className="flex items-center justify-between p-4 pt-16 border-b border-separator bg-white/80 backdrop-blur-md">
        <h1 className="text-xl font-semibold font-rubik">Gallery ({photos.length} photos)</h1>
        <Button
          onClick={() => onNavigate('search')}
          variant="ghost"
          size="sm"
          className="p-2"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Photo Grid */}
      <div className="p-2">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">📸</div>
            <h2 className="text-xl font-semibold font-rubik mb-2">No Photos Yet</h2>
            <p className="text-gray-600 font-rubik text-center mb-4">
              Upload some photos to see them in your gallery
            </p>
            <Button
              onClick={() => onNavigate('chat')}
              className="bg-accent-primary hover:bg-blue-600 text-white font-rubik"
            >
              Upload Photos
            </Button>
          </div>
        ) : (
          <div className="columns-3 gap-1 space-y-1">
            {photos.map((photo, index) => (
              <div
                key={photo.filename}
                className="break-inside-avoid mb-1 rounded-lg overflow-hidden shadow-sm border border-separator bg-white animate-bubble-enter cursor-pointer hover:shadow-lg transition-shadow duration-200"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <img
                  src={`http://192.168.0.17:8081${photo.path}`}
                  alt={photo.filename}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryView;