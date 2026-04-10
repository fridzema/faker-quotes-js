# @fridzema/faker-quotes

A custom Faker provider for generating quotes. TypeScript port of [fridzema/faker-quotes](https://github.com/fridzema/faker-quotes).

Includes quotes across 4 categories: inspirational, funny, programming, and dad jokes.

## Installation

### Using Bun
```bash
bun add -d @fridzema/faker-quotes
```

### Using npm
```bash
npm install --save-dev @fridzema/faker-quotes
```

### Using pnpm
```bash
pnpm add -D @fridzema/faker-quotes
```

**Note:** `@faker-js/faker` is required as a peer dependency.

## Usage

### Basic Usage

```typescript
import { QuoteProvider } from '@fridzema/faker-quotes';
import { Faker } from '@faker-js/faker';

const faker = new Faker();
const quoteProvider = new QuoteProvider(faker);

// Get a random quote from any category
quoteProvider.quote();

// Get a quote from a specific category
quoteProvider.quote('dad');

// Get only the quote text
quoteProvider.quoteText();

// Get only the author
quoteProvider.quoteAuthor();

// Get quotes from specific categories
quoteProvider.funny();
quoteProvider.inspirational();
quoteProvider.programming();
quoteProvider.dad();
```

### Seeded Faker

```typescript
import { QuoteProvider } from '@fridzema/faker-quotes';
import { Faker } from '@faker-js/faker';

const faker = new Faker();
faker.seed(123); // For reproducible results

const quoteProvider = new QuoteProvider(faker);
const quote = quoteProvider.funny();
```

## Available Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `quote(category?)` | `Quote` | Get a random quote, optionally from a specific category |
| `quoteText(category?)` | `string` | Get just the quote text |
| `quoteAuthor(category?)` | `string` | Get just the author name |
| `funny()` | `Quote` | Get a funny quote |
| `inspirational()` | `Quote` | Get an inspirational quote |
| `programming()` | `Quote` | Get a programming quote |
| `dad()` | `Quote` | Get a dad joke |

## Types

```typescript
type Category = 'inspirational' | 'funny' | 'programming' | 'dad';

interface Quote {
  text: string;
  author: string;
  category: Category;
}
```

## Development

### Install dependencies
```bash
bun install
```

### Run tests
```bash
bun test
```

### Run linter
```bash
bun run lint
```

### Run type checking
```bash
bun run typecheck
```

### Build the project
```bash
bun run build
```

## License

MIT
