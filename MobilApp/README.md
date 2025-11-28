# React Native AI Chatbot

A single-page React Native AI chatbot application that integrates with a conversational AI API. The application provides a seamless chat experience with product recommendations and in-app browsing capabilities.

## Features

- **AI Conversation**: Real-time chat with AI assistant using streaming API
- **Session Management**: Automatic generation and persistence of unique user sessions
- **Conversation History**: Maintains chat history per user session with local storage
- **Product Display**: Renders product recommendations as interactive buttons
- **In-App Browsing**: Opens product pages in modal WebView while keeping chat accessible
- **End Conversation**: Ability to end conversation and reset chat session
- **Feedback Form**: Post-conversation survey/feedback collection

## Prerequisites

- Node.js >= 20
- React Native development environment set up
- iOS: Xcode and CocoaPods
- Android: Android Studio and Android SDK

## Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd MobilApp
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (iOS only):
   
   **Important**: You need full Xcode installed (not just Command Line Tools) for iOS development.
   
   If you encounter Ruby version issues:
   ```bash
   # Install Ruby 3.1+ using Homebrew
   brew install ruby
   
   # Add to your ~/.zshrc (or ~/.bash_profile)
   echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
   echo 'export PATH="/opt/homebrew/lib/ruby/gems/3.4.0/bin:$PATH"' >> ~/.zshrc
   echo 'export LANG=en_US.UTF-8' >> ~/.zshrc
   
   # Reload your shell or run:
   source ~/.zshrc
   
   # Install CocoaPods
   gem install cocoapods
   
   # Then install iOS dependencies
   cd ios
   pod install
   cd ..
   ```

4. **Configure environment variables**:
   
   Create a `.env` file in the root directory (`MobilApp/.env`):
   ```env
   ACCESS_KEY=your_access_key_here
   API_URL=https://skyloop-chatbot-v1.istanbul.com/stream_secure
   ```
   
   Replace `your_access_key_here` with the actual access key provided.

## Running the Application

### iOS

```bash
npm run ios
```

Or open the project in Xcode:
```bash
cd ios
open MobilApp.xcworkspace
```

### Android

Make sure you have an Android emulator running or a device connected, then:

```bash
npm run android
```

### Start Metro Bundler

In a separate terminal:

```bash
npm start
```

## Project Structure

```
MobilApp/
├── src/
│   ├── components/
│   │   ├── ChatScreen.tsx          # Main chat interface
│   │   ├── MessageList.tsx         # Chat messages display
│   │   ├── MessageBubble.tsx       # Individual message component
│   │   ├── ProductButton.tsx      # Product recommendation button
│   │   ├── ChatInput.tsx          # Message input component
│   │   ├── ProductModal.tsx       # Modal with WebView for products
│   │   └── FeedbackForm.tsx       # Post-conversation survey
│   ├── services/
│   │   ├── api.ts                 # API service with streaming support
│   │   └── session.ts             # Session management utilities
│   ├── hooks/
│   │   ├── useChat.ts             # Chat state and logic hook
│   │   └── useSession.ts          # Session persistence hook
│   ├── utils/
│   │   └── storage.ts             # AsyncStorage utilities
│   ├── types/
│   │   ├── index.ts               # TypeScript interfaces
│   │   └── env.d.ts               # Environment variable types
│   └── constants/
│       └── config.ts              # App configuration
├── App.tsx                         # Root component
├── .env                            # Environment variables (create this)
└── package.json
```

## Architecture Overview

### Session Management
- **User ID**: 6-digit integer generated on first app launch and persisted
- **Chat ID**: Unique identifier generated for each conversation session
- Both IDs are stored locally using AsyncStorage

### API Integration
- **Endpoint**: `POST https://skyloop-chatbot-v1.istanbul.com/stream_secure`
- **Streaming**: Handles Server-Sent Events (SSE) streaming responses
- **Request Format**:
  ```json
  {
    "access_key": "<access_key>",
    "question": "User's message",
    "user_id": "123456",
    "chat_id": "unique_chat_id",
    "json": "on"
  }
  ```
- **Response Format**:
  ```json
  {
    "message": "AI response text",
    "items": [
      {
        "link": "product-path",
        "title": "Product Title"
      }
    ]
  }
  ```

### State Management
- Uses React hooks (useState, useEffect, custom hooks) for state management
- Conversation history persisted to AsyncStorage
- Session data persisted across app restarts

### Product Browsing
- Product recommendations displayed as buttons below AI messages
- Tapping a product opens a modal with WebView
- Product URLs constructed as `https://istanbul.com/{link}`
- Chat remains accessible - user can close modal to return

## Key Features Implementation

### Streaming API
The app handles streaming responses from the API endpoint, parsing Server-Sent Events (SSE) format and accumulating message text and product items.

### Error Handling
- Network error handling with user-friendly messages
- API error responses displayed in chat
- Retry mechanisms for failed requests
- Graceful degradation when API is unavailable

### Responsive Design
- Modern, clean chat UI
- Responsive design for various screen sizes
- Safe area handling for iOS and Android
- Smooth animations and transitions

## Configuration

### Environment Variables
- `ACCESS_KEY`: API access key (required)
- `API_URL`: API endpoint URL (optional, defaults to production endpoint)

### Storage Keys
- `@chatbot:user_id`: Persisted user ID
- `@chatbot:chat_id`: Current chat session ID
- `@chatbot:messages`: Conversation history
- `@chatbot:feedback`: User feedback data

## Troubleshooting

### Metro Bundler Issues
If you encounter issues with Metro bundler, try:
```bash
npm start -- --reset-cache
```

### iOS Build Issues

**Ruby Version Issues:**
If you get errors about Ruby version being too old:
```bash
# Install Ruby 3.1+ via Homebrew
brew install ruby

# Update your PATH (add to ~/.zshrc)
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export PATH="/opt/homebrew/lib/ruby/gems/3.4.0/bin:$PATH"
export LANG=en_US.UTF-8

# Install CocoaPods
gem install cocoapods
```

**Xcode Requirements:**
You need full Xcode installed (not just Command Line Tools). Install from the Mac App Store, then:
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

**CocoaPods Issues:**
If you encounter CocoaPods issues:
```bash
cd ios
pod deintegrate
pod install
cd ..
```

### Android Build Issues
Clean and rebuild:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Environment Variables Not Loading
Make sure:
1. `.env` file exists in the root directory
2. Babel config includes `react-native-dotenv` plugin
3. Restart Metro bundler after creating/updating `.env`

## Testing

Run tests:
```bash
npm test
```

## License

Private project - All rights reserved
