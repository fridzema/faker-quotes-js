# faker-quotes-js Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the PHP `fridzema/faker-quotes` package to TypeScript as `@fridzema/faker-quotes`, an npm package that uses `@faker-js/faker` for randomization.

**Architecture:** A `QuoteProvider` class wraps `@faker-js/faker`'s `helpers.arrayElement()` to pick random quotes from typed data arrays. Quote data is ported 1:1 from the PHP source (with deduplication). The package ships ESM-only with full type declarations.

**Tech Stack:** TypeScript, Bun (runtime + test runner + package manager), oxlint (linter), `@faker-js/faker` (peer dependency), GitHub Actions (CI)

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/types.ts` | `Category` union type, `Quote` interface |
| `src/data/inspirational.ts` | Inspirational quotes array (ported from PHP, deduplicated) |
| `src/data/funny.ts` | Funny quotes array (ported from PHP) |
| `src/data/programming.ts` | Programming quotes array (ported from PHP) |
| `src/data/dad.ts` | Dad jokes array (ported from PHP) |
| `src/data/index.ts` | Barrel export: `categories` record mapping category name to quote arrays |
| `src/quote-provider.ts` | `QuoteProvider` class with all public methods |
| `src/index.ts` | Package entry point: re-exports `QuoteProvider`, `Quote`, `Category` |
| `tests/quote-provider.test.ts` | Full test suite using `bun test` |
| `package.json` | Package metadata, scripts, peer/dev dependencies |
| `tsconfig.json` | Strict TypeScript config, ESM output |
| `oxlint.json` | Strict oxlint rules |
| `.gitignore` | Standard Node/TS ignores |
| `LICENSE.md` | MIT license |
| `README.md` | Usage docs |
| `.github/workflows/tests.yml` | CI: lint + typecheck + test |

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

- [ ] **Step 1: Initialize bun project and install dependencies**

```bash
cd /Users/fridzema/workspace/faker-quotes-js
bun init -y
```

Then replace the generated `package.json` with:

```json
{
  "name": "@fridzema/faker-quotes",
  "version": "0.1.0",
  "description": "A custom Faker provider for generating quotes. TypeScript port of fridzema/faker-quotes.",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "test": "bun test",
    "lint": "oxlint",
    "typecheck": "tsc --noEmit"
  },
  "peerDependencies": {
    "@faker-js/faker": "^9.0.0"
  },
  "devDependencies": {},
  "keywords": [
    "faker",
    "quotes",
    "testing",
    "mock",
    "data"
  ],
  "author": "fridzema",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/fridzema/faker-quotes-js"
  }
}
```

- [ ] **Step 2: Install dev dependencies**

```bash
bun add -d @faker-js/faker oxlint typescript @types/bun
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
dist/
*.tgz
.DS_Store
```

- [ ] **Step 5: Verify setup compiles**

```bash
bunx tsc --noEmit
```

Expected: no errors (no source files yet, clean exit).

- [ ] **Step 6: Commit**

```bash
git add package.json tsconfig.json .gitignore bun.lock
git commit -m "chore: scaffold project with bun, typescript, oxlint"
```

---

### Task 2: Types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Create types file**

```typescript
export type Category = 'inspirational' | 'funny' | 'programming' | 'dad';

export interface Quote {
  quote: string;
  author: string;
  category: Category;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add Quote and Category types"
```

---

### Task 3: Data Files

**Files:**
- Create: `src/data/funny.ts`
- Create: `src/data/programming.ts`
- Create: `src/data/dad.ts`
- Create: `src/data/inspirational.ts`
- Create: `src/data/index.ts`

The data must be ported from the PHP source files at `../faker-quotes/src/Data/`. Each PHP file returns an array of `['quote' => '...', 'author' => '...']` entries. Convert to TypeScript arrays of `{ quote: string; author: string }`.

**Important:** The `inspirational.php` file contains significant duplication (the same "Success is..." quotes repeat many times after line ~210). Deduplicate by quote text when porting.

- [ ] **Step 1: Create a conversion script to port PHP data to TS**

Create a temporary `scripts/convert-data.ts` file:

```typescript
import { readFileSync, writeFileSync } from 'node:fs';

const categories = ['funny', 'programming', 'dad', 'inspirational'] as const;

for (const category of categories) {
  const phpContent = readFileSync(`../faker-quotes/src/Data/${category}.php`, 'utf-8');

  const entries: { quote: string; author: string }[] = [];
  const seen = new Set<string>();

  const regex = /'quote'\s*=>\s*'((?:[^'\\]|\\.)*)'\s*,\s*'author'\s*=>\s*'((?:[^'\\]|\\.)*)'/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(phpContent)) !== null) {
    const quote = match[1].replace(/\\'/g, "'");
    const author = match[2].replace(/\\'/g, "'");

    if (!seen.has(quote)) {
      seen.add(quote);
      entries.push({ quote, author });
    }
  }

  const lines = entries.map(
    (e) => `  { quote: ${JSON.stringify(e.quote)}, author: ${JSON.stringify(e.author)} },`
  );

  const tsContent = `import type { Quote } from '../types';

export const ${category}: Omit<Quote, 'category'>[] = [
${lines.join('\n')}
];
`;

  writeFileSync(`src/data/${category}.ts`, tsContent);
  console.log(`${category}: ${entries.length} quotes (deduplicated)`);
}
```

- [ ] **Step 2: Create data directory and run conversion**

```bash
mkdir -p src/data
bun run scripts/convert-data.ts
```

Expected output showing quote counts per category. The inspirational count should be significantly less than the raw PHP file line count due to deduplication.

- [ ] **Step 3: Create the barrel export `src/data/index.ts`**

```typescript
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
```

- [ ] **Step 4: Verify it compiles**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Remove conversion script and commit**

```bash
rm -rf scripts/
git add src/data/
git commit -m "feat: add quote data files ported from PHP source"
```

---

### Task 4: QuoteProvider — Test First

**Files:**
- Create: `tests/quote-provider.test.ts`

- [ ] **Step 1: Write the full test suite**

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
bun test
```

Expected: FAIL — `Cannot find module '../src/quote-provider'`

- [ ] **Step 3: Commit failing tests**

```bash
git add tests/quote-provider.test.ts
git commit -m "test: add QuoteProvider test suite (red)"
```

---

### Task 5: QuoteProvider — Implementation

**Files:**
- Create: `src/quote-provider.ts`
- Create: `src/index.ts`

- [ ] **Step 1: Implement QuoteProvider class**

```typescript
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
```

- [ ] **Step 2: Create the package entry point `src/index.ts`**

```typescript
export { QuoteProvider } from './quote-provider';
export type { Category, Quote } from './types';
```

- [ ] **Step 3: Run tests to verify they pass**

```bash
bun test
```

Expected: all tests PASS.

- [ ] **Step 4: Run typecheck**

```bash
bunx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/quote-provider.ts src/index.ts
git commit -m "feat: implement QuoteProvider class"
```

---

### Task 6: oxlint Configuration

**Files:**
- Create: `oxlint.json`

- [ ] **Step 1: Create oxlint.json**

```json
{
  "$schema": "https://raw.githubusercontent.com/oxc-project/oxc/main/npm/oxlint/configuration_schema.json",
  "plugins": ["typescript"],
  "categories": {
    "correctness": "error",
    "suspicious": "error",
    "pedantic": "warn",
    "style": "warn"
  },
  "rules": {
    "no-unused-vars": "error",
    "no-console": "off"
  },
  "ignorePatterns": ["dist/", "node_modules/", "scripts/"]
}
```

- [ ] **Step 2: Run oxlint and fix any issues**

```bash
bunx oxlint
```

Expected: clean pass or minor warnings. Fix any errors that come up in `src/` files.

- [ ] **Step 3: Commit**

```bash
git add oxlint.json
git commit -m "chore: add oxlint config with strict rules"
```

---

### Task 7: Build Verification

**Files:**
- Modify: `package.json` (verify build script works)

- [ ] **Step 1: Run a full build**

```bash
bun run build
```

Expected: `dist/` directory created with `.js` and `.d.ts` files.

- [ ] **Step 2: Verify dist output structure**

```bash
ls -la dist/
ls -la dist/data/
```

Expected: `index.js`, `index.d.ts`, `quote-provider.js`, `quote-provider.d.ts`, `types.js`, `types.d.ts`, and `data/` subdirectory with all data files compiled.

- [ ] **Step 3: Verify the package can be imported**

```bash
bun -e "import { QuoteProvider } from './dist/index.js'; const q = new QuoteProvider(); console.log(q.quote());"
```

Expected: prints a random quote object like `{ quote: '...', author: '...', category: '...' }`.

- [ ] **Step 4: Commit (dist is gitignored, nothing to commit — just verify)**

No commit needed. The `.gitignore` already excludes `dist/`.

---

### Task 8: LICENSE and README

**Files:**
- Create: `LICENSE.md`
- Create: `README.md`

- [ ] **Step 1: Create LICENSE.md**

```markdown
The MIT License (MIT)
=====================

Copyright (c) 2026 fridzema

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
```

- [ ] **Step 2: Create README.md**

```markdown
# @fridzema/faker-quotes

A custom Faker provider for generating quotes. TypeScript port of [fridzema/faker-quotes](https://github.com/fridzema/faker-quotes).

Includes quotes across 4 categories: inspirational, funny, programming, and dad jokes.

## Installation

```bash
bun add -d @fridzema/faker-quotes
```

Or with npm/pnpm:

```bash
npm install -D @fridzema/faker-quotes
pnpm add -D @fridzema/faker-quotes
```

Requires `@faker-js/faker` as a peer dependency:

```bash
bun add -d @faker-js/faker
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

```typescript
import { faker } from '@faker-js/faker';
import { QuoteProvider } from '@fridzema/faker-quotes';

faker.seed(123);
const quotes = new QuoteProvider(faker);
quotes.funny(); // deterministic output
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
```

- [ ] **Step 3: Commit**

```bash
git add LICENSE.md README.md
git commit -m "docs: add LICENSE and README"
```

---

### Task 9: GitHub Actions CI

**Files:**
- Create: `.github/workflows/tests.yml`

- [ ] **Step 1: Create CI workflow**

```yaml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22, 24]

    name: Node ${{ matrix.node-version }}

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2

      - name: Install dependencies
        run: bun install

      - name: Lint
        run: bun run lint

      - name: Typecheck
        run: bun run typecheck

      - name: Test
        run: bun test

      - name: Build
        run: bun run build
```

- [ ] **Step 2: Commit**

```bash
mkdir -p .github/workflows
git add .github/workflows/tests.yml
git commit -m "ci: add GitHub Actions test workflow"
```

---

### Task 10: Final Verification

- [ ] **Step 1: Run full pipeline locally**

```bash
bun run lint && bun run typecheck && bun test && bun run build
```

Expected: all steps pass with zero errors.

- [ ] **Step 2: Verify package contents**

```bash
bun pack --dry-run
```

Expected: only `dist/` files and `package.json`, `LICENSE.md`, `README.md` are included.

- [ ] **Step 3: Final commit if any fixes were needed**

```bash
git status
```

If clean, no commit needed. Otherwise commit any final fixes.
