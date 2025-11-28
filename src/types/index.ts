export interface Message {
  id: string;
  type: 'user' | 'ai' | 'info';
  text: string;
  timestamp: number;
  products?: Product[];
}

export interface Product {
  link: string;
  title: string;
}

export interface APIResponse {
  message: string;
  items?: Product[];
}

export interface Session {
  user_id: string;
  chat_id: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface ChatHistory {
  id: string;
  chat_id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  endedAt: number;
}

