import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';
import { SavedAddress } from '../services/addressService';
import { findAddressByZipCode } from '../services/zipCodeService';
import { PrimaryButton } from './PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface Props {
  initialAddress: SavedAddress;
  saving: boolean;
  onSave: (address: SavedAddress) => void;
}

export function AddressEditor({ initialAddress, saving, onSave }: Props) {
  const [draft, setDraft] = useState(initialAddress);
  const [query, setQuery] = useState('');
  const [lookingUp, setLookingUp] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (query.length !== 8) { setLookingUp(false); setMessage(''); return; }
    let active = true;
    const controller = new AbortController();
    setLookingUp(true);
    setMessage('Buscando endereço...');
    const timeout = setTimeout(() => controller.abort(), 8000);
    const debounce = setTimeout(async () => {
      try {
        const found = await findAddressByZipCode(query, controller.signal);
        if (active) {
          setDraft(current => current.zipCode === query ? { ...current, ...found } : current);
          setMessage('Confira o endereço e complete os campos restantes.');
        }
      } catch {
        if (active) setMessage('Não foi possível preencher pelo CEP. Confira o CEP ou preencha manualmente.');
      } finally {
        clearTimeout(timeout);
        if (active) setLookingUp(false);
      }
    }, 350);
    return () => { active = false; controller.abort(); clearTimeout(timeout); clearTimeout(debounce); };
  }, [query]);

  const field = (name: keyof SavedAddress, label: string, options: { numeric?: boolean; maxLength?: number; automatic?: boolean } = {}) => (
    <View style={styles.field} key={name}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        accessibilityLabel={label}
        value={String(draft[name] ?? '')}
        editable={!saving && !(options.automatic && lookingUp)}
        keyboardType={options.numeric ? 'number-pad' : 'default'}
        maxLength={options.maxLength}
        autoCapitalize={name === 'state' ? 'characters' : 'sentences'}
        onChangeText={value => setDraft(current => ({ ...current, [name]: name === 'state' ? value.toUpperCase() : value }))}
      />
    </View>
  );

  return <View>
    <Text style={styles.label}>CEP</Text>
    <TextInput style={styles.input} accessibilityLabel="CEP" placeholder="00000-000"
      value={draft.zipCode.replace(/(\d{5})(\d)/, '$1-$2')} keyboardType="number-pad" maxLength={9} editable={!saving}
      onChangeText={value => {
        const zipCode = value.replace(/\D/g, '').slice(0, 8);
        if (zipCode === draft.zipCode) return;
        setDraft(current => ({ ...current, zipCode, street: '', neighborhood: '', city: '', state: '' }));
        setQuery(zipCode);
        setLookingUp(zipCode.length === 8);
      }} />
    <Text style={styles.hint} accessibilityLiveRegion="polite">{message || 'Digite o CEP para preencher o endereço automaticamente.'}</Text>
    {field('label', 'Nome do endereço (ex.: Casa ou Trabalho)', { maxLength: 40 })}
    {field('street', 'Rua / Avenida', { automatic: true })}
    {field('number', 'Número (ou s/n)')}
    {field('complement', 'Complemento (opcional)')}
    {field('neighborhood', 'Bairro', { automatic: true })}
    {field('city', 'Cidade', { automatic: true })}
    {field('state', 'UF', { maxLength: 2, automatic: true })}
    <View style={styles.defaultRow}>
      <Text style={styles.label}>Usar como endereço principal</Text>
      <Switch accessibilityLabel="Usar como endereço principal" value={draft.isDefault} disabled={saving}
        onValueChange={isDefault => setDraft(current => ({ ...current, isDefault }))} trackColor={{ true: colors.primary }} />
    </View>
    <PrimaryButton title="Salvar endereço" isLoading={saving} disabled={saving || lookingUp} onPress={() => onSave(draft)} />
  </View>;
}

const styles = StyleSheet.create({
  field: { marginBottom: spacing.md },
  label: { color: colors.text, fontSize: 14, fontWeight: '500', flexShrink: 1 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingHorizontal: 12, marginTop: 6, color: colors.text, backgroundColor: colors.surface, fontSize: 16 },
  hint: { fontSize: 13, color: colors.textLight, marginTop: 6, marginBottom: spacing.md },
  defaultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: spacing.sm },
});
