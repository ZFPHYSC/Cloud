import { useState, useEffect, useRef } from 'react';
import { ViewType } from '../../pages/Index';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Grid, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import ResultCard from './ResultCard';

interface SearchViewProps {
  onNavigate: (view: ViewType) => void;
}

interface Photo {
  filename: string;
  path: string;
  size: number;
  uploadDate: string;
  hasEmbedding?: boolean;
}

interface SearchResult {
  filename: string;
  path: string;
  caption: string;
  confidence?: number;
}

type Message = {
  id: string;
  type: 'user' | 'assistant' | 'typing' | 'results';
  content: string;
  results?: SearchResult[];
};

const SearchView = ({ onNavigate }: SearchViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [smartSearchEnabled, setSmartSearchEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentResultIndices, setCurrentResultIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    checkSmartSearchStatus();
  }, []);

  const checkSmartSearchStatus = async () => {
    try {
      const response = await fetch('http://192.168.0.17:8081/api/photos');
      if (response.ok) {
        const data = await response.json();
        setSmartSearchEnabled(data.smartSearchEnabled || false);
        
        // Set initial message based on smart search status
        if (data.smartSearchEnabled) {
          setMessages([
            { id: '1', type: 'assistant', content: '✨ Smart search is enabled! Try searching for things like "mom and I at the beach" or "blue shirt outdoors".' }
          ]);
        } else {
          setMessages([
            { id: '1', type: 'assistant', content: 'Your photos are ready! Basic search is available. For more intelligent search, enable smart search in settings.' }
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to check smart search status:', error);
      setMessages([
        { id: '1', type: 'assistant', content: 'Your photos are ready! What would you like to search for?' }
      ]);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    setIsSearching(true);
    
    // Add user query
    setMessages(prev => [
      ...prev,
      { id: `user-${Date.now()}`, type: 'user', content: query }
    ]);

    // Show typing indicator
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: 'typing', type: 'typing', content: '' }
      ]);
    }, 100);

    try {
      // Call the smart search API
      const response = await fetch('http://192.168.0.17:8081/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          useSmartSearch: smartSearchEnabled
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        setMessages(prev => [
          ...prev.filter(m => m.type !== 'typing'),
          { 
            id: `results-${Date.now()}`, 
            type: 'results', 
            content: 'Search results',
            results: data.results.length > 0 ? data.results : [
              { 
                filename: 'no-results', 
                path: '', 
                caption: `No photos found matching "${query}". ${smartSearchEnabled ? 'Try different keywords or descriptions.' : 'Enable smart search for better results.'}` 
              }
            ]
          }
        ]);
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      
      setMessages(prev => [
        ...prev.filter(m => m.type !== 'typing'),
        { 
          id: `error-${Date.now()}`, 
          type: 'assistant', 
          content: 'Sorry, I had trouble searching. Please try again.' 
        }
      ]);
    } finally {
      setIsSearching(false);
      setQuery('');
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'typing') {
      return <TypingIndicator key={message.id} />;
    }
    
    if (message.type === 'results') {
      const hasResults = message.results && message.results.length > 0 && message.results[0].path !== '';
      if (!hasResults) {
        return (
          <div key={message.id} className="mb-6">
            <div className="flex justify-start mb-4">
              <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-md shadow-sm border border-separator">
                <span className="text-sm font-rubik text-gray-700">
                  {message.results?.[0]?.caption || 'No results found'}
                </span>
              </div>
            </div>
          </div>
        );
      }
      // Ensure navigation works immediately by initializing currentResultIndices
      if (currentResultIndices[message.id] === undefined) {
        setCurrentResultIndices(prev => ({ ...prev, [message.id]: 0 }));
      }
      const totalResults = message.results.length;
      const currentIndex = currentResultIndices[message.id] || 0;
      const showPrev = currentIndex > 0;
      const showNext = currentIndex < totalResults - 1;

      const handlePrevResult = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (showPrev) {
          setCurrentResultIndices(prev => ({
            ...prev,
            [message.id]: prev[message.id] - 1
          }));
        }
      };
      const handleNextResult = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (showNext) {
          setCurrentResultIndices(prev => ({
            ...prev,
            [message.id]: prev[message.id] + 1
          }));
        }
      };

      return (
        <div key={message.id} className="mb-6">
          <div className="flex justify-start mb-4">
            <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-md shadow-sm border border-separator">
              <span className="text-sm font-rubik text-gray-700">
                {`Found ${totalResults} photo${totalResults !== 1 ? 's' : ''}:`}
              </span>
            </div>
          </div>
          <div className="flex justify-center items-center">
            {/* Left peek */}
            {showPrev && (
              <div
                className="h-[320px] w-[40px] flex items-center justify-center cursor-pointer select-none"
                onClick={handlePrevResult}
              >
                <ResultCard
                  key={currentIndex - 1}
                  image={`http://192.168.0.17:8081${message.results[currentIndex - 1].path}`}
                  caption={message.results[currentIndex - 1].caption}
                  index={currentIndex - 1}
                  isRealImage={true}
                  className="pointer-events-none opacity-50 scale-95 blur-[1px] shadow-md"
                  style={{ width: 36, height: 200 }}
                />
              </div>
            )}
            {/* Main card, scrollable content */}
            <div
              className="relative z-10 cursor-pointer"
              style={{ width: 320, maxWidth: '90vw' }}
              onClick={handleNextResult}
            >
              <ResultCard
                key={currentIndex}
                image={`http://192.168.0.17:8081${message.results[currentIndex].path}`}
                caption={message.results[currentIndex].caption}
                index={currentIndex}
                isRealImage={true}
                className="shadow-2xl overflow-y-auto max-h-[340px]"
                style={{ transition: 'all 0.2s' }}
              />
              {/* Left click zone for prev */}
              {showPrev && (
                <div
                  className="absolute left-0 top-0 h-full w-1/4 z-20 cursor-pointer"
                  onClick={handlePrevResult}
                  style={{ background: 'transparent' }}
                />
              )}
              {/* Right click zone for next */}
              {showNext && (
                <div
                  className="absolute right-0 top-0 h-full w-1/4 z-20 cursor-pointer"
                  onClick={handleNextResult}
                  style={{ background: 'transparent' }}
                />
              )}
            </div>
            {/* Right peek */}
            {showNext && (
              <div
                className="h-[320px] w-[40px] flex items-center justify-center cursor-pointer select-none"
                onClick={handleNextResult}
              >
                <ResultCard
                  key={currentIndex + 1}
                  image={`http://192.168.0.17:8081${message.results[currentIndex + 1].path}`}
                  caption={message.results[currentIndex + 1].caption}
                  index={currentIndex + 1}
                  isRealImage={true}
                  className="pointer-events-none opacity-50 scale-95 blur-[1px] shadow-md"
                  style={{ width: 36, height: 200 }}
                />
              </div>
            )}
          </div>
          {/* Dots indicator */}
          <div className="flex justify-center mt-2 gap-1 z-30">
            {Array.from({ length: totalResults }).map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full ${currentIndex === idx ? 'bg-accent-primary' : 'bg-gray-300'}`}
                onClick={() => setCurrentResultIndices(prev => ({ ...prev, [message.id]: idx }))}
              />
            ))}
          </div>
        </div>
      );
    }

    return (
      <ChatBubble key={message.id} type={message.type as 'user' | 'assistant'}>
        {message.content}
      </ChatBubble>
    );
  };

  return (
    <div className="min-h-screen bg-surface-light flex flex-col">
      {/* Chat History with proper top padding for iPhone safe area */}
      <div className="flex-1 overflow-y-auto p-4 pt-20 pb-40">
        {messages.map(renderMessage)}
        <div ref={scrollRef} />
      </div>

      {/* Fixed Bottom Navigation Area */}
      <div className="fixed bottom-4 left-4 right-4 space-y-3">
        {/* Gallery Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => onNavigate('gallery')}
            className="bg-white/90 backdrop-blur-md border border-separator text-gray-700 hover:bg-white shadow-lg px-6 py-3 rounded-2xl font-rubik"
            variant="outline"
          >
            <Grid className="w-5 h-5 mr-2" />
            View Gallery
          </Button>
        </div>

        {/* Search Bar */}
        <div className="bg-white/90 backdrop-blur-md border border-separator rounded-2xl shadow-lg p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={smartSearchEnabled 
                  ? "Search naturally: 'family at the beach'..." 
                  : "Search your photos..."
                }
                className="flex-1 font-rubik border-separator focus:border-accent-primary min-h-14 bg-white/50 pr-10"
                disabled={isSearching}
              />
              {smartSearchEnabled && (
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-accent-primary" />
              )}
            </div>
            <Button 
              type="submit" 
              disabled={!query.trim() || isSearching}
              className="px-6 bg-accent-primary hover:bg-blue-600 font-rubik min-h-14"
            >
              Search
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SearchView;