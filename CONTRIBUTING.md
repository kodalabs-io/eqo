# Contributing to @kodalabs-io/eqo

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

This project follows the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Development Setup

### Prerequisites

- Node.js >= 22
- pnpm >= 10 (`npm install -g pnpm`)
- Playwright browsers (`pnpm exec playwright install chromium`)

### Getting started

```bash
git clone https://github.com/kodalabs-io/eqo.git
cd eqo
pnpm install
pnpm build
pnpm test
```

### Workflow

```bash
pnpm dev          # Watch mode — rebuilds on file change
pnpm test:watch   # Tests in watch mode
pnpm lint         # Biome linter + formatter check
pnpm lint:fix     # Auto-fix lint issues
pnpm typecheck    # TypeScript type checking
```

## Project Structure

```
src/
├── analyzer/
│   ├── static/         # AST-based rules (@babel/parser)
│   │   └── rules/      # One file per RGAA theme
│   ├── runtime/        # Playwright + axe-core rules
│   └── mapper/         # axe-core → RGAA criterion mapping
├── criteria/           # RGAA 4.1.2 catalog (all 106 criteria)
├── i18n/               # Translations (en-US, fr-FR)
├── config/             # Zod schema + config loader
├── reporter/           # Output formatters
└── cli/                # Commander commands
```

## 🚀 Roadmap: The Path to 100% Automation (AI)

Currently, **eqo** automates ~65% of RGAA criteria. The remaining 35% require human judgment (relevance of alternatives, video transcriptions, etc.).

We are exploring **Vision LLMs** to bridge this gap in **v2**. If you have experience with:
- AI-driven accessibility testing
- Vision models for image description validation
- Automatic contrast analysis in complex dynamic layouts

Please reach out via GitHub Issues or our [Discord/Website].

## How to Add a New Static Rule

1. Identify the RGAA criterion (e.g., `1.1`, `11.1`)
2. Add or edit the corresponding file in `src/analyzer/static/rules/`
3. Implement the `StaticRule` interface:

```typescript
export const myRule: StaticRule = {
  id: "theme/rule-name",
  criteria: ["X.Y"],
  check({ filePath, source }) {
    const ast = parseFile(source, filePath);
    if (!ast) return [];
    const issues: RGAAIssue[] = [];
    // Walk AST, detect violations, push issues
    return issues;
  },
};
```

4. Export it from the rules `index.ts`
5. Add i18n keys to **both** `src/i18n/en-US.ts` and `src/i18n/fr-FR.ts`
6. Write tests in `tests/static/`

## How to Add a New Locale

1. Create `src/i18n/<locale>.ts` implementing the `Translations` interface
2. Register the loader in `src/i18n/index.ts`
3. Update the `SupportedLocale` type in `src/types.ts`

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add rule for criterion 9.4 (quotations)
fix: correct false positive in form label detection
docs: update README with fr-FR locale example
test: add coverage for empty button detection
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `ci`, `chore`

## Pull Request Guidelines

- All code must be in **English** (variable names, comments, types, tests)
- All new i18n keys must be added in **both** `en-US.ts` and `fr-FR.ts`
- Tests are required for new rules
- `pnpm lint`, `pnpm typecheck`, and `pnpm test` must pass
- Keep PRs focused — one feature or fix per PR

## Reporting a RGAA Mapping Error

If you believe a rule incorrectly maps to a RGAA criterion, or an axe-core rule is mis-mapped, please open an issue with:
- The rule ID
- The RGAA criterion
- The WCAG reference
- The expected behavior

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
