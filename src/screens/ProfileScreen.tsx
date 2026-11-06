import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { FavoritesContext } from '../context/FavoritesContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function ProfileScreen({ navigation }: any) {
  const { user, signOut } = useContext(AuthContext);
  const { favorites } = useContext(FavoritesContext);

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <Ionicons name="person-outline" size={60} color={colors.textLight} />
        <Text style={{ marginTop: 10, marginBottom: 20, color: colors.textLight }}>Nenhum usuário logado.</Text>
        <Pressable style={{ backgroundColor: colors.primary, padding: 10, borderRadius: 20 }} onPress={signOut}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Ir para o Login</Text>
        </Pressable>
      </View>
    );
  }

  const menuItems = [
    { icon: 'receipt-outline', label: 'Meus Pedidos', route: 'Orders' },
    { icon: 'heart-outline', label: 'Lista de Favoritos', route: 'Favorites' },
    { icon: 'location-outline', label: 'Endereço de Entrega', route: null },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || 'U'}</Text></View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>
      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <Pressable key={index} style={styles.menuItem} onPress={() => {
            if (item.route === 'Orders') navigation.navigate('Orders');
            else if (item.route === 'Favorites') navigation.getParent()?.navigate('Favorites');
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={item.icon as any} size={22} color={colors.primary} />
              <Text style={{ marginLeft: 15 }}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.logoutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={{ color: colors.error, fontWeight: 'bold', marginLeft: 5 }}>Sair da Conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', padding: 30, backgroundColor: colors.surface },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { fontSize: 32, color: '#FFF', fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold' },
  email: { fontSize: 14, color: colors.textLight },
  menu: { marginTop: 20, backgroundColor: colors.surface },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 30, padding: 15 },
});