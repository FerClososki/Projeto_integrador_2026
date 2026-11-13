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
      <View style={styles.emptyContainer}>
        <Ionicons name="person-outline" size={60} color={colors.textLight} />
        <Text style={styles.emptyText}>Nenhum usuário logado.</Text>
        <Pressable style={styles.loginButton} onPress={signOut}>
          <Text style={styles.loginButtonText}>Ir para o Login</Text>
        </Pressable>
      </View>
    );
  }

  const menuItems = [
    { icon: 'receipt-outline', label: 'Meus Pedidos', route: 'Orders' },
    { icon: 'heart-outline', label: 'Lista de Favoritos', route: 'Favorites' },
    { icon: 'location-outline', label: 'Endereço de Entrega', route: 'Address' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <Pressable 
            key={index} 
            style={styles.menuItem} 
            onPress={() => {
              if (item.route === 'Orders') {
                navigation.navigate('Orders');
              } else if (item.route === 'Favorites') {
                navigation.getParent()?.navigate('Favorites');
              } else if (item.route === 'Address') {
                navigation.getParent()?.navigate('Address');
              }
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name={item.icon as any} size={22} color={colors.primary} />
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            {item.route === 'Favorites' && favorites.length > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{favorites.length}</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', padding: spacing.xl, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { fontSize: typography.sizes.xxl, color: '#FFF', fontWeight: 'bold' },
  name: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: colors.text },
  email: { fontSize: typography.sizes.sm, color: colors.textLight, marginTop: 4 },
  menu: { marginTop: spacing.lg, backgroundColor: colors.surface, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { marginLeft: spacing.md, fontSize: typography.sizes.md, color: colors.text },
  badge: { backgroundColor: colors.primary, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: spacing.sm },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.xl, padding: spacing.md },
  logoutText: { color: colors.error, fontSize: typography.sizes.md, fontWeight: 'bold', marginLeft: spacing.sm },
  emptyContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyText: { fontSize: typography.sizes.md, color: colors.textLight, marginTop: 10, marginBottom: 20 },
  loginButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  loginButtonText: { color: '#FFF', fontWeight: 'bold' },
});