import React, {useRef, useEffect} from 'react';
import {FlatList, StyleSheet, View} from 'react-native';
import {Message} from '../types';
import {MessageBubble} from './MessageBubble';
import {InfoMessage} from './InfoMessage';
import {TypingIndicator} from './TypingIndicator';
import {ProductButton} from './ProductButton';

interface MessageListProps {
  messages: Message[];
  onProductPress: (product: {link: string; title: string}) => void;
  isLoading?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  onProductPress,
  isLoading = false,
}) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages, isLoading]);

  const renderItem = ({item}: {item: Message}) => {
    if (item.type === 'info') {
      return <InfoMessage text={item.text} />;
    }

    return (
      <View>
        <MessageBubble message={item} />
        {item.products && item.products.length > 0 && (
          <View style={styles.productsContainer}>
            {item.products.map((product, index) => (
              <ProductButton
                key={`${item.id}_product_${index}`}
                product={product}
                onPress={onProductPress}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }}
      ListFooterComponent={
        isLoading ? (
          <View style={styles.typingContainer}>
            <TypingIndicator />
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  productsContainer: {
    marginTop: 8,
    marginBottom: 4,
  },
  typingContainer: {
    marginTop: 4,
  },
});

