import React, { useContext } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props {
  onOpenCart?: () => void;
}

export function AppHeader({ onOpenCart }: Props) {
  const { user } = useContext(AuthContext);
  const { items } = useContext(CartContext);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image 
          source={require('../../assets/images/logo.png')} 
          style={styles.logo} 
          resizeMode="contain" 
        />
        <View>
          <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0] || 'Visitante'}!</Text>
          <Text style={styles.subtitle}>O que vamos brincar hoje?</Text>
        </View>
      </View>

      <Pressable style={styles.cartButton} onPress={onOpenCart}>
        <Ionicons name="bag-handle-outline" size={24} color={colors.primary} />
        {totalItems > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalItems}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 48, height: 48, marginRight: spacing.sm },
  greeting: { fontSize: typography.sizes.md, fontWeight: 'bold', color: colors.text },
  subtitle: { fontSize: typography.sizes.xs, color: colors.textLight },
  cartButton: { padding: spacing.sm, position: 'relative' },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.error,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
});