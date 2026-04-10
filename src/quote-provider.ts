import { faker as defaultFaker, type Faker } from '@faker-js/faker';
import { categories } from './data/index';
import type { Category, Quote } from './types';

export class QuoteProvider {
  private readonly faker: Faker;
  private readonly allQuotes: Quote[];
  private readonly byCategory: Record<Category, Quote[]>;

  constructor(faker?: Faker) {
    this.faker = faker ?? defaultFaker;

    this.byCategory = {} as Record<Category, Quote[]>;
    this.allQuotes = [];

    for (const [category, entries] of Object.entries(categories)) {
      const cat = category as Category;
      const quotes: Quote[] = entries.map((entry) => ({
        ...entry,
        category: cat,
      }));
      this.byCategory[cat] = quotes;
      this.allQuotes.push(...quotes);
    }
  }

  quote(category?: Category): Quote {
    const pool = category ? this.byCategory[category] : this.allQuotes;
    const quotes = pool && pool.length > 0 ? pool : this.allQuotes;
    return this.faker.helpers.arrayElement(quotes);
  }

  quoteText(category?: Category): string {
    return this.quote(category).quote;
  }

  quoteAuthor(category?: Category): string {
    return this.quote(category).author;
  }

  funny(): string {
    return this.quoteText('funny');
  }

  inspirational(): string {
    return this.quoteText('inspirational');
  }

  programming(): string {
    return this.quoteText('programming');
  }

  dad(): string {
    return this.quoteText('dad');
  }
}
