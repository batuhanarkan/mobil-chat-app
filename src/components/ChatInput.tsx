import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  onAttachmentPress?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  disabled = false,
  onAttachmentPress,
}) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !isLoading && !disabled) {
      onSendMessage(text);
      setText('');
    }
  };

  return (
    <View style={[styles.container, disabled && styles.containerDisabled]}>
      <TouchableOpacity
        style={styles.attachmentButton}
        onPress={onAttachmentPress}
        disabled={isLoading || disabled}
        activeOpacity={0.7}>
        <Image 
          source={require('../../assets/icons/plus.png')} 
          style={styles.attachmentIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={text}
        onChangeText={setText}
        placeholder={disabled ? "Viewing past conversation..." : "Type your message..."}
        placeholderTextColor="#999"
        multiline
        editable={!isLoading && !disabled}
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity
        style={[
          styles.sendButton, 
          (isLoading || disabled || !text.trim()) && styles.sendButtonDisabled
        ]}
        onPress={handleSend}
        disabled={isLoading || !text.trim() || disabled}>
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Image 
            source={require('../../assets/icons/send.png')} 
            style={styles.sendIcon}
            resizeMode="contain"
          />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'flex-end',
  },
  attachmentButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  attachmentIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#F2F2F7',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendIcon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  containerDisabled: {
    opacity: 0.6,
  },
  inputDisabled: {
    backgroundColor: '#E5E5EA',
  },
});

