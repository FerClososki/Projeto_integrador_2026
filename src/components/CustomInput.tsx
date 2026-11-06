import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface Props extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function CustomInput({ label, error, isPassword, ...rest }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrapper, error ? styles.inputError : null]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textLight}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />
        {isPassword && (
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={22} 
              color={colors.textLight} 
            />
          </Pressable>
        )}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: typography.sizes.sm, color: colors.text, marginBottom: spacing.xs, fontWeight: '500' },
  inputWrapper: {
    height: 50,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: { flex: 1, fontSize: typography.sizes.md, color: colors.text },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: typography.sizes.xs, marginTop: spacing.xs },
});