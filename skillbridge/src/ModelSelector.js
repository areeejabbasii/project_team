import React, { useState, useEffect } from 'react';
import { aiService } from './services/aiService';
import './ModelSelector.css';

const ModelSelector = () => {
  const [models, setModels] = useState([]);
  const [currentModel, setCurrentModel] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadModelInfo();
  }, []);

  const loadModelInfo = () => {
    const status = aiService.getApiStatus();
    setApiStatus(status);
    setModels(status.availableModels);
    setCurrentModel(status.currentModel);
  };

  const handleModelChange = (modelKey) => {
    const success = aiService.setModel(modelKey);
    if (success) {
      loadModelInfo();
    }
  };

  const testCurrentModel = async () => {
    setTesting(true);
    setTestResult(null);
    
    try {
      const result = await aiService.testApiConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="model-selector">
      <div className="model-selector-header">
        <h3>🤖 AI Model Configuration</h3>
        <button 
          onClick={testCurrentModel} 
          disabled={testing}
          className="test-button"
        >
          {testing ? '🔄 Testing...' : '🧪 Test Model'}
        </button>
      </div>

      <div className="api-status">
        <div className={`status-indicator ${apiStatus?.configured ? 'connected' : 'disconnected'}`}>
          {apiStatus?.configured ? '🟢 API Connected' : '🔴 API Not Configured'}
        </div>
        <div className="api-details">
          <small>Endpoint: {apiStatus?.apiUrl}</small>
        </div>
      </div>

      <div className="current-model">
        <h4>Current Model</h4>
        {currentModel && (
          <div className="model-card current">
            <div className="model-name">{currentModel.name}</div>
            <div className="model-description">{currentModel.description}</div>
            <div className="model-specs">
              Max Tokens: {currentModel.maxTokens} | 
              {currentModel.free ? ' 🆓 Free' : ' 💰 Paid'}
            </div>
          </div>
        )}
      </div>

      <div className="available-models">
        <h4>Available Models</h4>
        <div className="models-grid">
          {models.map((model) => (
            <div 
              key={model.key}
              className={`model-card ${model.isCurrent ? 'current' : ''}`}
              onClick={() => !model.isCurrent && handleModelChange(model.key)}
            >
              <div className="model-name">
                {model.name}
                {model.isCurrent && <span className="current-badge">Current</span>}
              </div>
              <div className="model-description">{model.description}</div>
              <div className="model-specs">
                Max: {model.maxTokens} tokens | 
                {model.free ? ' 🆓 Free' : ' 💰 Paid'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {testResult && (
        <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
          <h4>Test Result</h4>
          {testResult.success ? (
            <div>
              <div className="success-message">✅ Model is working correctly!</div>
              <div className="test-response">Response: {testResult.response}</div>
            </div>
          ) : (
            <div>
              <div className="error-message">❌ Test failed</div>
              <div className="error-details">Error: {testResult.error}</div>
            </div>
          )}
        </div>
      )}

      <div className="model-recommendations">
        <h4>💡 Model Recommendations</h4>
        <ul>
          <li><strong>Qwen 2.5 7B:</strong> Best for coding and technical discussions</li>
          <li><strong>Llama 3.1 8B:</strong> Great for general conversations and creative tasks</li>
          <li><strong>Mistral 7B:</strong> Good balance of speed and quality</li>
          <li><strong>Llama 3.2 3B:</strong> Fastest responses, good for simple queries</li>
        </ul>
      </div>
    </div>
  );
};

export default ModelSelector;