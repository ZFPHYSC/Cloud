
import { useState } from 'react';
import SplashView from '../components/cloudsnap/SplashView';
import ChatView from '../components/cloudsnap/ChatView';
import SearchView from '../components/cloudsnap/SearchView';
import GalleryView from '../components/cloudsnap/GalleryView';

export type ViewType = 'splash' | 'chat' | 'search' | 'gallery';

const Index = () => {
  const [currentView, setCurrentView] = useState<ViewType>('splash');

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'splash':
        return <SplashView onNavigate={handleNavigate} />;
      case 'chat':
        return <ChatView onNavigate={handleNavigate} />;
      case 'search':
        return <SearchView onNavigate={handleNavigate} />;
      case 'gallery':
        return <GalleryView onNavigate={handleNavigate} />;
      default:
        return <SplashView onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-surface-light overflow-hidden">
      {renderCurrentView()}
    </div>
  );
};

export default Index;
