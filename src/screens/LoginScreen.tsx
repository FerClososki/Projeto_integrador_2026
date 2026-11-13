import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function LoginScreen({ navigation }: any) {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Detecta a largura da tela para ajustar o layout
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleLogin = async () => {
    try {
      setError('');
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={[styles.formContainer, isTablet && styles.formContainerTablet]}>
          <Text style={styles.title}>Bem-vindo à Toy Mania!</Text>
          <Text style={styles.subtitle}>Entre para explorar um mundo de diversão e magia.</Text>

          <View style={styles.form}>
            <CustomInput 
              label="E-mail" 
              value={email} 
              onChangeText={setEmail} 
              keyboardType="email-address" 
              autoCapitalize="none" 
              placeholder="exemplo@email.com" 
            />
            
            <CustomInput 
              label="Senha" 
              isPassword 
              value={password} 
              onChangeText={setPassword} 
              placeholder="Sua senha" 
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <PrimaryButton title="Entrar" onPress={handleLogin} />
            
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Não tem uma conta? </Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Criar conta</Text>
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
    maxWidth: 450, 
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
  title: { fontSize: typography.sizes.xl, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: typography.sizes.md, color: colors.textLight, marginBottom: spacing.xl, textAlign: 'center' },
  form: { marginTop: spacing.md },
  errorText: { color: colors.error, marginBottom: 10, textAlign: 'center' },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  registerText: { color: colors.textLight, fontSize: typography.sizes.md },
  registerLink: { color: colors.primary, fontSize: typography.sizes.md, fontWeight: 'bold' },
});