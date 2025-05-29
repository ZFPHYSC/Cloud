import { useState } from 'react';

interface ResultCardProps {
  image: string;
  caption: string;
  index: number;
  isRealImage?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ResultCard = ({ image, caption, index, isRealImage = false, className = '', style = {} }: ResultCardProps) => {
  const [imgError, setImgError] = useState(false);
  return (
    <div 
      className={`
        inline-block w-full break-inside-avoid 
        bg-white rounded-xl shadow-lg overflow-hidden 
        animate-bubble-enter border border-separator
        ${className}
      `}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        transform: 'perspective(1000px) rotateY(4deg)',
        ...style
      }}
    >
      <div className="h-44 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
        {isRealImage && !imgError ? (
          <img
            src={image}
            alt="Search result"
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : !isRealImage ? (
          <div className="text-4xl">{image}</div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm">Image unavailable</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-700 font-rubik">{caption}</p>
      </div>
    </div>
  );
};

export default ResultCard;