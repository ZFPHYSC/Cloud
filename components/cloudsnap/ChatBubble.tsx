
import { ReactNode } from 'react';

interface ChatBubbleProps {
  type: 'user' | 'assistant';
  children: ReactNode;
  animate?: boolean;
}

const ChatBubble = ({ type, children, animate = true }: ChatBubbleProps) => {
  return (
    <div className={`flex ${type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`
          max-w-[80%] px-4 py-3 rounded-2xl font-rubik text-sm
          ${type === 'user' 
            ? 'bg-accent-primary text-white rounded-tr-md' 
            : 'bg-white text-gray-900 rounded-tl-md shadow-sm border border-separator'
          }
          ${animate ? 'animate-bubble-enter' : ''}
        `}
      >
        {children}
      </div>
    </div>
  );
};

export default ChatBubble;
