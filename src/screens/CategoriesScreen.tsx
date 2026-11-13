import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, ScrollView } from 'react-native';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { getNumColumns } from '../utils/layout';

export function CategoriesScreen({ navigation, route }: any) {
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // ESSA PARTE É A CHAVE: Recebe o categoryId enviado pela Home
  useEffect(() => {
    if (route.params?.categoryId) {
      setSelectedCategoryId(route.params.categoryId);
    }
  }, [route.params]);

  // Descobre o nome da categoria baseado no ID
  const selectedCategoryName = selectedCategoryId 
    ? categories.find(c => c.id === selectedCategoryId)?.name 
    : null;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    
    // Filtra pelo NOME da categoria
    const matchesCategory = selectedCategoryName 
      ? p.category.trim() === selectedCategoryName.trim() 
      : true;

    return matchesSearch && matchesCategory;
  });

  const numColumns = getNumColumns();

  return (
    <View style={styles.container}>
      <ScreenHeader title="Categorias" showBackButton={false} />
      
      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} onClear={() => setSearch('')} />
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersList}>
          <Pressable 
            style={[styles.filterChip, !selectedCategoryId && styles.filterChipActive]} 
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text style={[styles.filterText, !selectedCategoryId && styles.filterTextActive]}>Todas</Text>
          </Pressable>
          {categories.map((cat) => (
            <Pressable 
              key={cat.id} 
              style={[styles.filterChip, selectedCategoryId === cat.id && styles.filterChipActive]} 
              onPress={() => setSelectedCategoryId(cat.id)}
            >
              <Text style={[styles.filterText, selectedCategoryId === cat.id && styles.filterTextActive]}>{cat.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.empty}>Nenhum produto encontrado nesta categoria.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            onPress={() => navigation.navigate('ProductDetails', { productId: item.id })} 
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm, backgroundColor: colors.surface },
  filtersContainer: { paddingVertical: spacing.sm },
  filtersList: { paddingHorizontal: spacing.md },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: spacing.borderRadius.pill, backgroundColor: colors.surface, marginRight: spacing.sm, borderWidth: 1, borderColor: colors.border },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: typography.sizes.sm, color: colors.textLight },
  filterTextActive: { color: '#FFF', fontWeight: 'bold' },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  row: { justifyContent: 'flex-start', gap: spacing.sm },
  emptyContainer: { padding: spacing.xl, alignItems: 'center' },
  empty: { textAlign: 'center', color: colors.textLight, fontSize: 16 },
});