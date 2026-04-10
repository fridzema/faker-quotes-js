import type { Category, Quote } from '../types';
import { dad } from './dad';
import { funny } from './funny';
import { inspirational } from './inspirational';
import { programming } from './programming';

export const categories: Record<Category, Omit<Quote, 'category'>[]> = {
  inspirational,
  funny,
  programming,
  dad,
};
