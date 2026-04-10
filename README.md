# @fridzema/faker-quotes

A custom Faker provider for generating quotes. TypeScript port of [fridzema/faker-quotes](https://github.com/fridzema/faker-quotes).

Includes quotes across 4 categories: inspirational, funny, programming, and dad jokes.

## Installation

Install both this package and its peer dependency `@faker-js/faker`:

### From npm

```bash
bun add -d @faker-js/faker @fridzema/faker-quotes
```

```bash
npm install -D @faker-js/faker @fridzema/faker-quotes
```

### From GitHub

```bash
bun add -d @faker-js/faker fridzema/faker-quotes-js
```

```bash
npm install -D @faker-js/faker fridzema/faker-quotes-js
```

## Usage

```typescript
import { QuoteProvider } from '@fridzema/faker-quotes';

const quotes = new QuoteProvider();

quotes.quote();              // { quote: '...', author: '...', category: 'funny' }
quotes.quote('dad');         // { quote: '...', author: '...', category: 'dad' }
quotes.quoteText();          // 'The best way to get started is...'
quotes.quoteAuthor();        // 'Walt Disney'
quotes.funny();              // random funny quote text
quotes.inspirational();      // random inspirational quote text
quotes.programming();        // random programming quote text
quotes.dad();                // random dad joke text
```

### With a seeded Faker instance

For deterministic/reproducible output, pass a seeded Faker instance:

```typescript
import { faker } from '@faker-js/faker';
import { QuoteProvider } from '@fridzema/faker-quotes';

faker.seed(123);
const quotes = new QuoteProvider(faker);
quotes.funny(); // always returns the same quote for seed 123
```

## Available Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `quote(category?)` | `Quote` | Random quote object `{ quote, author, category }` |
| `quoteText(category?)` | `string` | Random quote text |
| `quoteAuthor(category?)` | `string` | Random quote author |
| `funny()` | `string` | Random funny quote text |
| `inspirational()` | `string` | Random inspirational quote text |
| `programming()` | `string` | Random programming quote text |
| `dad()` | `string` | Random dad joke text |

## Types

```typescript
type Category = 'inspirational' | 'funny' | 'programming' | 'dad';

interface Quote {
  quote: string;
  author: string;
  category: Category;
}
```

## Development

```bash
bun install
bun test
bun run lint
bun run typecheck
bun run build
```

## License

MIT
