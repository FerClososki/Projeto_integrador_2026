import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, useWindowDimensions } from 'react-native';
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
  
  // Detecta a largura da tela
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleRegister = async () => {
    if (password !== confirmPassword) return setError('As senhas não coincidem');
    if (!name || !email || !password) return setError('Preencha todos os campos obrigatórios');
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres');
    
    try {
      setError('');
      await register({ name, email, phone }, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.formContainer, isTablet && styles.formContainerTablet]}>
          
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>

          <Text style={styles.title}>Crie sua conta</Text>

          <View style={styles.form}>
            <CustomInput label="Nome completo" value={name} onChangeText={setName} placeholder="Seu nome" />
            <CustomInput label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="exemplo@email.com" />
            <CustomInput label="Telefone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="(00) 00000-0000" />
            <CustomInput label="Senha" isPassword value={password} onChangeText={setPassword} placeholder="Mínimo 6 caracteres" />
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: colors.background, justifyContent: 'center' },
  formContainer: { padding: spacing.lg, width: '100%' },
  formContainerTablet: { 
    maxWidth: 500, 
    alignSelf: 'center', 
    backgroundColor: colors.surface, 
    borderRadius: spacing.borderRadius.lg, 
    padding: spacing.xl,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  backButton: { marginBottom: spacing.md },
  title: { fontSize: typography.sizes.xl, fontWeight: 'bold', color: colors.text, marginBottom: spacing.lg, textAlign: 'center' },
  form: { marginTop: spacing.md },
  errorText: { color: colors.error, marginBottom: 10, textAlign: 'center' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  loginText: { color: colors.textLight, fontSize: typography.sizes.md },
  loginLink: { color: colors.primary, fontSize: typography.sizes.md, fontWeight: 'bold' },
});