import {APIResponse, Session} from '../types';
import {API_ENDPOINT} from '../constants/config';
import {ACCESS_KEY} from '@env';

// Polyfill for TextDecoder in React Native
const getTextDecoder = () => {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder();
  }
  // Fallback for React Native
  return {
    decode: (uint8Array: Uint8Array): string => {
      // Simple UTF-8 decoder for React Native
      let result = '';
      let i = 0;
      while (i < uint8Array.length) {
        const byte1 = uint8Array[i++];
        if (byte1 < 0x80) {
          result += String.fromCharCode(byte1);
        } else if ((byte1 & 0xe0) === 0xc0) {
          const byte2 = uint8Array[i++];
          result += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
        } else if ((byte1 & 0xf0) === 0xe0) {
          const byte2 = uint8Array[i++];
          const byte3 = uint8Array[i++];
          result += String.fromCharCode(
            ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f),
          );
        } else {
          const byte2 = uint8Array[i++];
          const byte3 = uint8Array[i++];
          const byte4 = uint8Array[i++];
          const codePoint =
            ((byte1 & 0x07) << 18) |
            ((byte2 & 0x3f) << 12) |
            ((byte3 & 0x3f) << 6) |
            (byte4 & 0x3f);
          if (codePoint > 0xffff) {
            const offset = codePoint - 0x10000;
            result += String.fromCharCode(
              0xd800 + (offset >> 10),
              0xdc00 + (offset & 0x3ff),
            );
          } else {
            result += String.fromCharCode(codePoint);
          }
        }
      }
      return result;
    },
  };
};

interface APIRequest {
  access_key: string;
  question: string;
  user_id: string;
  chat_id: string;
  json: string;
}

export class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}

export const apiService = {
  async sendMessage(
    question: string,
    session: Session,
  ): Promise<APIResponse> {
    // Clean access key (remove quotes if present)
    const cleanAccessKey = ACCESS_KEY?.trim().replace(/^["']|["']$/g, '');
    
    if (!cleanAccessKey) {
      console.error('ACCESS_KEY is not configured in .env file');
      throw new APIError('Access key is not configured');
    }

    const requestBody: APIRequest = {
      access_key: cleanAccessKey,
      question,
      user_id: session.user_id,
      chat_id: session.chat_id,
      json: 'on',
    };

    const requestBodyString = JSON.stringify(requestBody);
    
    console.log('API Request Details:', {
      method: 'POST',
      endpoint: API_ENDPOINT,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: requestBodyString,
      user_id: session.user_id,
      chat_id: session.chat_id,
      access_key_length: cleanAccessKey.length,
      access_key_preview: cleanAccessKey.substring(0, 10) + '...',
    });

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: requestBodyString,
      });

      // Log response status
      console.log('API Response Status:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Check response status and handle errors
      if (!response.ok) {
        // Try to read error response body
        let errorMessage = `API request failed: ${response.statusText}`;
        try {
          const errorText = await response.text();
          console.error('API Error Response:', errorText);
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.message || errorJson.error || errorText;
            } catch (e) {
              errorMessage = errorText;
            }
          }
        } catch (e) {
          // Use default error message
          console.error('Error reading error response:', e);
        }
        throw new APIError(errorMessage, response.status);
      }

      // Try to handle streaming response, fallback to text if not available
      const reader = response.body?.getReader();
      let fullMessage = '';
      let items: any[] = [];

      if (reader) {
        // Handle streaming response (if supported)
        const decoder = getTextDecoder();
        let buffer = '';

        try {
          while (true) {
            const {done, value} = await reader.read();
            if (done) break;

            buffer += decoder.decode(value);
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  continue;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.message) {
                    fullMessage = parsed.message;
                  }
                  if (parsed.items && Array.isArray(parsed.items)) {
                    items = parsed.items;
                  }
                  if (parsed.message && parsed.items) {
                    fullMessage = parsed.message;
                    items = parsed.items;
                  }
                } catch (e) {
                  if (data && !data.startsWith('{')) {
                    fullMessage += data;
                  }
                }
              } else if (line.trim() && !line.startsWith(':')) {
                try {
                  const parsed = JSON.parse(line);
                  if (parsed.message) {
                    fullMessage = parsed.message;
                  }
                  if (parsed.items) {
                    items = parsed.items;
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }
          }

          // Process any remaining buffer
          if (buffer.trim()) {
            try {
              const parsed = JSON.parse(buffer);
              if (parsed.message) {
                fullMessage = parsed.message;
              }
              if (parsed.items) {
                items = parsed.items;
              }
            } catch (e) {
              if (buffer && !buffer.startsWith('{')) {
                fullMessage += buffer;
              }
            }
          }
        } catch (streamError) {
          console.warn('Streaming failed, falling back to text:', streamError);
          // Fall through to text-based parsing
        }
      }

      // Fallback: Read entire response as text (React Native compatible)
      if (!fullMessage && !items.length) {
        try {
          const text = await response.text();
          
          // Check if response contains error
          if (text.toLowerCase().includes('access_denied') || 
              text.toLowerCase().includes('access denied') ||
              text.toLowerCase().includes('unauthorized')) {
            throw new APIError('Access denied. Please check your access key.', 401);
          }
          
          // Try parsing as JSON first
          try {
            const parsed = JSON.parse(text);
            
            // Check for error in JSON response
            if (parsed.error || parsed.message?.toLowerCase().includes('access')) {
              throw new APIError(
                parsed.error || parsed.message || 'API error',
                response.status,
              );
            }
            
            return {
              message: parsed.message || text,
              items: parsed.items || [],
            };
          } catch (e) {
            // If not JSON, try parsing as SSE format
            const lines = text.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  continue;
                }
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.message) {
                    fullMessage = parsed.message;
                  }
                  if (parsed.items) {
                    items = parsed.items;
                  }
                } catch (e) {
                  if (data && !data.startsWith('{')) {
                    fullMessage += data;
                  }
                }
              } else if (line.trim() && !line.startsWith(':')) {
                try {
                  const parsed = JSON.parse(line);
                  if (parsed.message) {
                    fullMessage = parsed.message;
                  }
                  if (parsed.items) {
                    items = parsed.items;
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              }
            }

            // If still no message, return the raw text
            if (!fullMessage && !items.length) {
              return {
                message: text || 'No response received',
                items: [],
              };
            }
          }
        } catch (textError) {
          throw new APIError(
            `Failed to read response: ${textError instanceof Error ? textError.message : 'Unknown error'}`,
          );
        }
      }

      return {
        message: fullMessage || 'No message received',
        items: items || [],
      };
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  },
};

