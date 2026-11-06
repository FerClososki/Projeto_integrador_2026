import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/currency';

export function CartScreen({ navigation }: any) {
  const { items, updateQuantity, removeFromCart, subtotal, shipping, total } = useContext(CartContext);

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bag-handle-outline" size={80} color={colors.primaryLight} />
        <Text style={styles.emptyTitle}>Sua sacola está vazia</Text>
        <Text style={styles.emptySubtitle}>Que tal adicionar alguns brinquedos mágicos?</Text>
        <PrimaryButton title="Explorar Brinquedos" onPress={() => navigation.navigate('Home')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minha Sacola</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <Image source={{ uri: item.product.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
              
              {/* AQUI ESTÁ A CORREÇÃO: Multiplicando o preço pela quantidade */}
              <Text style={styles.itemPrice}>
                {formatCurrency(item.product.price * item.quantity)}
              </Text>
              
              <View style={styles.quantityContainer}>
                <Pressable onPress={() => updateQuantity(item.product.id, item.quantity - 1)}>
                  <Ionicons name="remove-circle-outline" size={26} color={colors.primary} />
                </Pressable>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <Pressable onPress={() => updateQuantity(item.product.id, item.quantity + 1)}>
                  <Ionicons name="add-circle-outline" size={26} color={colors.primary} />
                </Pressable>
                <Pressable onPress={() => removeFromCart(item.product.id)} style={{ marginLeft: 'auto' }}>
                  <Ionicons name="trash-outline" size={24} color={colors.error} />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.row}><Text>Subtotal</Text><Text>{formatCurrency(subtotal)}</Text></View>
        <View style={styles.row}><Text>Frete</Text><Text>{formatCurrency(shipping)}</Text></View>
        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalText}>Total</Text>
          <Text style={styles.totalText}>{formatCurrency(total)}</Text>
        </View>
        <PrimaryButton title="Finalizar Compra" onPress={() => navigation.navigate('Checkout')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: 15, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  list: { padding: 15 },
  cartItem: { flexDirection: 'row', backgroundColor: colors.surface, padding: 10, borderRadius: 10, marginBottom: 10 },
  itemImage: { width: 80, height: 80, borderRadius: 8, backgroundColor: colors.primaryLight },
  itemDetails: { flex: 1, marginLeft: 10, justifyContent: 'space-between' },
  itemName: { fontSize: 14, fontWeight: '500' },
  itemPrice: { fontSize: 16, fontWeight: 'bold', color: colors.primary },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  quantityText: { marginHorizontal: 10, fontSize: 16, fontWeight: 'bold' },
  footer: { backgroundColor: colors.surface, padding: 15, borderTopWidth: 1, borderTopColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  totalRow: { marginTop: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  totalText: { fontSize: 18, fontWeight: 'bold' },
  emptyContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  emptySubtitle: { color: colors.textLight, marginBottom: 20, textAlign: 'center' },
});