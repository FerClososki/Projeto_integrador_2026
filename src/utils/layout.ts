import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Define se é tablet baseado na largura da tela
export const isTablet = width >= 768;

// Função para escalar tamanhos baseados na largura da tela
export const scale = (size: number) => {
  const baseWidth = 375; // Largura base (iPhone padrão)
  return (width / baseWidth) * size;
};

// Função para limitar a escala (evita que fique gigante em tablets)
export const moderateScale = (size: number, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Quantidade de colunas para listas de produtos
export const getNumColumns = () => {
  if (width >= 1024) return 4; // Tablets grandes
  if (width >= 768) return 3;  // Tablets normais
  return 2;                     // Celulares
};

export { width, height };