import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const isTablet = width >= 768;

export const scale = (size: number) => {
  const baseWidth = 375;
  return (width / baseWidth) * size;
};

export const moderateScale = (size: number, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

export const getNumColumns = () => {
  if (width >= 1024) return 4; // Tablets grandes
  if (width >= 768) return 3;  // Galaxy Tab Active 3 (800dp) cai aqui
  return 2;                     // Celulares
};

export { width, height };