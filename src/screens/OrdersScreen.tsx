import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { OrderContext } from '../context/OrderContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/currency';

export function OrdersScreen() {
  const { orders } = useContext(OrderContext);

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={80} color={colors.primaryLight} />
        <Text style={styles.emptyTitle}>Nenhum pedido ainda</Text>
        <Text style={styles.emptySubtitle}>Quando você fizer um pedido, ele aparecerá aqui.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Meus Pedidos</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.md }}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Pedido #{item.id.slice(-6)}</Text>
              <Text style={styles.orderDate}>{new Date(item.date).toLocaleDateString('pt-BR')}</Text>
            </View>
            <Text style={styles.orderItems}>{item.items.length} item(ns)</Text>
            <View style={styles.orderFooter}>
              <Text style={styles.orderTotal}>{formatCurrency(item.total)}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Pago</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: typography.sizes.xl, fontWeight: 'bold', color: colors.text },
  orderCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: spacing.borderRadius.md, marginBottom: spacing.md },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  orderId: { fontWeight: 'bold', color: colors.text },
  orderDate: { color: colors.textLight, fontSize: typography.sizes.sm },
  orderItems: { color: colors.textLight, marginBottom: spacing.sm },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: colors.primary },
  statusBadge: { backgroundColor: colors.success, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: spacing.borderRadius.sm },
  statusText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  emptyContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: colors.text, marginTop: spacing.md },
  emptySubtitle: { fontSize: typography.sizes.md, color: colors.textLight, textAlign: 'center', marginTop: spacing.sm },
});