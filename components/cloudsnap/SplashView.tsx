
import { useState } from 'react';
import AnimatedPhotoCloud from './AnimatedPhotoCloud';
import { ViewType } from '../../pages/Index';

interface SplashViewProps {
  onNavigate: (view: ViewType) => void;
}

const SplashView = ({ onNavigate }: SplashViewProps) => {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleGetStarted = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      onNavigate('chat');
    }, 300);
  };

  return (
    <div className={`relative min-h-screen bg-surface-light flex flex-col items-center justify-center transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <AnimatedPhotoCloud />
      
      <div className="relative z-10 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-8 font-rubik">
          CloudSnap
        </h1>
        
        <button
          onClick={handleGetStarted}
          className="bg-accent-primary text-white px-8 py-4 rounded-full text-lg font-medium font-rubik shadow-lg hover:shadow-xl transition-all duration-250 animate-pulse-button hover:bg-blue-600"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default SplashView;
