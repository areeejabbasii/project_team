# API Setup Guide

## OpenRouter Integration (Updated)

Your SkillBridge application now uses OpenRouter for better AI model access with multiple free options.

### Current Configuration

- **API Key**: `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`
- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Status**: ✅ Configured with OpenRouter
- **Location**: `.env` file (automatically secured in .gitignore)

### Available Free Models

The application now supports multiple free models you can switch between:

1. **Qwen 2.5 7B** (Default) - `qwen/qwen-2.5-7b-instruct:free`
   - Excellent for coding and technical discussions
   - Max tokens: 2000
   - Best for AWS learning content

2. **Llama 3.1 8B** - `meta-llama/llama-3.1-8b-instruct:free`
   - Great for general conversations and creative tasks
   - Max tokens: 2000
   - Most conversational

3. **Mistral 7B** - `mistralai/mistral-7b-instruct:free`
   - Good balance of speed and quality
   - Max tokens: 1800
   - Reliable all-around performance

4. **Llama 3.2 3B** - `meta-llama/llama-3.2-3b-instruct:free`
   - Fastest responses
   - Max tokens: 1500
   - Good for simple queries

### Model Management

Use the **🤖 AI Models** section in the dashboard to:
- View current model and status
- Switch between available models
- Test model connections
- See performance recommendations

### How It Works

1. **Real AI Responses**: Your assistants use OpenRouter's free models for dynamic responses
2. **Model Selection**: Choose the best model for your use case
3. **Conversation Memory**: Each session maintains full conversation history
4. **Fallback System**: If API fails, assistants use intelligent fallback responses
5. **Status Indicators**: UI shows connection status and current model

### Testing Your Setup

1. Go to Dashboard → **🤖 AI Models**
2. Click **🧪 Test Model** to verify connection
3. Try different models to see which works best
4. Check the status indicators for connection health

### Model Recommendations

- **For AWS Learning**: Qwen 2.5 7B (most accurate technical content)
- **For Career Coaching**: Llama 3.1 8B (best conversational flow)
- **For Quick Questions**: Llama 3.2 3B (fastest responses)
- **For General Use**: Mistral 7B (balanced performance)

### Assistant Personalities

Each AI assistant maintains their specialized behavior regardless of model:

1. **Scenario Master**: Creates realistic crisis scenarios for problem-solving
2. **Comeback Coach**: Provides personalized career recovery strategies  
3. **Chaos Engineer**: Designs challenging projects for skill development
4. **Mind Reader**: Conducts cognitive assessments through scenarios
5. **AWS Learning Assistant**: Comprehensive AWS education and certification prep

### Troubleshooting

**Model Not Responding:**
- Try switching to a different model in the AI Models section
- Check browser console for error messages
- Verify internet connection

**Rate Limits:**
- Free models have usage limits
- Switch to a different model if one is rate-limited
- Consider upgrading OpenRouter plan for higher limits

**API Connection Issues:**
- Verify API key is correct (starts with `sk-or-v1-`)
- Check for extra spaces in .env file
- Ensure key is active on OpenRouter dashboard

### Security Notes

- API key is stored in `.env` file (not committed to git)
- All API calls use secure HTTPS with proper authentication
- Conversation data is stored locally in browser session only
- No sensitive data is permanently stored

---

**Status**: ✅ Ready with multiple AI models and enhanced capabilities!