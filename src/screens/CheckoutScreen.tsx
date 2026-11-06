import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { OrderContext } from '../context/OrderContext';
import { AuthContext } from '../context/AuthContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { formatCurrency } from '../utils/currency';
import { Order } from '../types';

export function CheckoutScreen({ navigation }: any) {
  const { items, subtotal, clearCart } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const { user } = useContext(AuthContext);

  const [address, setAddress] = useState({ 
    street: '', number: '', neighborhood: '', city: '', state: 'PR', zipCode: '' 
  });
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit' | 'debit'>('pix');
  const [isLoading, setIsLoading] = useState(false);

  const discount = paymentMethod === 'pix' ? subtotal * 0.10 : 0;
  const shipping = address.state.toUpperCase() === 'PR' ? 15.00 : 25.00;
  const total = subtotal + shipping - discount;

  const handleConfirmOrder = async () => {
    if (!address.street || !address.number || !address.city) {
      Alert.alert('Atenção', 'Por favor, preencha o endereço completo.');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      const newOrder: Order = {
        id: String(Date.now()),
        date: new Date().toISOString(),
        items: [...items],
        total,
        paymentMethod,
        status: 'paid',
        address: { ...address, complement: '' },
      };

      addOrder(newOrder);
      clearCart();
      setIsLoading(false);
      navigation.replace('OrderSuccess', { orderId: newOrder.id });
    }, 1000);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Finalizar Compra</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
      <View style={styles.card}>
        <TextInput style={styles.input} placeholder="Rua / Avenida" value={address.street} onChangeText={(t) => setAddress({...address, street: t})} />
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: spacing.sm }]} placeholder="Número" value={address.number} onChangeText={(t) => setAddress({...address, number: t})} keyboardType="numeric" />
          <TextInput style={[styles.input, { flex: 1 }]} placeholder="Bairro" value={address.neighborhood} onChangeText={(t) => setAddress({...address, neighborhood: t})} />
        </View>
        <View style={styles.row}>
          <TextInput style={[styles.input, { flex: 1, marginRight: spacing.sm }]} placeholder="Cidade" value={address.city} onChangeText={(t) => setAddress({...address, city: t})} />
          <TextInput style={[styles.input, { width: 80 }]} placeholder="UF" value={address.state} onChangeText={(t) => setAddress({...address, state: t.toUpperCase()})} maxLength={2} autoCapitalize="characters" />
        </View>
        <TextInput style={styles.input} placeholder="CEP" value={address.zipCode} onChangeText={(t) => setAddress({...address, zipCode: t})} keyboardType="numeric" />
      </View>

      <Text style={styles.sectionTitle}>Forma de Pagamento</Text>
      <View style={styles.card}>
        <Pressable style={[styles.paymentOption, paymentMethod === 'pix' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('pix')}>
          <Ionicons name="qr-code-outline" size={24} color={paymentMethod === 'pix' ? colors.primary : colors.textLight} />
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Pix</Text>
            <Text style={styles.paymentDiscount}>10% de desconto</Text>
          </View>
          <Ionicons name={paymentMethod === 'pix' ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
        </Pressable>

        <Pressable style={[styles.paymentOption, paymentMethod === 'credit' && styles.paymentOptionActive]} onPress={() => setPaymentMethod('credit')}>
          <Ionicons name="card-outline" size={24} color={paymentMethod === 'credit' ? colors.primary : colors.textLight} />
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>Cartão de Crédito</Text>
            <Text style={styles.paymentSubtitle}>Em até 3x sem juros</Text>
          </View>
          <Ionicons name={paymentMethod === 'credit' ? 'radio-button-on' : 'radio-button-off'} size={20} color={colors.primary} />
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
      <View style={styles.card}>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Produtos</Text><Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text></View>
        <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Frete ({address.state})</Text><Text style={styles.summaryValue}>{formatCurrency(shipping)}</Text></View>
        {discount > 0 && <View style={styles.summaryRow}><Text style={styles.summaryLabelDiscount}>Desconto Pix</Text><Text style={styles.summaryValueDiscount}>- {formatCurrency(discount)}</Text></View>}
        <View style={[styles.summaryRow, { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm }]}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>{formatCurrency(total)}</Text>
        </View>
      </View>

      <PrimaryButton title={isLoading ? "Processando..." : "Confirmar Pedido"} onPress={handleConfirmOrder} isLoading={isLoading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  headerTitle: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: colors.text },
  sectionTitle: { fontSize: typography.sizes.md, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: spacing.borderRadius.md, marginBottom: spacing.md },
  input: { height: 44, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.sm, fontSize: typography.sizes.md, color: colors.text },
  row: { flexDirection: 'row' },
  paymentOption: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: spacing.borderRadius.sm, marginBottom: spacing.sm },
  paymentOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  paymentInfo: { flex: 1, marginLeft: spacing.sm },
  paymentTitle: { fontSize: typography.sizes.md, fontWeight: 'bold', color: colors.text },
  paymentDiscount: { fontSize: typography.sizes.xs, color: colors.success, fontWeight: 'bold' },
  paymentSubtitle: { fontSize: typography.sizes.xs, color: colors.textLight },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  summaryLabel: { fontSize: typography.sizes.sm, color: colors.textLight },
  summaryValue: { fontSize: typography.sizes.sm, color: colors.text },
  summaryLabelDiscount: { fontSize: typography.sizes.sm, color: colors.success },
  summaryValueDiscount: { fontSize: typography.sizes.sm, color: colors.success, fontWeight: 'bold' },
  summaryTotalLabel: { fontSize: typography.sizes.md, fontWeight: 'bold', color: colors.text },
  summaryTotalValue: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: colors.primary },
});