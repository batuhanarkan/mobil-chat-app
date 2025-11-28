import {Session} from '../types';
import {STORAGE_KEYS} from '../constants/config';
import {storage} from '../utils/storage';

export const generateUserId = (): string => {
  // Generate 6-digit user ID
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateChatId = (): string => {
  // Generate unique chat ID using timestamp and random string
  return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const sessionService = {
  async getOrCreateUserId(): Promise<string> {
    let userId = await storage.getItem<string>(STORAGE_KEYS.USER_ID);
    if (!userId) {
      userId = generateUserId();
      await storage.setItem(STORAGE_KEYS.USER_ID, userId);
    }
    return userId;
  },

  async createChatId(): Promise<string> {
    const chatId = generateChatId();
    await storage.setItem(STORAGE_KEYS.CHAT_ID, chatId);
    return chatId;
  },

  async getChatId(): Promise<string | null> {
    return await storage.getItem<string>(STORAGE_KEYS.CHAT_ID);
  },

  async getSession(): Promise<Session> {
    const userId = await this.getOrCreateUserId();
    let chatId = await this.getChatId();
    if (!chatId) {
      chatId = await this.createChatId();
    }
    return {user_id: userId, chat_id: chatId};
  },

  async resetChat(): Promise<Session> {
    const userId = await this.getOrCreateUserId();
    await storage.removeItem(STORAGE_KEYS.CHAT_ID);
    await storage.removeItem(STORAGE_KEYS.MESSAGES);
    const chatId = await this.createChatId();
    return {user_id: userId, chat_id: chatId};
  },
};

