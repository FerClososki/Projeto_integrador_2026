import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Address } from '../types';
import { SavedAddress, emptyAddress, getSavedAddresses, saveAddress, removeAddress } from '../services/addressService';
import { AddressEditor } from './AddressEditor';
import { ScreenHeader } from './ScreenHeader';
import { PrimaryButton } from './PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  userId: string;
  onClose: () => void;
  onSelect?: (address: SavedAddress) => void;
  initialAddress?: Address;
}

export function AddressBook({ userId, onClose, onSelect, initialAddress }: Props) {
  const createDraft = (address = emptyAddress): SavedAddress => ({ ...address,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, label: '', isDefault: false });
  const [editing, setEditing] = useState<SavedAddress | null>(() => initialAddress ? createDraft(initialAddress) : null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getSavedAddresses(userId).then(items => { if (active) { setAddresses(items); setError(''); } })
      .catch(() => { if (active) setError('Não foi possível carregar seus endereços. Tente novamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, reload]);

  const persist = async (address: SavedAddress, finishEditing = false) => {
    setSaving(true);
    try {
      setAddresses(await saveAddress(userId, address));
      if (finishEditing) setEditing(null);
    } catch (failure) {
      Alert.alert('Não foi possível salvar', failure instanceof Error ? failure.message : 'Tente novamente.');
    } finally { setSaving(false); }
  };

  const confirmRemove = (address: SavedAddress) => Alert.alert('Excluir endereço', `Excluir o endereço “${address.label}”?`, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Excluir', style: 'destructive', onPress: async () => {
      setSaving(true);
      try { setAddresses(await removeAddress(userId, address.id)); }
      catch { Alert.alert('Não foi possível excluir', 'Tente novamente.'); }
      finally { setSaving(false); }
    } },
  ]);

  const goBack = () => { if (!saving) { if (editing) setEditing(null); else onClose(); } };

  return <Modal visible animationType="slide" onRequestClose={goBack}>
    <SafeAreaView style={styles.root}>
      <ScreenHeader title={editing ? 'Salvar endereço' : 'Meus endereços'} onBack={goBack} />
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {loading ? <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando endereços" /> : error ? <>
            <Text style={styles.description}>{error}</Text>
            <PrimaryButton title="Tentar novamente" onPress={() => setReload(value => value + 1)} />
          </> : editing ? <AddressEditor key={editing.id} initialAddress={editing} saving={saving} onSave={address => persist(address, true)} /> : <>
            <Text style={styles.description}>{onSelect ? 'Escolha onde deseja receber esta compra.' : 'Salve os locais onde você costuma receber suas compras.'}</Text>
            {!addresses.length && <Text style={styles.empty}>Você ainda não tem endereços salvos.</Text>}
            {addresses.map(address => <View key={address.id} style={styles.card}>
              <Text style={styles.title}>{address.label}{address.isDefault ? ' · Principal' : ''}</Text>
              <Text style={styles.description}>{address.street}, {address.number}{address.complement ? ` · ${address.complement}` : ''}</Text>
              <Text style={styles.description}>{address.neighborhood} · {address.city} / {address.state}</Text>
              <Text style={styles.description}>CEP {address.zipCode.replace(/(\d{5})(\d{3})/, '$1-$2')}</Text>
              {onSelect && <PrimaryButton title="Entregar neste endereço" disabled={saving} onPress={() => onSelect(address)} />}
              <View style={styles.actions}>
                <Pressable disabled={saving} accessibilityRole="button" style={styles.action} onPress={() => setEditing(address)}><Text style={styles.link}>Editar</Text></Pressable>
                {!address.isDefault && <Pressable disabled={saving} accessibilityRole="button" style={styles.action} onPress={() => persist({ ...address, isDefault: true })}><Text style={styles.link}>Tornar principal</Text></Pressable>}
                <Pressable disabled={saving} accessibilityRole="button" style={styles.action} onPress={() => confirmRemove(address)}><Text style={styles.remove}>Excluir</Text></Pressable>
              </View>
            </View>)}
            <PrimaryButton title="Adicionar endereço" disabled={saving} onPress={() => setEditing(createDraft())} />
          </>}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  </Modal>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { padding: spacing.md, marginTop: spacing.md, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 17, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  description: { color: colors.textLight, fontSize: 14, lineHeight: 22 },
  empty: { textAlign: 'center', color: colors.textLight, paddingVertical: 32 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  action: { minHeight: 44, justifyContent: 'center', paddingRight: 20 },
  link: { color: colors.primary, fontWeight: 'bold' },
  remove: { color: colors.error, fontWeight: 'bold' },
});
