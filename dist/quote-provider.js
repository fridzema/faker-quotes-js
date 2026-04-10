import { faker as defaultFaker } from '@faker-js/faker';
import { categories } from './data/index.js';
export class QuoteProvider {
    faker;
    allQuotes;
    byCategory;
    constructor(faker) {
        this.faker = faker ?? defaultFaker;
        this.byCategory = {};
        this.allQuotes = [];
        for (const [category, entries] of Object.entries(categories)) {
            const cat = category;
            const quotes = entries.map((entry) => ({
                ...entry,
                category: cat,
            }));
            this.byCategory[cat] = quotes;
            this.allQuotes.push(...quotes);
        }
    }
    quote(category) {
        const pool = category ? this.byCategory[category] : this.allQuotes;
        const quotes = pool && pool.length > 0 ? pool : this.allQuotes;
        return this.faker.helpers.arrayElement(quotes);
    }
    quoteText(category) {
        return this.quote(category).quote;
    }
    quoteAuthor(category) {
        return this.quote(category).author;
    }
    funny() {
        return this.quoteText('funny');
    }
    inspirational() {
        return this.quoteText('inspirational');
    }
    programming() {
        return this.quoteText('programming');
    }
    dad() {
        return this.quoteText('dad');
    }
}
