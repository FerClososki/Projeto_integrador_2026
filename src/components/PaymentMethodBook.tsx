import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SavedPaymentMethod } from '../types';
import { addDemoPaymentMethod, getSavedPaymentMethods, removePaymentMethod, setDefaultPaymentMethod } from '../services/paymentMethodService';
import { ScreenHeader } from './ScreenHeader';
import { PrimaryButton } from './PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  userId: string;
  onClose: () => void;
  onSelect?: (method: SavedPaymentMethod) => void;
}

export function PaymentMethodBook({ userId, onClose, onSelect }: Props) {
  const [methods, setMethods] = useState<SavedPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setMethods(await getSavedPaymentMethods(userId)); setError(''); }
    catch { setError('Não foi possível carregar os cartões. Tente novamente.'); }
    finally { setLoading(false); }
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const addDemo = async (brand: SavedPaymentMethod['brand']) => {
    setWorking(true);
    try { setMethods(await addDemoPaymentMethod(userId, brand)); }
    catch { Alert.alert('Não foi possível salvar', 'Tente novamente.'); }
    finally { setWorking(false); }
  };

  const updateDefault = async (id: string) => {
    setWorking(true);
    try { setMethods(await setDefaultPaymentMethod(userId, id)); }
    catch { Alert.alert('Não foi possível atualizar', 'Tente novamente.'); }
    finally { setWorking(false); }
  };

  const confirmRemove = (method: SavedPaymentMethod) => Alert.alert('Remover cartão', `Remover ${method.brand} final ${method.lastFour}?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Remover', style: 'destructive', onPress: async () => {
      setWorking(true);
      try { setMethods(await removePaymentMethod(userId, method.id)); }
      catch { Alert.alert('Não foi possível remover', 'Tente novamente.'); }
      finally { setWorking(false); }
    } },
  ]);

  return <Modal visible animationType="slide" onRequestClose={() => { if (!working) onClose(); }}>
    <SafeAreaView style={styles.root}>
      <ScreenHeader title={onSelect ? 'Escolher cartão' : 'Meus pagamentos'} onBack={() => { if (!working) onClose(); }} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.notice}>
          <Ionicons name="information-circle-outline" size={22} color={colors.primary} />
          <Text style={styles.noticeText}>Modo de demonstração: estes cartões são fictícios e não permitem pagamentos reais. Nenhum dado bancário é solicitado ou armazenado.</Text>
        </View>
        {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando cartões" /> : error ? <>
          <Text style={styles.description}>{error}</Text>
          <PrimaryButton title="Tentar novamente" onPress={refresh} />
        </> : <>
          {!methods.length && <Text style={styles.empty}>Você ainda não adicionou cartões de demonstração.</Text>}
          {methods.map(method => <View key={method.id} style={styles.card}>
            <View style={styles.cardHeading}>
              <Ionicons name="card-outline" size={27} color={colors.primary} />
              <View style={styles.cardInfo}>
                <Text style={styles.brand}>{method.brand} ···· {method.lastFour}</Text>
                <Text style={styles.description}>{method.isDefault ? 'Principal' : 'Cartão de demonstração'}</Text>
              </View>
              {method.isDefault && <Ionicons name="checkmark-circle" size={22} color={colors.success} />}
            </View>
            {onSelect && <PrimaryButton title="Usar este cartão" disabled={working} onPress={() => onSelect(method)} />}
            <View style={styles.actions}>
              {!method.isDefault && <Pressable style={styles.action} disabled={working} onPress={() => updateDefault(method.id)}><Text style={styles.link}>Tornar principal</Text></Pressable>}
              <Pressable style={styles.action} disabled={working} onPress={() => confirmRemove(method)}><Text style={styles.remove}>Remover</Text></Pressable>
            </View>
          </View>)}
          <Text style={styles.addTitle}>Adicionar cartão de teste</Text>
          <PrimaryButton title="Visa de demonstração · 4242" disabled={working} onPress={() => addDemo('Visa')} />
          <PrimaryButton title="Mastercard de demonstração · 4444" variant="outline" disabled={working} onPress={() => addDemo('Mastercard')} />
        </>}
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.primaryLight, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md },
  noticeText: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 19 },
  card: { padding: spacing.md, marginVertical: spacing.sm, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardInfo: { flex: 1 },
  brand: { fontSize: 16, color: colors.text, fontWeight: 'bold' },
  description: { color: colors.textLight, fontSize: 13, lineHeight: 20 },
  empty: { color: colors.textLight, textAlign: 'center', paddingVertical: spacing.lg },
  addTitle: { marginTop: spacing.lg, fontSize: 16, color: colors.text, fontWeight: 'bold' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  action: { minHeight: 44, justifyContent: 'center', paddingRight: 20 },
  link: { color: colors.primary, fontWeight: 'bold' },
  remove: { color: colors.error, fontWeight: 'bold' },
});
