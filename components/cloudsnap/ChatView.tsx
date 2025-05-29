import { useState, useEffect, useRef } from 'react';
import ChatBubble from './ChatBubble';
import TypingIndicator from './TypingIndicator';
import AccountFormBubble from './AccountFormBubble';
import PhotoUploadBubble from './PhotoUploadBubble';
import { ViewType } from '../../pages/Index';
import { Button } from '../ui/button';

interface ChatViewProps {
  onNavigate: (view: ViewType) => void;
}

type Message = {
  id: string;
  type: 'user' | 'assistant' | 'typing' | 'account-form' | 'account-choice' | 'permission-request' | 'photo-upload' | 'action-button' | 'embedding-choice' | 'embedding-progress';
  content: string;
  accountType?: 'create' | 'login';
  total?: number;
  progress?: number;
};

const ChatView = ({ onNavigate }: ChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'initial-1', type: 'user', content: 'Get Started' }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = [
    () => {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: 'typing-1', type: 'typing', content: '' }
        ]);
      }, 500);
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev.filter(m => m.type !== 'typing'),
          { id: 'assistant-2', type: 'assistant', content: "Let's set up your account. Choose an option:" }
        ]);
        setCurrentStep(1);
      }, 1000);
    },
    () => {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: 'choice-3', type: 'account-choice', content: 'Account options' }
        ]);
      }, 500);
    }
  ];

  useEffect(() => {
    if (currentStep < steps.length) {
      steps[currentStep]();
    }
  }, [currentStep]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleAccountChoice = (type: 'create' | 'login') => {
    setMessages(prev => [
      ...prev.filter(m => m.type !== 'account-choice'),
      { id: 'user-choice-4', type: 'user', content: type === 'create' ? 'Create Account' : 'Log In' },
      { id: 'form-5', type: 'account-form', content: 'Account form', accountType: type }
    ]);
  };

  const handleAccountSubmit = (email: string, password: string) => {
    setMessages(prev => [
      ...prev.filter(m => m.type !== 'account-form'),
      { id: 'user-form-6', type: 'user', content: `Account created with ${email}` },
      { id: 'typing-7', type: 'typing', content: '' }
    ]);

    setTimeout(() => {
      setMessages(prev => [
        ...prev.filter(m => m.type !== 'typing'),
        { id: 'assistant-8', type: 'assistant', content: '✅ Account created — welcome!' }
      ]);
    }, 1000);

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: 'assistant-9', type: 'assistant', content: 'I need permission to access your photos to get started.' },
        { id: 'permission-10', type: 'permission-request', content: 'Permission request' }
      ]);
    }, 2000);
  };

  const handlePermissionResponse = (granted: boolean) => {
    if (granted) {
      setMessages(prev => [
        ...prev.filter(m => m.type !== 'permission-request'),
        { id: 'user-permission-11', type: 'user', content: 'Allow Access' },
        { id: 'assistant-12', type: 'assistant', content: 'Great! Now you can select photos from your device.' },
        { id: 'photo-upload-13', type: 'photo-upload', content: 'Photo upload interface' }
      ]);
    } else {
      setMessages(prev => [
        ...prev.filter(m => m.type !== 'permission-request'),
        { id: 'user-permission-11', type: 'user', content: 'Deny Access' },
        { id: 'assistant-12', type: 'assistant', content: 'I need photo access to help you search. Please allow access to continue.' },
        { id: 'permission-13', type: 'permission-request', content: 'Permission request' }
      ]);
    }
  };

  const handlePhotoUploadComplete = (result: { totalFiles: number; totalSizeMB: number }) => {
    setMessages(prev => [
      ...prev.filter(m => m.type !== 'photo-upload'),
      { id: 'assistant-15', type: 'assistant', content: `✅ Successfully uploaded ${result.totalFiles} photos (${result.totalSizeMB} MB saved)` },
      { id: 'assistant-16', type: 'assistant', content: 'Would you like me to analyze your photos for smart search? This uses AI to understand what\'s in each photo, letting you search naturally like "mom and I at the beach".' },
      { id: 'embedding-choice-17', type: 'embedding-choice', content: 'Smart search options' }
    ]);
  };

  const handlePhotosSelected = (files: File[]) => {
    console.log(`Selected ${files.length} photos`);
  };

  const handleEmbeddingChoice = (enableSmartSearch: boolean) => {
    if (enableSmartSearch) {
      setMessages(prev => [
        ...prev.filter(m => m.type !== 'embedding-choice'),
        { id: 'user-embedding-18', type: 'user', content: 'Enable Smart Search' },
        { id: 'assistant-19', type: 'assistant', content: 'Excellent! I\'m now analyzing your photos with AI. This will take a moment as I understand what\'s in each image...' },
        { id: 'embedding-progress-20', type: 'embedding-progress', content: 'Processing photos', progress: 0 }
      ]);
      
      startEmbeddingProcess();
    } else {
      setMessages(prev => [
        ...prev.filter(m => m.type !== 'embedding-choice'),
        { id: 'user-embedding-18', type: 'user', content: 'Skip for Now' },
        { id: 'assistant-19', type: 'assistant', content: 'No problem! You can still browse your photos in the gallery. You can enable smart search later if you change your mind.' },
        { id: 'action-20', type: 'action-button', content: 'Start Browsing →' }
      ]);
    }
  };

  const startEmbeddingProcess = async () => {
    try {
      const response = await fetch('http://192.168.0.17:8081/api/process-embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.complete) {
                  setMessages(prev => [
                    ...prev.filter(m => m.type !== 'embedding-progress'),
                    { id: 'assistant-21', type: 'assistant', content: `🎉 Smart search is ready! I've analyzed all ${data.processed} photos.` },
                    { id: 'assistant-22', type: 'assistant', content: 'Now you can search naturally! Try things like "family at the beach", "birthday party", or "sunset photos".' },
                    { id: 'action-23', type: 'action-button', content: 'Start Searching →' }
                  ]);
                } else if (data.error) {
                  throw new Error(data.message);
                } else {
                  setMessages(prev => 
                    prev.map(m => 
                      m.type === 'embedding-progress' 
                        ? { ...m, progress: data.progress }
                        : m
                    )
                  );
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Embedding process error:', error);
      setMessages(prev => [
        ...prev.filter(m => m.type !== 'embedding-progress'),
        { id: 'assistant-error', type: 'assistant', content: 'Sorry, there was an error processing your photos. You can still use basic search.' },
        { id: 'action-error', type: 'action-button', content: 'Continue Anyway →' }
      ]);
    }
  };

  const handleStartSearching = () => {
    const hasSmartSearch = messages.some(m => m.id === 'assistant-21');
    onNavigate('search');
  };

  const renderMessage = (message: Message) => {
    switch (message.type) {
      case 'typing':
        return <TypingIndicator key={message.id} />;
      
      case 'account-choice':
        return (
          <div key={message.id} className="flex justify-start mb-4">
            <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-sm border border-separator max-w-[80%] animate-bubble-enter">
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleAccountChoice('create')}
                  className="bg-accent-primary hover:bg-blue-600 text-white font-rubik"
                >
                  Create Account
                </Button>
                <Button
                  onClick={() => handleAccountChoice('login')}
                  variant="outline"
                  className="border-accent-primary text-accent-primary hover:bg-accent-primary hover:text-white font-rubik"
                >
                  Log In
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'permission-request':
        return (
          <div key={message.id} className="flex justify-start mb-4">
            <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-sm border border-separator max-w-[80%] animate-bubble-enter">
              <div className="mb-3">
                <p className="font-rubik text-sm text-gray-700 mb-3">
                  CloudSnap would like to access your photos to help you search and organize them.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handlePermissionResponse(true)}
                  className="bg-accent-primary hover:bg-blue-600 text-white font-rubik"
                >
                  Allow Access
                </Button>
                <Button
                  onClick={() => handlePermissionResponse(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-rubik"
                >
                  Deny Access
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'account-form':
        return (
          <div key={message.id} className="flex justify-start mb-4">
            <AccountFormBubble 
              type={message.accountType || 'create'}
              onSubmit={handleAccountSubmit}
            />
          </div>
        );
      
      case 'photo-upload':
        return (
          <div key={message.id} className="flex justify-start mb-4">
            <PhotoUploadBubble 
              onPhotosSelected={handlePhotosSelected}
              onUploadComplete={handlePhotoUploadComplete}
            />
          </div>
        );
      
      case 'embedding-choice':
        return (
          <div key={message.id} className="flex justify-start mb-4">
            <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-sm border border-separator max-w-[80%] animate-bubble-enter">
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => handleEmbeddingChoice(true)}
                  className="bg-accent-primary hover:bg-blue-600 text-white font-rubik"
                >
                  Enable Smart Search
                </Button>
                <Button
                  onClick={() => handleEmbeddingChoice(false)}
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-rubik"
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'embedding-progress':
        return (
          <div key={message.id} className="flex justify-start mb-4">
            <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-sm border border-separator max-w-[80%] animate-bubble-enter">
              <div className="mb-2">
                <p className="font-rubik text-sm text-gray-700 mb-2">
                  Analyzing your photos with AI...
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-accent-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${message.progress || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 font-rubik mt-1">
                  {Math.round(message.progress || 0)}% complete
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'action-button':
        return (
          <div key={message.id} className="flex justify-start mb-4">
            <div className="bg-white p-4 rounded-2xl rounded-tl-md shadow-sm border border-separator max-w-[80%] animate-bubble-enter">
              <Button
                onClick={handleStartSearching}
                className="w-full bg-accent-primary hover:bg-blue-600 text-white px-6 py-3 rounded-full font-rubik"
              >
                {message.content}
              </Button>
            </div>
          </div>
        );
      
      default:
        return (
          <ChatBubble key={message.id} type={message.type as 'user' | 'assistant'}>
            {message.content}
          </ChatBubble>
        );
    }
  };

  return (
    <div className="min-h-screen bg-surface-light flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 pb-8 pt-16 md:pt-4">
        {messages.map(renderMessage)}
        <div ref={scrollRef} />
      </div>
    </div>
  );
};

export default ChatView;