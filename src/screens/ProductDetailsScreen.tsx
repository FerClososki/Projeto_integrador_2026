import React, { useState, useContext } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { products } from '../data/products';
import { CartContext } from '../context/CartContext';
import { FavoritesContext } from '../context/FavoritesContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/currency';

export function ProductDetailsScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const product = products.find(p => p.id === productId);
  const { addToCart } = useContext(CartContext);
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const [quantity, setQuantity] = useState(1);

  if (!product) return <Text>Produto não encontrado</Text>;

  const favorite = isFavorite(product.id);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigation.navigate('Cart');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
          
          <Pressable style={styles.favoriteButton} onPress={() => toggleFavorite(product)}>
            <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={28} color={favorite ? colors.error : colors.textLight} />
          </Pressable>

          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>

        <View style={styles.content}>
          <Text style={styles.name}>{product.name}</Text>
          
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={colors.secondary} />
            <Text style={styles.ratingText}>{product.rating} ({product.reviewsCount} avaliações)</Text>
          </View>

          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          {product.originalPrice && <Text style={styles.originalPrice}>De {formatCurrency(product.originalPrice)}</Text>}

          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Idade recomendada:</Text>
            <Text style={styles.infoValue}>{product.ageRecommendation}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Material:</Text>
            <Text style={styles.infoValue}>{product.material}</Text>
          </View>
          {product.pieces && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Peças:</Text>
              <Text style={styles.infoValue}>{product.pieces}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.quantitySelector}>
          <Pressable onPress={() => setQuantity(q => Math.max(1, q - 1))} style={styles.qtyButton}>
            <Ionicons name="remove" size={20} color={colors.primary} />
          </Pressable>
          <Text style={styles.qtyText}>{quantity}</Text>
          <Pressable onPress={() => setQuantity(q => q + 1)} style={styles.qtyButton}>
            <Ionicons name="add" size={20} color={colors.primary} />
          </Pressable>
        </View>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <PrimaryButton title="Adicionar à Sacola" onPress={handleAddToCart} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 100 },
  imageContainer: { position: 'relative', height: 300, backgroundColor: colors.primaryLight },
  image: { width: '100%', height: '100%' },
  favoriteButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: '#FFF',
    borderRadius: 25,
    padding: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: { padding: spacing.lg },
  name: { fontSize: typography.sizes.xl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  ratingText: { marginLeft: spacing.xs, color: colors.textLight, fontSize: typography.sizes.sm },
  price: { fontSize: typography.sizes.xxl, fontWeight: 'bold', color: colors.primary, marginVertical: spacing.sm },
  originalPrice: { fontSize: typography.sizes.md, color: colors.textLight, textDecorationLine: 'line-through', marginTop: -spacing.sm },
  description: { fontSize: typography.sizes.md, color: colors.text, marginVertical: spacing.md, lineHeight: 22 },
  infoRow: { flexDirection: 'row', marginBottom: spacing.sm },
  infoLabel: { fontWeight: 'bold', color: colors.text, width: 140 },
  infoValue: { color: colors.textLight, flex: 1 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius.pill,
    paddingHorizontal: spacing.sm,
  },
  qtyButton: { padding: spacing.sm },
  qtyText: { fontSize: typography.sizes.md, fontWeight: 'bold', marginHorizontal: spacing.sm },
});