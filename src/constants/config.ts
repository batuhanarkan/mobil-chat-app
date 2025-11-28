import {API_URL} from '@env';

export const API_ENDPOINT = API_URL || 'https://skyloop-chatbot-v1.istanbul.com/stream_secure';
export const PRODUCT_BASE_URL = 'https://istanbul.com';

// Storage keys
export const STORAGE_KEYS = {
  USER_ID: '@chatbot:user_id',
  CHAT_ID: '@chatbot:chat_id',
  MESSAGES: '@chatbot:messages',
  CHAT_HISTORY: '@chatbot:chat_history',
};

