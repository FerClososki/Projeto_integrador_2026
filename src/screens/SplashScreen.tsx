import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

export function SplashScreen({ navigation }: any) {
  const { isLoading, user } = useContext(AuthContext);

    useEffect(() => {
    console.log("Splash: Iniciou. isLoading:", isLoading, "user:", user ? "logado" : "nulo");
    
    if (!isLoading) {
      if (user) {
        console.log("Splash: Redirecionando para Main");
        navigation.replace('Main');
      } else {
        console.log("Splash: Redirecionando para Login");
        navigation.replace('Login');
      }
    }
  }, [isLoading, user, navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Toy Mania</Text>
      <Text style={styles.subtitle}>Onde a imaginação ganha vida.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 200, height: 200, marginBottom: 20 },
  title: { fontSize: typography.sizes.xxl, fontWeight: 'bold', color: colors.primary },
  subtitle: { fontSize: typography.sizes.md, color: colors.textLight, marginTop: 8 },
});