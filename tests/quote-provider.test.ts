import { describe, expect, test } from 'bun:test';
import { faker } from '@faker-js/faker';
import { QuoteProvider } from '../src/quote-provider';
import type { Category, Quote } from '../src/types';

describe('QuoteProvider', () => {
  describe('construction', () => {
    test('creates with default faker instance', () => {
      const provider = new QuoteProvider();
      const quote = provider.quote();
      expect(quote).toBeDefined();
    });

    test('creates with custom faker instance', () => {
      const customFaker = faker;
      customFaker.seed(42);
      const provider = new QuoteProvider(customFaker);
      const quote = provider.quote();
      expect(quote).toBeDefined();
    });
  });

  describe('quote()', () => {
    test('returns a Quote object with quote, author, category fields', () => {
      const provider = new QuoteProvider();
      const quote = provider.quote();
      expect(quote).toHaveProperty('quote');
      expect(quote).toHaveProperty('author');
      expect(quote).toHaveProperty('category');
      expect(typeof quote.quote).toBe('string');
      expect(typeof quote.author).toBe('string');
      expect(typeof quote.category).toBe('string');
    });

    test('returns quote from correct category when specified', () => {
      const provider = new QuoteProvider();

      const funnyQuote = provider.quote('funny');
      expect(funnyQuote.category).toBe('funny');

      const inspirationalQuote = provider.quote('inspirational');
      expect(inspirationalQuote.category).toBe('inspirational');

      const programmingQuote = provider.quote('programming');
      expect(programmingQuote.category).toBe('programming');

      const dadQuote = provider.quote('dad');
      expect(dadQuote.category).toBe('dad');
    });

    test('returns any quote when no category specified', () => {
      const provider = new QuoteProvider();
      const quote = provider.quote();
      const validCategories: Category[] = ['inspirational', 'funny', 'programming', 'dad'];
      expect(validCategories).toContain(quote.category);
    });
  });

  describe('convenience methods', () => {
    test('funny() returns a string', () => {
      const provider = new QuoteProvider();
      const result = provider.funny();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(5);
    });

    test('inspirational() returns a string', () => {
      const provider = new QuoteProvider();
      const result = provider.inspirational();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(5);
    });

    test('programming() returns a string', () => {
      const provider = new QuoteProvider();
      const result = provider.programming();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(5);
    });

    test('dad() returns a string', () => {
      const provider = new QuoteProvider();
      const result = provider.dad();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(5);
    });
  });

  describe('quoteText() and quoteAuthor()', () => {
    test('quoteText() returns only the quote string', () => {
      const provider = new QuoteProvider();
      const text = provider.quoteText();
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(5);
    });

    test('quoteAuthor() returns only the author string', () => {
      const provider = new QuoteProvider();
      const author = provider.quoteAuthor();
      expect(typeof author).toBe('string');
      expect(author.length).toBeGreaterThan(0);
    });

    test('quoteText(category) filters by category', () => {
      faker.seed(123);
      const provider = new QuoteProvider(faker);
      const text = provider.quoteText('programming');
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(5);
    });
  });

  describe('type safety', () => {
    test('category field is a valid Category union member', () => {
      const provider = new QuoteProvider();
      const validCategories: Category[] = ['inspirational', 'funny', 'programming', 'dad'];

      for (let i = 0; i < 20; i++) {
        const quote = provider.quote();
        expect(validCategories).toContain(quote.category);
      }
    });
  });

  describe('seeded determinism', () => {
    test('same seed produces same quote', () => {
      faker.seed(42);
      const provider1 = new QuoteProvider(faker);
      const quote1 = provider1.quote();

      faker.seed(42);
      const provider2 = new QuoteProvider(faker);
      const quote2 = provider2.quote();

      expect(quote1).toEqual(quote2);
    });
  });
});
