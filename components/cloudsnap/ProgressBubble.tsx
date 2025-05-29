
import { useState, useEffect } from 'react';

interface ProgressBubbleProps {
  total: number;
  onComplete: () => void;
}

const ProgressBubble = ({ total, onComplete }: ProgressBubbleProps) => {
  const [uploaded, setUploaded] = useState(0);
  const [savedMB, setSavedMB] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setUploaded(prev => {
        const next = prev + 1;
        setSavedMB(next * 2.3); // Simulate MB saved
        
        if (next >= total) {
          clearInterval(timer);
          setTimeout(onComplete, 500);
        }
        
        return next;
      });
    }, 250);

    return () => clearInterval(timer);
  }, [total, onComplete]);

  return (
    <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-separator max-w-[80%] animate-bubble-enter">
      <div className="font-rubik text-sm">
        Uploading {uploaded} / {total} • {savedMB.toFixed(1)} MB saved so far...
      </div>
    </div>
  );
};

export default ProgressBubble;
