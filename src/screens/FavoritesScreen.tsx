import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { FavoritesContext } from '../context/FavoritesContext';
import { ProductCard } from '../components/ProductCard';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { ScreenHeader } from '../components/ScreenHeader';

export function FavoritesScreen({ navigation }: any) {
  const { favorites } = useContext(FavoritesContext);

  return (
    <View style={styles.container}>
      {/* Cabeçalho com a seta de voltar */}
      <ScreenHeader title="Meus Favoritos" onBack={() => navigation.goBack()} />
      
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>Você ainda não tem favoritos.</Text>
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
  list: { padding: spacing.md },
  row: { justifyContent: 'space-between' },
  productWrapper: { width: '48%', marginBottom: spacing.md },
  empty: { 
    textAlign: 'center', 
    marginTop: spacing.xl, 
    color: colors.textLight,
    fontSize: 16
  },
});