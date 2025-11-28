import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  SafeAreaView,
  Image,
} from 'react-native';
import {ChatHistory} from '../types';
import {storage} from '../utils/storage';
import {STORAGE_KEYS} from '../constants/config';

interface ChatHistoryDropdownProps {
  onSelectChat: (history: ChatHistory) => void;
  refreshTrigger?: number; // Add refresh trigger prop
}

export const ChatHistoryDropdown: React.FC<ChatHistoryDropdownProps> = ({
  onSelectChat,
  refreshTrigger,
}) => {
  const [visible, setVisible] = useState(false);
  const [history, setHistory] = useState<ChatHistory[]>([]);

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]); // Reload when refreshTrigger changes

  const loadHistory = async () => {
    try {
      const savedHistory = await storage.getItem<ChatHistory[]>(
        STORAGE_KEYS.CHAT_HISTORY,
      );
      if (savedHistory) {
        // Sort by most recent first
        const sorted = savedHistory.sort((a, b) => b.endedAt - a.endedAt);
        setHistory(sorted);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleSelect = (item: ChatHistory) => {
    setVisible(false);
    onSelectChat(item);
  };

  const renderHistoryItem = ({item}: {item: ChatHistory}) => {
    const firstMessage = item.messages[0]?.text || 'New chat';
    const preview = firstMessage.length > 50 
      ? firstMessage.substring(0, 50) + '...' 
      : firstMessage;

    return (
      <TouchableOpacity
        style={styles.historyItem}
        onPress={() => handleSelect(item)}
        activeOpacity={0.7}>
        <View style={styles.historyItemContent}>
          <Text style={styles.historyItemTitle} numberOfLines={1}>
            {item.title || preview}
          </Text>
          <Text style={styles.historyItemPreview} numberOfLines={1}>
            {preview}
          </Text>
          <Text style={styles.historyItemDate}>
            {formatDate(item.endedAt)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}>
        <Image 
          source={require('../../assets/icons/history.png')} 
          style={styles.icon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat History</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setVisible(false)}
                activeOpacity={0.7}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            {history.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No chat history yet</Text>
                <Text style={styles.emptySubtext}>
                  Your completed conversations will appear here
                </Text>
              </View>
            ) : (
              <FlatList
                data={history}
                renderItem={renderHistoryItem}
                keyExtractor={item => item.id}
                style={styles.list}
              />
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E5EA',
    borderWidth: 1,
    borderColor: '#D1D1D6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#000000',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  historyItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  historyItemPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

