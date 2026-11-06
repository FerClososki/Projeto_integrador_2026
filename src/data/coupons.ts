import { Coupon } from '../types';

export const coupons: Coupon[] = [
  {
    code: 'FRETEGRATIS',
    freeShipping: true,
    description: 'Frete grátis em compras acima de R$ 100,00',
  },
  {
    code: 'TOYMANIA10',
    discountPercentage: 10,
    description: '10% de desconto em produtos selecionados',
  }
];