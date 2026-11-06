import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ScrollView } from 'react-native';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function CategoriesScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === categories.find(c => c.id === selectedCategory)?.name : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <View style={styles.container}>
      {/* Cabeçalho padronizado. Como é uma aba principal, a seta de voltar fica oculta */}
      <ScreenHeader title="Categorias" showBackButton={false} />
      
      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} onClear={() => setSearch('')} />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
          <Pressable 
            style={[styles.filterChip, !selectedCategory && styles.filterChipActive]} 
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.filterText, !selectedCategory && styles.filterTextActive]}>Todas</Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable 
              key={cat.id} 
              style={[styles.filterChip, selectedCategory === cat.id && styles.filterChipActive]} 
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.filterText, selectedCategory === cat.id && styles.filterTextActive]}>{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>Nenhum produto encontrado.</Text>}
        renderItem={({ item }) => (
          <View style={styles.productWrapper}>
            <ProductCard 
              product={item} 
              onPress={() => navigation.navigate('ProductDetails', { productId: item.id })} 
            />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: { 
    paddingHorizontal: spacing.md, 
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  filtersContainer: { paddingVertical: spacing.sm },
  filtersList: { paddingHorizontal: spacing.md },
  filterChip: { 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.xs, 
    borderRadius: spacing.borderRadius.pill, 
    backgroundColor: colors.surface, 
    marginRight: spacing.sm, 
    borderWidth: 1, 
    borderColor: colors.border 
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: typography.sizes.sm, color: colors.textLight },
  filterTextActive: { color: '#FFF', fontWeight: 'bold' },
  list: { padding: spacing.md },
  row: { justifyContent: 'space-between' },
  productWrapper: { width: '48%', marginBottom: spacing.md },
  empty: { textAlign: 'center', marginTop: spacing.xl, color: colors.textLight },
});