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
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  return 2;
};

export { width, height };