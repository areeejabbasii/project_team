import { useState } from 'react';
import './AIPathDashboard.css';

function AIPathDashboard({ user, onSelectPath, onNavigateToMultiChat }) {
  const [selectedPath, setSelectedPath] = useState(null);

  const aiPaths = [
    {
      id: 'field-specialist',
      title: 'Scenario Master',
      description: 'Real-world tech scenarios, not boring quizzes',
      icon: '🎯',
      color: '#4CAF50'
    },
    {
      id: 'career-resilience',
      title: 'Comeback Coach',
      description: 'Turn job rejection into your comeback story',
      icon: '💪',
      color: '#2196F3'
    },
    {
      id: 'level-up-mentor',
      title: 'Chaos Engineer',
      description: 'Learn through controlled failure & chaos projects',
      icon: '🚀',
      color: '#FF9800'
    },
    {
      id: 'omni-aptitude',
      title: 'Mind Reader',
      description: 'Discover your hidden tech aptitudes',
      icon: '🧠',
      color: '#9C27B0'
    }
  ];

  const handleStartSession = (pathId) => {
    setSelectedPath(pathId);
    onSelectPath(pathId);
  };

  return (
    <div className="ai-path-dashboard">
      <div className="ai-path-header">
        <h1>Choose Your AI Path</h1>
        <p>These aren't your typical AI assistants. They're designed to push you, challenge you, and help you grow through controlled chaos.</p>
      </div>
      
      <div className="multi-chat-preview">
        <div className="multi-chat-card">
          <div className="multi-chat-icons">
            <span>🎯</span>
            <span>💪</span>
            <span>🚀</span>
            <span>🧠</span>
          </div>
          <h3>Multi-Assistant Command Center</h3>
          <p>Chat with multiple AI specialists simultaneously. Get diverse perspectives on complex problems.</p>
          <button className="multi-chat-btn" onClick={onNavigateToMultiChat}>
            🚀 Launch Command Center
          </button>
        </div>
      </div>
      
      <div className="ai-path-grid">
        {aiPaths.map((path) => (
          <div 
            key={path.id} 
            className={`ai-path-card ${selectedPath === path.id ? 'selected' : ''}`}
            style={{ '--card-color': path.color }}
          >
            <div className="card-icon">{path.icon}</div>
            <h3 className="card-title">{path.title}</h3>
            <p className="card-description">{path.description}</p>
            <button 
              className="start-session-btn"
              onClick={() => handleStartSession(path.id)}
            >
              Start Session
            </button>
          </div>
        ))}
      </div>
      
      <div className="ai-path-info">
        <div className="info-card">
          <h4>🤖 AI-Powered Learning</h4>
          <p>Each path uses specialized AI agents trained for specific career scenarios and skill development.</p>
        </div>
      </div>
    </div>
  );
}

export default AIPathDashboard;