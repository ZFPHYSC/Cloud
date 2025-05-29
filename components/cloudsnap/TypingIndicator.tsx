
const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">
      <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-separator">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dots"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dots" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-typing-dots" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
