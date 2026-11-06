import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, PressableProps } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface Props extends PressableProps {
  title: string;
  variant?: 'primary' | 'outline';
  isLoading?: boolean;
}

export function PrimaryButton({ title, variant = 'primary', isLoading, ...rest }: Props) {
  const isOutline = variant === 'outline';
  
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.button, 
        isOutline ? styles.outline : styles.primary,
        pressed && { opacity: 0.8 },
        isLoading && { opacity: 0.7 }
      ]} 
      disabled={isLoading}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={isOutline ? colors.primary : '#FFF'} />
      ) : (
        <Text style={[styles.text, isOutline ? styles.textOutline : styles.textPrimary]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: spacing.borderRadius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  primary: { backgroundColor: colors.primary },
  outline: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary },
  text: { fontSize: typography.sizes.md, fontWeight: typography.weights.bold },
  textPrimary: { color: '#FFF' },
  textOutline: { color: colors.primary },
});