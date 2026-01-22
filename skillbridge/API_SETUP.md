# API Setup Guide

## Muse API Integration

Your SkillBridge application is now configured to use the Muse API for real AI responses.

### Current Configuration

- **API Key**: `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`
- **Status**: ✅ Configured and ready
- **Location**: `.env` file (automatically secured in .gitignore)

### How It Works

1. **Real AI Responses**: Your assistants now use the Muse API for dynamic, contextual responses
2. **Conversation Memory**: Each session maintains full conversation history for context
3. **Fallback System**: If API fails, assistants use intelligent fallback responses
4. **Status Indicators**: UI shows whether AI is connected or running in demo mode

### API Features

- **Context Awareness**: Assistants remember previous messages in the conversation
- **Personality Profiles**: Each assistant has a unique system prompt and behavior
- **Error Handling**: Graceful fallback to demo responses if API is unavailable
- **Security**: API key is stored securely and not committed to version control

### Testing the Connection

The app automatically detects if the API is configured and shows status indicators:
- 🤖 **AI Connected**: Real API responses active
- ⚠️ **Demo Mode**: Using fallback responses

### Assistant Personalities

Each AI assistant has a specialized system prompt:

1. **Scenario Master**: Creates realistic crisis scenarios for problem-solving practice
2. **Comeback Coach**: Provides personalized career recovery strategies
3. **Chaos Engineer**: Designs challenging projects for skill development
4. **Mind Reader**: Conducts cognitive assessments through interactive scenarios

### Usage

Simply start chatting with any assistant - they'll now provide:
- Dynamic, contextual responses based on your conversation
- Follow-up questions that build on previous interactions
- Personalized advice tailored to your specific situation
- Realistic scenarios that adapt based on your responses

### Security Notes

- API key is stored in `.env` file (not committed to git)
- All API calls are made securely with proper authentication
- Conversation data is stored locally in browser session only
- No sensitive data is permanently stored

---

**Status**: ✅ Ready to use with real AI responses!