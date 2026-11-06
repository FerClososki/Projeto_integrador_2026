import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SearchBar } from '../components/SearchBar';
import { ProductCard } from '../components/ProductCard';
import { products } from '../data/products';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { ScreenHeader } from '../components/ScreenHeader';

export function SearchScreen({ navigation, route }: any) {
  const initialQuery = route.params?.query || '';
  const [search, setSearch] = useState(initialQuery);

  const results = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho com a seta de voltar */}
      <ScreenHeader title="Buscar Brinquedos" onBack={() => navigation.goBack()} />
      
      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <SearchBar value={search} onChangeText={setSearch} onClear={() => setSearch('')} />
      </View>
      
      {/* Lista de resultados */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhum produto encontrado para "{search}".
          </Text>
        }
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
    padding: spacing.md, 
    backgroundColor: colors.surface, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.border 
  },
  list: { padding: spacing.md },
  row: { justifyContent: 'space-between' },
  productWrapper: { width: '48%', marginBottom: spacing.md, alignItems: 'center' },
  empty: { 
    textAlign: 'center', 
    marginTop: spacing.xl, 
    color: colors.textLight,
    fontSize: 16
  },
});