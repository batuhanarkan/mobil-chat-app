import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useSession} from '../hooks/useSession';
import {useChat} from '../hooks/useChat';
import {MessageList} from './MessageList';
import {ChatInput} from './ChatInput';
import {ProductModal} from './ProductModal';
import {FeedbackForm} from './FeedbackForm';
import {ChatHistoryDropdown} from './ChatHistoryDropdown';
import {UserProfileHeader} from './UserProfileHeader';
import {Product, ChatHistory, Message} from '../types';
import {storage} from '../utils/storage';
import {STORAGE_KEYS} from '../constants/config';

export const ChatScreen: React.FC = () => {
  const {session, isLoading: sessionLoading, resetChat} = useSession();
  const {messages, isLoading, error, sendMessage, clearMessages, loadMessages} = useChat(
    session,
  );
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [selectedProductUrl, setSelectedProductUrl] = useState<string | null>(
    null,
  );
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [historyRefreshTrigger, setHistoryRefreshTrigger] = useState(0);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [activeChatMessages, setActiveChatMessages] = useState<Message[]>([]);

  const handleProductPress = (product: Product) => {
    setSelectedProductUrl(product.link);
    setProductModalVisible(true);
  };

  const handleEndConversation = async () => {
    // Only save to history if it's a new chat (not viewing history)
    // Filter out info messages before saving
    const messagesToSave = messages.filter(m => m.type !== 'info');
    
    if (!isViewingHistory && messagesToSave.length > 0 && session) {
      await saveChatToHistory();
      // Show feedback modal only for new conversations
      setFeedbackModalVisible(true);
    }
    
    await clearMessages();
    await resetChat();
    setIsViewingHistory(false);
  };

  const handleBackFromHistory = async () => {
    // Clear history view and return to active chat
    setIsViewingHistory(false);
    
    // Restore active chat messages if they exist
    if (activeChatMessages.length > 0) {
      // Restore the saved active chat messages
      await loadMessages(activeChatMessages);
      setActiveChatMessages([]); // Clear saved messages
    } else {
      // No active chat was saved, start fresh new chat
      await clearMessages();
      await resetChat();
      await addInfoMessage();
    }
  };

  const saveChatToHistory = async () => {
    try {
      if (!session || messages.length === 0) return;

      // Filter out info messages before saving
      const messagesToSave = messages.filter(m => m.type !== 'info');
      if (messagesToSave.length === 0) return;

      // Get first user message as title
      const firstUserMessage = messagesToSave.find(m => m.type === 'user');
      const title = firstUserMessage?.text.substring(0, 50) || 'New Chat';

      const chatHistory: ChatHistory = {
        id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        chat_id: session.chat_id,
        title,
        messages: messagesToSave,
        createdAt: messagesToSave[0]?.timestamp || Date.now(),
        endedAt: Date.now(),
      };

      // Load existing history
      const existingHistory = await storage.getItem<ChatHistory[]>(
        STORAGE_KEYS.CHAT_HISTORY,
      ) || [];

      // Add new chat to history
      const updatedHistory = [chatHistory, ...existingHistory];

      // Keep only last 50 chats
      const limitedHistory = updatedHistory.slice(0, 50);

      await storage.setItem(STORAGE_KEYS.CHAT_HISTORY, limitedHistory);
      
      // Trigger history refresh
      setHistoryRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error saving chat to history:', err);
    }
  };

  const handleSelectHistory = async (history: ChatHistory) => {
    try {
      // Save current active chat messages before loading history
      // Only save if we're not already viewing history (meaning there's a real active chat)
      if (!isViewingHistory) {
        const currentMessages = messages.filter(m => m.type !== 'info');
        if (currentMessages.length > 0) {
          setActiveChatMessages(currentMessages);
        } else {
          // No active chat, clear saved messages
          setActiveChatMessages([]);
        }
      }
      
      // Load the selected chat's messages
      // Note: loadMessages will save to storage, but that's okay since we'll restore from activeChatMessages on back
      await loadMessages(history.messages);
      setIsViewingHistory(true);
      console.log('Loaded chat history:', history.title);
    } catch (err) {
      console.error('Error loading chat history:', err);
    }
  };

  // Track when user sends a new message - if viewing history, start new chat
  const handleSendMessage = async (text: string) => {
    // If viewing history and user sends a message, start a new chat
    if (isViewingHistory) {
      setIsViewingHistory(false);
      await clearMessages();
      await resetChat();
      // Add info message for new chat
      await addInfoMessage();
    }
    await sendMessage(text);
  };

  const handleAttachmentPress = () => {
    // TODO: Implement document/image picker
    // For now, show a placeholder message
    console.log('Attachment button pressed - implement document/image picker');
    // You can integrate libraries like:
    // - react-native-document-picker for documents
    // - react-native-image-picker for images
    // - expo-document-picker / expo-image-picker if using Expo
  };

  // Add info message when starting a new chat
  const addInfoMessage = useCallback(async () => {
    // Check if info message already exists
    if (!messages || !Array.isArray(messages)) return;
    const hasInfoMessage = messages.some(m => m.type === 'info');
    if (hasInfoMessage) return;

    const infoMessage: Message = {
      id: `info_${Date.now()}`,
      type: 'info',
      text: 'You are chatting with AI Assistant',
      timestamp: Date.now(),
    };
    await loadMessages([infoMessage]);
  }, [messages, loadMessages]);

  // Add info message when a new chat session starts (not when viewing history)
  useEffect(() => {
    if (session && !isViewingHistory && messages.length === 0) {
      // Small delay to ensure everything is initialized
      const timer = setTimeout(() => {
        addInfoMessage();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [session, isViewingHistory, messages.length, addInfoMessage]); // When chat_id changes (new chat)

  const handleFeedbackSubmit = async (rating: number, feedback: string) => {
    // Store feedback locally (can be extended to send to API)
    const feedbackData = {
      rating,
      feedback,
      timestamp: Date.now(),
      sessionId: session?.chat_id,
    };
    await storage.setItem('@chatbot:feedback', feedbackData);
    console.log('Feedback submitted:', feedbackData);
  };

  if (sessionLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Initializing...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {isViewingHistory ? (
            <>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackFromHistory}
                activeOpacity={0.7}>
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.historyTitle}>Chat History</Text>
            </>
          ) : (
            <UserProfileHeader
              name="AI Assistant"
              isOnline={true}
              isViewingHistory={isViewingHistory}
            />
          )}
        </View>
        {!isViewingHistory && (
          <View style={styles.headerRight}>
            <ChatHistoryDropdown 
              onSelectChat={handleSelectHistory}
              refreshTrigger={historyRefreshTrigger}
            />
            <TouchableOpacity
              style={styles.endButton}
              onPress={handleEndConversation}
              activeOpacity={0.7}>
              <Image 
                source={require('../../assets/icons/white.png')} 
                style={styles.phoneIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.chatContainer}>
        <MessageList
          messages={messages}
          onProductPress={handleProductPress}
          isLoading={isLoading}
        />
      </View>

      <ChatInput 
        onSendMessage={handleSendMessage} 
        isLoading={isLoading}
        disabled={isViewingHistory}
        onAttachmentPress={handleAttachmentPress}
      />

      <ProductModal
        visible={productModalVisible}
        productUrl={selectedProductUrl}
        onClose={() => {
          setProductModalVisible(false);
          setSelectedProductUrl(null);
        }}
      />

      <FeedbackForm
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#F9F9F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 20,
    color: '#000000',
    fontWeight: '600',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  endButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneIcon: {
    width: 18,
    height: 18,
  },
  errorContainer: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
});

