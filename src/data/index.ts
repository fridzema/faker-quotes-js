import type { Category, Quote } from '../types.js';
import { dad } from './dad.js';
import { funny } from './funny.js';
import { inspirational } from './inspirational.js';
import { programming } from './programming.js';

export const categories: Record<Category, Omit<Quote, 'category'>[]> = {
  inspirational,
  funny,
  programming,
  dad,
};
