import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function RegisterScreen({ navigation }: any) {
  const { register } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) return setError('As senhas não coincidem');
    if (!name || !email || !password) return setError('Preencha todos os campos obrigatórios');
    
    try {
      setError('');
      await register({ name, email, phone }, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Botão de Voltar para o Login */}
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>

        <Text style={styles.title}>Crie sua conta</Text>

        <View style={styles.form}>
          <CustomInput label="Nome completo" value={name} onChangeText={setName} placeholder="Seu nome" />
          <CustomInput label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="exemplo@email.com" />
          <CustomInput label="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="(00) 00000-0000" />
          
          <CustomInput label="Senha" isPassword value={password} onChangeText={setPassword} placeholder="Sua senha" />
          <CustomInput label="Confirmar Senha" isPassword value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Repita a senha" />
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <PrimaryButton title="Cadastrar" onPress={handleRegister} />
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Fazer login</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: 'center' },
  backButton: { position: 'absolute', top: spacing.lg, left: spacing.md, zIndex: 10 },
  title: { fontSize: typography.sizes.xl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.lg },
  form: { marginTop: spacing.md },
  errorText: { color: colors.error, marginBottom: 10, textAlign: 'center' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  loginText: { color: colors.textLight, fontSize: typography.sizes.md },
  loginLink: { color: colors.primary, fontSize: typography.sizes.md, fontWeight: 'bold' },
});