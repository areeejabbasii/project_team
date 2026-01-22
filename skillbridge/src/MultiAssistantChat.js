import { useState, useEffect, useRef } from 'react';
import { aiService } from './services/aiService';
import './MultiAssistantChat.css';

function MultiAssistantChat({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeAssistants, setActiveAssistants] = useState([]);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  const assistantConfigs = {
    'scenario-master': {
      name: 'Scenario Master',
      icon: '🎯',
      color: '#4CAF50',
      personality: 'challenging',
      expertise: ['debugging', 'system-design', 'problem-solving'],
      greeting: "Ready to get thrown into the deep end? I don't do easy questions - only real-world chaos that'll make you sweat. Pick your poison: AI disasters, security breaches, or data science mysteries?"
    },
    'comeback-coach': {
      name: 'Comeback Coach',
      icon: '💪',
      color: '#2196F3',
      personality: 'brutally-honest',
      expertise: ['career-strategy', 'networking', 'interview-prep'],
      greeting: "Job rejection sucks, and I'm not going to sugarcoat it. But I'm also not going to let you wallow. Tell me exactly what happened - company, role, feedback - and I'll design a comeback strategy that'll make them regret passing on you."
    },
    'chaos-engineer': {
      name: 'Chaos Engineer',
      icon: '🚀',
      color: '#FF9800',
      personality: 'intense-motivational',
      expertise: ['project-design', 'skill-development', 'leadership'],
      greeting: "Comfortable is the enemy of growth. I'm going to design a project so challenging it'll either break you or make you 10x better. What's your current level and where do you want to be? Time to embrace the chaos."
    },
    'mind-reader': {
      name: 'Mind Reader',
      icon: '🧠',
      color: '#9C27B0',
      personality: 'analytical-probing',
      expertise: ['aptitude-testing', 'skill-assessment', 'career-guidance'],
      greeting: "I can tell more about your tech aptitude from one conversation than most tests can from 100 questions. I'm going to probe how you think, not what you've memorized. Ready to discover what your brain is really wired for?"
    }
  };

  useEffect(() => {
    // Initialize with welcome message and API status
    setTimeout(() => {
      const apiStatus = aiService.getApiStatus();
      const statusMessage = apiStatus.configured 
        ? "🤖 AI assistants are connected and ready!"
        : "⚠️ Running in demo mode - connect API key for full AI responses.";
      
      addMessage('system', `Welcome to the Multi-Assistant Command Center! 🚀\n\n${statusMessage}\n\nYou can chat with multiple AI specialists simultaneously. Each has their own expertise and personality. Choose who you want to activate, or let them all join the conversation!`);
    }, 500);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (sender, content, assistantId = null) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sender,
      content,
      assistantId,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const activateAssistant = (assistantId) => {
    if (!activeAssistants.includes(assistantId)) {
      const config = assistantConfigs[assistantId];
      setActiveAssistants(prev => [...prev, assistantId]);
      
      setTimeout(() => {
        addMessage('assistant', `**${config.name} has joined the chat** ${config.icon}\n\n${config.greeting}`, assistantId);
      }, 500);
    }
  };

  const deactivateAssistant = (assistantId) => {
    setActiveAssistants(prev => prev.filter(id => id !== assistantId));
    const config = assistantConfigs[assistantId];
    addMessage('system', `${config.name} has left the conversation.`);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage = currentInput.trim();
    setCurrentInput('');
    addMessage('user', userMessage);
    
    console.log('Active assistants:', activeAssistants);
    console.log('User message:', userMessage);
    
    // Determine which assistants should respond
    const respondingAssistants = determineRespondingAssistants(userMessage);
    console.log('Responding assistants (direct mentions):', respondingAssistants);
    
    if (respondingAssistants.length === 0 && activeAssistants.length > 0) {
      // If no specific assistant is targeted, let the most relevant one respond
      const relevantAssistant = findMostRelevantAssistant(userMessage);
      console.log('Most relevant assistant:', relevantAssistant);
      if (relevantAssistant) {
        respondingAssistants.push(relevantAssistant);
      }
    }
    
    console.log('Final responding assistants:', respondingAssistants);
    
    // If still no responding assistants, make the first active one respond
    if (respondingAssistants.length === 0 && activeAssistants.length > 0) {
      console.log('No responding assistants found, using first active assistant:', activeAssistants[0]);
      respondingAssistants.push(activeAssistants[0]);
    }

    // Generate responses from each responding assistant
    for (const assistantId of respondingAssistants) {
      setIsTyping(true);
      
      // Use an immediately invoked async function to handle each assistant separately
      (async (currentAssistantId) => {
        try {
          await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
          console.log('Generating response for assistant:', currentAssistantId);
          const response = await generateAssistantResponse(currentAssistantId, userMessage);
          console.log('Response received:', response);
          addMessage('assistant', response, currentAssistantId);
        } catch (error) {
          console.error('Error generating response:', error);
          addMessage('assistant', "I'm having some trouble right now. Let me try again...", currentAssistantId);
        } finally {
          setIsTyping(false);
        }
      })(assistantId);
    }
  };

  const determineRespondingAssistants = (message) => {
    const lowerMessage = message.toLowerCase();
    const responding = [];

    // Check for direct mentions
    Object.keys(assistantConfigs).forEach(id => {
      const config = assistantConfigs[id];
      if (lowerMessage.includes(config.name.toLowerCase()) || 
          lowerMessage.includes(id.replace('-', ' '))) {
        if (activeAssistants.includes(id)) {
          responding.push(id);
        }
      }
    });

    return responding;
  };

  const findMostRelevantAssistant = (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Keyword matching for expertise areas
    const expertiseKeywords = {
      'scenario-master': ['debug', 'error', 'problem', 'issue', 'bug', 'crash', 'scenario', 'technical', 'system'],
      'comeback-coach': ['job', 'interview', 'rejection', 'career', 'application', 'company', 'feedback'],
      'chaos-engineer': ['project', 'learn', 'skill', 'level up', 'grow', 'challenge', 'mentor'],
      'mind-reader': ['test', 'aptitude', 'assessment', 'evaluate', 'strength', 'weakness', 'talent']
    };

    let bestMatch = null;
    let maxScore = 0;

    Object.keys(expertiseKeywords).forEach(assistantId => {
      if (!activeAssistants.includes(assistantId)) return;
      
      const keywords = expertiseKeywords[assistantId];
      const score = keywords.reduce((acc, keyword) => {
        return acc + (lowerMessage.includes(keyword) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestMatch = assistantId;
      }
    });

    return bestMatch;
  };

  const generateAssistantResponse = async (assistantId, userMessage) => {
    try {
      console.log('MultiAssistantChat: Generating response for assistant:', assistantId, 'message:', userMessage);
      
      // Simple test response first
      if (userMessage.toLowerCase().includes('test')) {
        return `Test response from ${assistantId}: I received your message "${userMessage}"`;
      }
      
      const response = await aiService.generateResponse(sessionId, userMessage, assistantId);
      console.log('MultiAssistantChat: Response received:', response);
      return response;
    } catch (error) {
      console.error('MultiAssistantChat: Error generating response:', error);
      return `I'm having trouble processing that right now. Error: ${error.message}`;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="multi-assistant-chat">
      <div className="chat-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h2>Multi-Assistant Command Center</h2>
        <div className="header-status">
          <div className="active-count">
            {activeAssistants.length} Active
          </div>
          <div className="api-status">
            {aiService.isApiConfigured() ? '🤖 AI Connected' : '⚠️ Demo Mode'}
          </div>
          <button 
            className="test-api-btn"
            onClick={async () => {
              console.log('Testing API connection...');
              const result = await aiService.testApiConnection();
              console.log('API test result:', result);
              addMessage('system', `API Test: ${result.success ? '✅ Connected' : '❌ Failed - ' + result.error}`);
            }}
          >
            Test API
          </button>
        </div>
      </div>

      <div className="assistant-selector">
        {Object.keys(assistantConfigs).map(assistantId => {
          const config = assistantConfigs[assistantId];
          const isActive = activeAssistants.includes(assistantId);
          
          return (
            <button
              key={assistantId}
              className={`assistant-toggle ${isActive ? 'active' : ''}`}
              style={{ '--assistant-color': config.color }}
              onClick={() => isActive ? deactivateAssistant(assistantId) : activateAssistant(assistantId)}
            >
              <span className="assistant-icon">{config.icon}</span>
              <span className="assistant-name">{config.name}</span>
              {isActive && <span className="active-indicator">●</span>}
            </button>
          );
        })}
      </div>

      <div className="chat-container">
        <div className="messages-area">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
              {message.sender === 'assistant' && message.assistantId && (
                <div className="assistant-label" style={{ '--assistant-color': assistantConfigs[message.assistantId]?.color }}>
                  <span className="assistant-icon">{assistantConfigs[message.assistantId]?.icon}</span>
                  <span className="assistant-name">{assistantConfigs[message.assistantId]?.name}</span>
                </div>
              )}
              <div className="message-content">
                {message.content.split('\n').map((line, index) => (
                  <div key={index}>{line}</div>
                ))}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message assistant typing">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={activeAssistants.length > 0 ? "Type your message..." : "Activate an assistant first..."}
              rows="1"
              className="message-input"
              disabled={activeAssistants.length === 0}
            />
            <button 
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || activeAssistants.length === 0}
              className="send-btn"
            >
              Send
            </button>
          </div>
          {activeAssistants.length > 0 && (
            <div className="input-hint">
              💡 Mention an assistant by name to direct your message, or let the most relevant one respond
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultiAssistantChat;