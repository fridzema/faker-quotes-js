# faker-quotes-js Design Spec

## Overview

TypeScript port of [`fridzema/faker-quotes`](https://github.com/fridzema/faker-quotes) (PHP) as an npm package `@fridzema/faker-quotes`. Provides random quote generation across 4 categories (inspirational, funny, programming, dad) using `@faker-js/faker` for randomization.

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | Bun | User preference |
| Module format | ESM only | Modern, clean |
| Build | tsc | Simple, no bundler needed for a library |
| Test runner | bun test | Zero deps, built-in, Jest-compatible |
| Linter | oxlint | Strict rules, fast |
| Faker integration | Peer dependency | `@faker-js/faker ^9.0.0` as peer dep; uses `faker.helpers.arrayElement()` for randomization |
| Package scope | `@fridzema/faker-quotes` | Matches PHP vendor namespace |
| CI | GitHub Actions, ubuntu-latest | Node LTS (22) + latest (24) |

## Project Structure

```
faker-quotes-js/
├── src/
│   ├── index.ts                 # Public exports
│   ├── quote-provider.ts        # QuoteProvider class
│   ├── types.ts                 # Quote, Category types
│   └── data/
│       ├── index.ts             # Re-exports all categories as Record<Category, Quote[]>
│       ├── inspirational.ts     # Quote data (ported from PHP)
│       ├── funny.ts
│       ├── programming.ts
│       └── dad.ts
├── tests/
│   └── quote-provider.test.ts   # Bun test suite
├── .github/
│   └── workflows/
│       ├── tests.yml            # CI: bun test on ubuntu, Node 22 + 24
│       └── lint.yml             # CI: oxlint check
├── package.json
├── tsconfig.json
├── oxlint.json                  # Strict oxlint config
├── .gitignore
├── LICENSE.md
└── README.md
```

## Types

```typescript
export type Category = 'inspirational' | 'funny' | 'programming' | 'dad';

export interface Quote {
  quote: string;
  author: string;
  category: Category;
}
```

## API Surface

### QuoteProvider Class

```typescript
import type { Faker } from '@faker-js/faker';
import type { Quote, Category } from './types';

class QuoteProvider {
  constructor(faker?: Faker);

  quote(category?: Category): Quote;
  quoteText(category?: Category): string;
  quoteAuthor(category?: Category): string;
  funny(): string;
  inspirational(): string;
  programming(): string;
  dad(): string;
}
```

### Public Exports (index.ts)

```typescript
export { QuoteProvider } from './quote-provider';
export type { Quote, Category } from './types';
```

### Usage

```typescript
import { QuoteProvider } from '@fridzema/faker-quotes';

const quotes = new QuoteProvider();
quotes.funny();              // "I used to think I was indecisive..."
quotes.quote();              // { quote: "...", author: "...", category: "funny" }
quotes.quote('dad');         // { quote: "...", author: "...", category: "dad" }
quotes.quoteText('programming'); // "First, solve the problem..."
quotes.quoteAuthor();        // "Walt Disney"
```

With a custom Faker instance (for seeding):

```typescript
import { faker } from '@faker-js/faker';
import { QuoteProvider } from '@fridzema/faker-quotes';

faker.seed(123);
const quotes = new QuoteProvider(faker);
quotes.funny(); // deterministic output
```

## Data Files

Each category file exports a typed array of `Omit<Quote, 'category'>[]`. The `category` field is added at runtime by `QuoteProvider` (same pattern as the PHP version).

```typescript
// data/inspirational.ts
import type { Quote } from '../types';

export const inspirational: Omit<Quote, 'category'>[] = [
  { quote: 'The best way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  // ... ported 1:1 from PHP source
];
```

The `data/index.ts` barrel file maps all categories:

```typescript
import type { Category, Quote } from '../types';
import { inspirational } from './inspirational';
import { funny } from './funny';
import { programming } from './programming';
import { dad } from './dad';

export const categories: Record<Category, Omit<Quote, 'category'>[]> = {
  inspirational,
  funny,
  programming,
  dad,
};
```

## QuoteProvider Implementation

- Constructor accepts optional `Faker` instance, defaults to `import { faker } from '@faker-js/faker'`
- On construction, builds a flat `allQuotes: Quote[]` array by iterating categories and adding the `category` field
- Also keeps a `byCategory: Record<Category, Quote[]>` map for filtered lookups
- `quote(category?)` uses `faker.helpers.arrayElement()` to pick from the filtered or full array
- If an unknown category is passed (shouldn't happen with types, but runtime safety), falls back to all quotes
- Convenience methods (`funny()`, `inspirational()`, etc.) delegate to `quoteText(category)`

## Tooling Configuration

### package.json

- `type: "module"`
- `main: "./dist/index.js"`
- `types: "./dist/index.d.ts"`
- `exports: { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } }`
- `files: ["dist"]`
- `peerDependencies: { "@faker-js/faker": "^9.0.0" }`
- `devDependencies: { "@faker-js/faker": "^9.0.0", "oxlint": "latest", "typescript": "^5.0.0" }`
- Scripts: `build` (tsc), `test` (bun test), `lint` (oxlint), `typecheck` (tsc --noEmit)

### tsconfig.json

- `strict: true`
- `target: "ES2022"`
- `module: "ESNext"`
- `moduleResolution: "bundler"`
- `declaration: true`
- `declarationMap: true`
- `outDir: "dist"`
- `rootDir: "src"`
- `skipLibCheck: true`

### oxlint.json

- Enable rule categories: `correctness`, `suspicious`, `pedantic`, `style`, `nursery` (selectively)
- Enable TypeScript-specific rules via `typescript` plugin
- Deny level for correctness/suspicious, warn level for pedantic/style

## CI

### tests.yml

- Triggers: push, pull_request to main
- ubuntu-latest
- Matrix: Node 22 (LTS), 24 (latest)
- Steps: checkout, setup bun, install deps, lint (oxlint), typecheck (tsc --noEmit), test (bun test)

### lint.yml

- Triggers: push, pull_request to main
- Runs oxlint separately

## Testing

Using `bun test`. No mocking — tests hit real data arrays. Faker seeding for deterministic assertions where needed.

### Test Cases

```
Construction:
- creates with default faker instance
- creates with custom faker instance

quote() method:
- returns a Quote object with quote, author, category fields
- returns quote from correct category when specified
- returns any quote when no category specified
- falls back to all quotes for unknown category

Convenience methods:
- funny() returns a string
- inspirational() returns a string
- programming() returns a string
- dad() returns a string

quoteText() / quoteAuthor():
- quoteText() returns only the quote string
- quoteAuthor() returns only the author string
- quoteText(category) filters by category

Type safety:
- category field is a valid Category union member
```
