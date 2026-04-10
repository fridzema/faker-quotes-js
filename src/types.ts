export type Category = 'inspirational' | 'funny' | 'programming' | 'dad';

export interface Quote {
  quote: string;
  author: string;
  category: Category;
}
