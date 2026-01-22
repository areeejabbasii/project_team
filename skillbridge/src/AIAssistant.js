import { useState, useEffect, useRef } from 'react';
import { aiService } from './services/aiService';
import './AIAssistant.css';

function AIAssistant({ pathId, onBack }) {
  const [messages, setMessages] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentAssistant, setCurrentAssistant] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  // Assistant configurations with exact behaviors as specified
  const assistantConfigs = {
    'field-specialist': {
      name: 'Quiz Assistant',
      icon: '🎯',
      color: '#4CAF50',
      systemMessage: 'You are a strict but helpful examiner. Do not give the answer immediately. Ask one question at a time and evaluate the user logic.',
      openingMessage: "I'm your Quiz Assistant. I'll be testing your technical knowledge with challenging questions.\n\nI won't just give you answers - I want to see how you think through problems. I'll ask one question at a time and evaluate your reasoning process.\n\nWhich technical domain would you like to be examined in?\n• **Software Engineering**\n• **Data Science** \n• **Cybersecurity**\n• **Cloud Computing**\n\nChoose your challenge!"
    },
    'career-resilience': {
      name: 'Career Coach',
      icon: '💪',
      color: '#2196F3',
      systemMessage: 'You are an expert career counselor. Focus on post-rejection recovery and pivot strategies. Use empathetic language and suggest specific industry networking tips.',
      openingMessage: "Hello, I'm your Career Coach. I understand you may be dealing with job rejection or career challenges right now.\n\nI'm here to help you recover, pivot, and come back stronger. I specialize in:\n• **Post-rejection recovery strategies**\n• **Career pivot planning**\n• **Industry networking techniques**\n• **Professional development guidance**\n\nTell me about your situation. What happened with your recent job search or career challenge? I'm here to listen and help you create a path forward."
    },
    'level-up-mentor': {
      name: 'Level-Up Mentor',
      icon: '🚀',
      color: '#FF9800',
      systemMessage: 'You are a growth strategist. Identify skill gaps and suggest advanced projects or certifications for the user next career level.',
      openingMessage: "Welcome! I'm your Level-Up Mentor and growth strategist.\n\nMy job is to identify exactly what's standing between you and your next career level, then create a strategic plan to get you there.\n\nI'll help you with:\n• **Skill gap analysis**\n• **Advanced project recommendations**\n• **Strategic certification planning**\n• **Career progression roadmaps**\n\nTo get started, tell me:\n1. What's your current role and experience level?\n2. What's your target position or next career goal?\n3. What do you think is holding you back right now?\n\nLet's build your growth strategy!"
    }
  };

  useEffect(() => {
    if (pathId && assistantConfigs[pathId]) {
      const config = assistantConfigs[pathId];
      setCurrentAssistant(config);
      initializeSession(config);
    }
  }, [pathId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeSession = (config) => {
    // Clear previous chat history
    setMessages([]);
    
    // Send opening message that matches assistant's personality
    setTimeout(() => {
      addMessage('assistant', config.openingMessage);
    }, 500);
  };

  const addMessage = (sender, content) => {
    const newMessage = {
      id: Date.now(),
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
    
    try {
      console.log('Sending message to AI service:', userMessage);
      const response = await generateAIResponse(userMessage);
      console.log('Received response:', response);
      addMessage('assistant', response);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', "I'm having trouble processing that right now. Let me try a different approach...");
      
      // Try fallback response
      setTimeout(() => {
        const fallbackResponse = `I understand you said: "${userMessage}". Let me help you with that. What specific aspect would you like to explore further?`;
        addMessage('assistant', fallbackResponse);
      }, 1000);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = async (userInput) => {
    if (!currentAssistant) return "I'm not sure how to help with that.";
    
    try {
      const response = await aiService.generateResponse(sessionId, userInput, pathId);
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm having trouble processing that right now. Could you try rephrasing your question?";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!currentAssistant) {
    return <div className="ai-assistant-loading">Loading AI Assistant...</div>;
  }

  return (
    <div className="ai-assistant" style={{ '--assistant-color': currentAssistant.color }}>
      <div className="ai-assistant-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Paths
        </button>
        <div className="assistant-info">
          <span className="assistant-icon">{currentAssistant.icon}</span>
          <h2>{currentAssistant.name}</h2>
        </div>
        <div className="session-info">
          <span className="session-label">
            {aiService.isApiConfigured() ? '🤖 AI-Powered Session' : '⚠️ Demo Mode'}
          </span>
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
              placeholder="Type your message..."
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
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;