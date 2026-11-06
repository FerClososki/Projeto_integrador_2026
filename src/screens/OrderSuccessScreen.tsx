import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function OrderSuccessScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={100} color={colors.success} />
      </View>
      <Text style={styles.title}>Pedido Confirmado!</Text>
      <Text style={styles.subtitle}>Obrigado por comprar na Toy Mania. Seu pedido já está sendo preparado com muito carinho.</Text>
      
      <PrimaryButton title="Acompanhar Pedido" onPress={() => navigation.navigate('Main', { screen: 'Orders' })} />
      <PrimaryButton title="Voltar ao Início" variant="outline" onPress={() => navigation.navigate('Main', { screen: 'Home' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  iconContainer: { marginBottom: spacing.lg },
  title: { fontSize: typography.sizes.xxl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  subtitle: { fontSize: typography.sizes.md, color: colors.textLight, textAlign: 'center', marginBottom: spacing.xxl },
});