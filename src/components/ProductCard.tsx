import React, { useContext } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { FavoritesContext } from '../context/FavoritesContext';
import { CartContext } from '../context/CartContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/currency';
import { width, getNumColumns } from '../utils/layout';

interface Props {
  product: Product;
  onPress: () => void;
  variant?: 'default' | 'compact';
}

export function ProductCard({ product, onPress, variant = 'default' }: Props) {
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const { addToCart } = useContext(CartContext);
  const favorite = isFavorite(product.id);

  const numColumns = getNumColumns();
  
  // Cálculo exato: Largura da tela - (Padding da tela * 2) - (Espaçamento entre cards * (colunas - 1))
  const horizontalPadding = spacing.md * 2;
  const cardSpacing = spacing.sm; 
  
  const availableWidth = width - horizontalPadding - (cardSpacing * (numColumns - 1));
  const cardWidth = variant === 'compact' ? 140 : availableWidth / numColumns;

  return (
    <Pressable style={[styles.card, { width: cardWidth }]} onPress={onPress}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        <Pressable style={styles.favoriteButton} onPress={() => toggleFavorite(product)}>
          <Ionicons 
            name={favorite ? 'heart' : 'heart-outline'} 
            size={18} 
            color={favorite ? colors.error : colors.textLight} 
          />
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        
        {product.originalPrice && (
          <Text style={styles.originalPrice}>{formatCurrency(product.originalPrice)}</Text>
        )}
        
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          <Pressable style={styles.addButton} onPress={() => addToCart(product)}>
            <Ionicons name="add" size={20} color="#FFF" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  imageContainer: { position: 'relative', marginBottom: spacing.sm },
  image: { width: '100%', height: 120, borderRadius: spacing.borderRadius.md, backgroundColor: colors.primaryLight },
  favoriteButton: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 15, padding: 4 },
  info: { flex: 1, justifyContent: 'space-between' },
  name: { fontSize: typography.sizes.sm, fontWeight: '500', color: colors.text, minHeight: 36 },
  originalPrice: { fontSize: typography.sizes.xs, color: colors.textLight, textDecorationLine: 'line-through' },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  price: { fontSize: typography.sizes.md, fontWeight: 'bold', color: colors.primary },
  addButton: { backgroundColor: colors.primary, borderRadius: 15, padding: 6 },
});