import { type Faker } from '@faker-js/faker';
import type { Category, Quote } from './types.js';
export declare class QuoteProvider {
    private readonly faker;
    private readonly allQuotes;
    private readonly byCategory;
    constructor(faker?: Faker);
    quote(category?: Category): Quote;
    quoteText(category?: Category): string;
    quoteAuthor(category?: Category): string;
    funny(): string;
    inspirational(): string;
    programming(): string;
    dad(): string;
}
//# sourceMappingURL=quote-provider.d.ts.map