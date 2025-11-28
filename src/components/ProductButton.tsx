import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {Product} from '../types';

interface ProductButtonProps {
  product: Product;
  onPress: (product: Product) => void;
}

export const ProductButton: React.FC<ProductButtonProps> = ({
  product,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => onPress(product)}
      activeOpacity={0.7}>
      <Text style={styles.buttonText}>{product.title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#34C759',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
    marginHorizontal: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

