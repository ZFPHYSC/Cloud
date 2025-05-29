
import { useMemo } from 'react';

const AnimatedPhotoCloud = () => {
  const photos = useMemo(() => {
    const photoArray = [];
    const photoEmojis = ['📸', '🌅', '🌆', '🏞️', '🎨', '🌺', '🦋', '🌊', '🍃', '⭐', '🌙', '☀️'];
    
    for (let i = 0; i < 24; i++) {
      const size = Math.random() * 120 + 80; // 80-200pt
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const emoji = photoEmojis[Math.floor(Math.random() * photoEmojis.length)];
      const delay = Math.random() * 18; // Stagger animation start
      
      photoArray.push({
        id: i,
        size,
        x,
        y,
        emoji,
        delay
      });
    }
    return photoArray;
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="absolute opacity-30 animate-photo-drift"
          style={{
            left: `${photo.x}%`,
            top: `${photo.y}%`,
            width: `${photo.size}px`,
            height: `${photo.size}px`,
            animationDelay: `${photo.delay}s`,
            fontSize: `${photo.size * 0.6}px`,
          }}
        >
          <div className="w-full h-full bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
            {photo.emoji}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedPhotoCloud;
