import React, { useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import AIPathDashboard from './AIPathDashboard';
import AIAssistant from './AIAssistant';
import MultiAssistantChat from './MultiAssistantChat';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'ai-paths', 'ai-assistant', 'multi-chat'
  const [selectedAIPath, setSelectedAIPath] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    setSelectedAIPath(null);
  };

  const handleNavigateToAIPaths = () => {
    setCurrentView('ai-paths');
  };

  const handleNavigateToMultiChat = () => {
    setCurrentView('multi-chat');
  };

  const handleSelectAIPath = (pathId) => {
    setSelectedAIPath(pathId);
    setCurrentView('ai-assistant');
  };

  const handleBackToPaths = () => {
    setCurrentView('ai-paths');
    setSelectedAIPath(null);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedAIPath(null);
  };

  const renderCurrentView = () => {
    if (!user) {
      return <Auth onLogin={handleLogin} />;
    }

    switch (currentView) {
      case 'ai-paths':
        return (
          <AIPathDashboard 
            user={user} 
            onSelectPath={handleSelectAIPath}
            onNavigateToMultiChat={handleNavigateToMultiChat}
          />
        );
      case 'ai-assistant':
        return (
          <AIAssistant 
            pathId={selectedAIPath}
            user={user}
            onBack={handleBackToPaths}
          />
        );
      case 'multi-chat':
        return (
          <MultiAssistantChat 
            user={user}
            onBack={handleBackToDashboard}
          />
        );
      default:
        return (
          <Dashboard 
            user={user} 
            onNavigateToAIPaths={handleNavigateToAIPaths}
            onNavigateToMultiChat={handleNavigateToMultiChat}
          />
        );
    }
  };

  return (
    <div className="App">
      {currentView !== 'ai-assistant' && currentView !== 'multi-chat' && (
        <header className="App-header">
          <h1>SkillBridge</h1>
          <p>Your Personalized Learning Journey</p>
          {user && (
            <div className="user-info">
              <span>Welcome, {user.name}!</span>
              {currentView !== 'dashboard' && (
                <button className="nav-btn" onClick={handleBackToDashboard}>
                  Dashboard
                </button>
              )}
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </header>
      )}
      <main className={currentView === 'ai-assistant' || currentView === 'multi-chat' ? 'full-height' : ''}>
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;