import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SearchBar } from '../components/SearchBar';
import { ProductCard } from '../components/ProductCard';
import { ScreenHeader } from '../components/ScreenHeader';
import { products } from '../data/products';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { getNumColumns } from '../utils/layout';

export function SearchScreen({ navigation, route }: any) {
  const initialQuery = route.params?.query || '';
  const [search, setSearch] = useState(initialQuery);

  // Busca por nome E categoria
  const results = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Buscar Brinquedos" onBack={() => navigation.goBack()} />
      
      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} onClear={() => setSearch('')} />
      </View>
      
      {results.length === 0 && search.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Ops!</Text>
          <Text style={styles.emptySubtitle}>
            Não possuímos "{search}" na loja. Tente outra palavra.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={getNumColumns()}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={{ flex: 1, marginBottom: spacing.md }}>
              <ProductCard 
                product={item} 
                onPress={() => navigation.navigate('ProductDetails', { productId: item.id })} 
              />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchContainer: { padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  list: { padding: spacing.md },
  row: { justifyContent: 'space-between', marginHorizontal: spacing.xs },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: spacing.sm },
  emptySubtitle: { fontSize: 16, color: colors.textLight, textAlign: 'center' },
});