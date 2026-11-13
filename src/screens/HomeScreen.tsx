import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { AppHeader } from '../components/AppHeader';
import { SearchBar } from '../components/SearchBar';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { categories } from '../data/categories';
import { coupons } from '../data/coupons';
import { CartContext } from '../context/CartContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function HomeScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const { items } = useContext(CartContext);

  const popularCategories = categories.slice(0, 5);
  const featuredProducts = products.slice(0, 4);
  const bestSellers = products.slice(2, 6);

  const handleSearch = () => {
    if (search.trim()) {
      navigation.navigate('Search', { query: search });
    }
  };

  const handleCopyCoupon = async (code: string) => {
    await Clipboard.setStringAsync(code);
    alert(`Cupom ${code} copiado! Cole na tela de pagamento.`);
  };

  return (
    <View style={styles.container}>
      <AppHeader onOpenCart={() => navigation.navigate('Cart')} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onClear={() => setSearch('')}
          />
        </View>

        {/* Banner Promocional */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>Até 40% OFF em{'\n'}Brinquedos Educativos</Text>
            <Pressable style={styles.bannerButton} onPress={() => navigation.navigate('Categories', { categoryId: '5' })}>
              <Text style={styles.bannerButtonText}>Aproveitar</Text>
            </Pressable>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=300&q=80' }} 
            style={styles.bannerImage} 
          />
        </View>

        {/* Categorias Populares */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias Populares</Text>
          <Pressable onPress={() => navigation.navigate('Categories')}>
            <Text style={styles.seeAll}>Ver todas</Text>
          </Pressable>
        </View>
        <FlatList
          data={popularCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <Pressable
              style={styles.categoryCard}
              onPress={() => navigation.navigate('Categories', { categoryId: item.id })}
            >
              <View style={styles.categoryIcon}>
                <Ionicons name={item.icon as any} size={28} color={colors.primary} />
              </View>
              <Text style={styles.categoryName} numberOfLines={2}>{item.name}</Text>
            </Pressable>
          )}
        />

        {/* Destaques Encantados */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Destaques Encantados</Text>
          <Pressable onPress={() => navigation.navigate('Search', { query: '' })}>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </Pressable>
        </View>
        <FlatList
          data={featuredProducts}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            />
          )}
        />

        {/* Mais Vendidos */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mais Vendidos</Text>
          <Pressable onPress={() => navigation.navigate('Search', { query: '' })}>
            <Text style={styles.seeAll}>Ver tudo</Text>
          </Pressable>
        </View>
        <FlatList
          data={bestSellers}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })}
            />
          )}
        />

        {/* Cupons */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cupons Exclusivos</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {coupons.map((coupon) => (
            <View key={coupon.code} style={styles.couponCard}>
              <Ionicons name="pricetag-outline" size={24} color={colors.secondary} />
              <View style={styles.couponInfo}>
                <Text style={styles.couponCode}>{coupon.code}</Text>
                <Text style={styles.couponDesc}>{coupon.description}</Text>
              </View>
              <Pressable onPress={() => handleCopyCoupon(coupon.code)} style={{ padding: spacing.xs }}>
                <Ionicons name="copy-outline" size={22} color={colors.primary} />
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: spacing.xl },
  searchContainer: { padding: spacing.md },
  banner: {
    marginHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: '#FFF', marginBottom: spacing.sm },
  bannerButton: { backgroundColor: colors.secondary, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: spacing.borderRadius.pill, alignSelf: 'flex-start' },
  bannerButtonText: { color: colors.text, fontWeight: 'bold', fontSize: typography.sizes.sm },
  bannerImage: { width: 100, height: 100, borderRadius: 50, marginLeft: spacing.sm, borderWidth: 3, borderColor: '#FFF' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, marginTop: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { fontSize: typography.sizes.lg, fontWeight: 'bold', color: colors.text },
  seeAll: { fontSize: typography.sizes.sm, color: colors.primary, fontWeight: '500' },
  horizontalList: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  categoryCard: { alignItems: 'center', marginRight: spacing.md, width: 80 },
  categoryIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  categoryName: { fontSize: typography.sizes.xs, textAlign: 'center', color: colors.text },
  couponCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: spacing.borderRadius.md, marginRight: spacing.md, borderWidth: 1, borderColor: colors.secondary },
  couponInfo: { marginLeft: spacing.sm, flex: 1 },
  couponCode: { fontSize: typography.sizes.sm, fontWeight: 'bold', color: colors.primary },
  couponDesc: { fontSize: typography.sizes.xs, color: colors.textLight, maxWidth: 180 },
});