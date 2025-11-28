import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  SafeAreaView,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {PRODUCT_BASE_URL} from '../constants/config';

interface ProductModalProps {
  visible: boolean;
  productUrl: string | null;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  visible,
  productUrl,
  onClose,
}) => {
  if (!productUrl) return null;

  const fullUrl = `${PRODUCT_BASE_URL}/${productUrl}`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{uri: fullUrl}}
          style={styles.webview}
          startInLoadingState={true}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 50,
    backgroundColor: '#F2F2F7',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
});

