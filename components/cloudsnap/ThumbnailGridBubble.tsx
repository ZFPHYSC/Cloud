
import { useState, useEffect } from 'react';

const ThumbnailGridBubble = () => {
  const [visibleThumbnails, setVisibleThumbnails] = useState(0);
  
  const thumbnails = [
    '🌅', '🏔️', '🌺', '🦋', 
    '🌊', '🌸', '🍃', '⭐',
    '🌙', '☀️', '🎨', '📸'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleThumbnails(prev => {
        if (prev < thumbnails.length) {
          return prev + 1;
        }
        clearInterval(timer);
        return prev;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-sm border border-separator max-w-[90%] animate-bubble-enter">
      <div className="grid grid-cols-4 gap-2">
        {thumbnails.map((emoji, index) => (
          <div
            key={index}
            className={`
              aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-2xl
              transition-opacity duration-300
              ${index < visibleThumbnails ? 'opacity-100' : 'opacity-0'}
            `}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThumbnailGridBubble;
