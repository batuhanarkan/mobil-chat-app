import {useState, useEffect} from 'react';
import {Session} from '../types';
import {sessionService} from '../services/session';

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const newSession = await sessionService.getSession();
        setSession(newSession);
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSession();
  }, []);

  const resetChat = async () => {
    try {
      const newSession = await sessionService.resetChat();
      setSession(newSession);
      return newSession;
    } catch (error) {
      console.error('Error resetting chat:', error);
      throw error;
    }
  };

  return {
    session,
    isLoading,
    resetChat,
  };
};

