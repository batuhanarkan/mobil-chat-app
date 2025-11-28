import {useState, useEffect, useCallback} from 'react';
import {Message, Session, Product} from '../types';
import {apiService} from '../services/api';
import {storage} from '../utils/storage';
import {STORAGE_KEYS} from '../constants/config';

export const useChat = (session: Session | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages from storage on mount
  useEffect(() => {
    const loadMessages = async () => {
      if (!session) return;
      try {
        const savedMessages = await storage.getItem<Message[]>(
          STORAGE_KEYS.MESSAGES,
        );
        if (savedMessages) {
          setMessages(savedMessages);
        }
      } catch (err) {
        console.error('Error loading messages:', err);
      }
    };

    loadMessages();
  }, [session]);

  // Save messages to storage whenever they change
  useEffect(() => {
    if (messages.length > 0 && session) {
      storage.setItem(STORAGE_KEYS.MESSAGES, messages);
    }
  }, [messages, session]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!session || !text.trim()) return;

      const userMessage: Message = {
        id: `msg_${Date.now()}_user`,
        type: 'user',
        text: text.trim(),
        timestamp: Date.now(),
      };

      // Add user message immediately
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiService.sendMessage(text.trim(), session);

        const aiMessage: Message = {
          id: `msg_${Date.now()}_ai`,
          type: 'ai',
          text: response.message,
          timestamp: Date.now(),
          products: response.items || [],
        };

        setMessages(prev => [...prev, aiMessage]);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);

        // Add error message to chat
        const errorMsg: Message = {
          id: `msg_${Date.now()}_error`,
          type: 'ai',
          text: `Sorry, I encountered an error: ${errorMessage}`,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [session],
  );

  const clearMessages = useCallback(async () => {
    setMessages([]);
    setError(null);
    await storage.removeItem(STORAGE_KEYS.MESSAGES);
  }, []);

  const loadMessages = useCallback(async (messagesToLoad: Message[]) => {
    setMessages(messagesToLoad);
    await storage.setItem(STORAGE_KEYS.MESSAGES, messagesToLoad);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    loadMessages,
  };
};

