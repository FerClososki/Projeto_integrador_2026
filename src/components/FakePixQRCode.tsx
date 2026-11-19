import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

const size = 25;

function isFinderModule(row: number, column: number, startRow: number, startColumn: number) {
  const y = row - startRow;
  const x = column - startColumn;
  if (y < 0 || y > 6 || x < 0 || x > 6) return null;
  return y === 0 || y === 6 || x === 0 || x === 6 || (x >= 2 && x <= 4 && y >= 2 && y <= 4);
}

function isDarkModule(row: number, column: number) {
  for (const [startRow, startColumn] of [[0, 0], [0, size - 7], [size - 7, 0]]) {
    const finder = isFinderModule(row, column, startRow, startColumn);
    if (finder !== null) return finder;
  }
  // Padrão decorativo não codificável, sem uma cobrança Pix ou chave de pagamento.
  return ((row * 17 + column * 31 + row * column * 7 + (row ^ column) * 13) % 19) < 9;
}

export function FakePixQRCode() {
  return <View style={styles.container} accessibilityLabel="QR Code ilustrativo, sem valor para pagamento">
    <View style={styles.grid}>
      {Array.from({ length: size }, (_, row) => <View key={row} style={styles.row}>
        {Array.from({ length: size }, (_, column) => <View key={column} style={[styles.module, isDarkModule(row, column) && styles.darkModule]} />)}
      </View>)}
    </View>
    <View style={styles.logoTile}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" accessibilityLabel="Toy Mania" />
    </View>
    <View style={styles.badge}><Text style={styles.badgeText}>DEMONSTRAÇÃO</Text></View>
  </View>;
}

const styles = StyleSheet.create({
  container: { width: 252, maxWidth: '100%', aspectRatio: 1, alignSelf: 'center', padding: 10, backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: colors.border, position: 'relative' },
  grid: { flex: 1 },
  row: { flex: 1, flexDirection: 'row' },
  module: { flex: 1, backgroundColor: '#FFF' },
  darkModule: { backgroundColor: '#17212B' },
  logoTile: { position: 'absolute', width: 52, height: 52, left: '50%', top: '50%', marginLeft: -26, marginTop: -26, backgroundColor: '#FFF', borderRadius: 10, padding: 4, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  logo: { width: '100%', height: '100%' },
  badge: { position: 'absolute', alignSelf: 'center', bottom: 14, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: colors.primary, borderRadius: 6 },
  badgeText: { color: '#FFF', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
});
