import { useState, useEffect, useRef } from 'react';
import { aiService } from './services/aiService';
import './Dashboard.css';

function Dashboard({ user, onNavigateToAIPaths, onNavigateToMultiChat }) {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize with welcome message
    setTimeout(() => {
      const apiStatus = aiService.getApiStatus();
      const statusMessage = apiStatus.configured 
        ? "🤖 AI assistant is connected and ready!"
        : "⚠️ Running in demo mode - connect API key for full AI responses.";
      
      addMessage('assistant', `Welcome back, ${user?.name || 'demo-user'}! 🎯\n\nReady to continue your AWS learning journey?\n\n${statusMessage}\n\nI'm here to help with questions, provide guidance, or assist with your learning goals. What would you like to work on today?`);
    }, 500);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (sender, content) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      sender,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim()) return;

    const userMessage = currentInput.trim();
    setCurrentInput('');
    addMessage('user', userMessage);
    
    setIsTyping(true);
    
    setTimeout(async () => {
      try {
        const response = await generateAssistantResponse(userMessage);
        addMessage('assistant', response);
      } catch (error) {
        console.error('Error generating response:', error);
        addMessage('assistant', "I'm having some trouble right now. Let me try again...");
      } finally {
        setIsTyping(false);
      }
    }, 1000 + Math.random() * 1500);
  };

  const generateAssistantResponse = async (userMessage) => {
    try {
      console.log('Generating response for user message:', userMessage);
      console.log('Session ID:', sessionId);
      console.log('Assistant ID: learning-assistant');
      
      // Test if aiService is working at all
      const apiStatus = aiService.getApiStatus();
      console.log('API Status:', apiStatus);
      
      const response = await aiService.generateResponse(sessionId, userMessage, 'learning-assistant');
      console.log('Response received:', response);
      return response;
    } catch (error) {
      console.error('Error generating response:', error);
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
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>🚀 AWS Learning Assistant</h2>
        <div className="header-actions">
          <button className="nav-btn" onClick={onNavigateToMultiChat}>
            Multi-Assistant Chat
          </button>
          <button className="nav-btn" onClick={onNavigateToAIPaths}>
            AI Coaching Paths
          </button>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-area">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.sender}`}>
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
              placeholder="Ask me anything about AWS, your learning path, or get help with concepts..."
              rows="1"
              className="message-input"
            />
            <button 
              onClick={handleSendMessage}
              disabled={!currentInput.trim()}
              className="send-btn"
            >
              Send
            </button>
          </div>
          <div className="input-hint">
            💡 Try asking: "What should I learn next?", "Explain EC2 instances", or "Help me prepare for certification"
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;