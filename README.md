<div align="center">
  <a href="https://kodalabs-io.github.io/eqo">
    <img src="https://raw.githubusercontent.com/kodalabs-io/eqo/main/docs/public/banner.png" alt="eqo - RGAA accessibility engine" width="100%" style="max-width: 800px;">
  </a>

  <h1>eqo</h1>

  <p><strong>RGAA v4.1.2 accessibility compliance analyzer for NextJS projects.</strong></p>

  <a href="https://kodalabs-io.github.io/eqo">
    <img alt="Documentation" src="https://img.shields.io/badge/DOCUMENTATION-Check%20it-000?style=for-the-badge&logo=gitbook&labelColor=31c553">
  </a>
  <a href="https://www.npmjs.com/package/@kodalabs-io/eqo">
    <img alt="NPM version" src="https://img.shields.io/npm/v/@kodalabs-io/eqo?style=for-the-badge&labelColor=000000&color=cb3837">
  </a>
  <a href="LICENSE">
    <img alt="License" src="https://img.shields.io/badge/LICENSE-MIT-000?style=for-the-badge&labelColor=000000&color=4488ff">
  </a>
  <a href="https://github.com/kodalabs-io/eqo/actions">
    <img alt="CI Status" src="https://img.shields.io/github/check-runs/kodalabs-io/eqo/main?style=for-the-badge&logo=github&labelColor=000000">
  </a>

  <br />
  <br />
</div>

Audit your Next.js source code and rendered pages against all 106 [RGAA v4.1.2](https://accessibilite.numerique.gouv.fr/) criteria (aligned with WCAG 2.1 A/AA). Automate ~65% of the criteria, generate reports in 5 formats, block CI on regressions, and feed your legal accessibility declaration — without false promises about what automation can and cannot do.

**[→ Full documentation](https://kodalabs-io.github.io/eqo)**

---

## Features

- **106 RGAA v4.1.2 criteria** — complete catalog, automation level stated per criterion
- **Two-phase analysis** — Babel AST static analysis + Playwright runtime (real Chromium)
- **5 output formats** — JSON, HTML, SARIF (GitHub Code Scanning), Markdown, JUnit
- **CI/CD native** — configurable threshold, exit code 1 on failure, inline PR annotations
- **Honest by design** — `needs-review` criteria are clearly marked, never inflated
- **GitHub Action** included
- **i18n** — `en-US` (default) and `fr-FR`

---

## Installation

```bash
pnpm add -D @kodalabs-io/eqo
# npm install -D @kodalabs-io/eqo
# bun add -D @kodalabs-io/eqo
```

For runtime analysis (browser), install the Playwright peer dependencies:

```bash
pnpm add -D playwright @axe-core/playwright axe-core
pnpm exec playwright install chromium
```

> **No browser?** Start with `--static-only`. Themes 1, 2, 5, 6, 8, 9, 11 — no Playwright needed.

---

## Quick Start

### 1. Initialize

```bash
pnpm eqo init   # npx eqo init  ·  bunx eqo init
```

Creates `rgaa.config.ts` in your project root.

### 2. Configure

```typescript
// rgaa.config.ts
import { defineConfig } from "@kodalabs-io/eqo";

export default defineConfig({
  baseUrl: "http://localhost:3000",
  projectName: "my-app",
  locale: "fr-FR",

  pages: [
    { path: "/",              name: "Home" },
    { path: "/contact",       name: "Contact" },
    { path: "/accessibilite", name: "Accessibility" },
  ],

  output: [
    { format: "json",     path: "./public/rgaa-report.json" },
    { format: "sarif",    path: "./reports/rgaa.sarif" },
    { format: "markdown", path: "./reports/rgaa.md" },
  ],

  thresholds: {
    complianceRate: 0,    // 0 = never block CI. Set to 80 to enforce a threshold.
    failOn: "threshold",
  },
});
```

### 3. Run

```bash
npx eqo analyze               # Full audit: static + browser
npx eqo analyze --static-only # No browser — runs in seconds
npx eqo analyze --threshold 80 # Override threshold for a one-off check
```

---

## GitHub Actions

```yaml
name: Accessibility Audit
on:
  push:
    branches: [main]
  pull_request:

jobs:
  rgaa:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Start Next.js app
        run: |
          npm install && npm run build && npm start &
          npx wait-on http://localhost:3000

      - name: Run RGAA audit
        uses: kodalabs-io/eqo@v1
        with:
          threshold: 0        # 0 = report only, never blocks CI
          locale: fr-FR
          upload-sarif: true  # Adds inline annotations to your PR diff
```

> Set `threshold: 80` to fail the pipeline if compliance drops below 80%.

---

## Documentation

| | |
|---|---|
| [Introduction](https://kodalabs-io.github.io/eqo/introduction/) | RGAA law, who must comply, and Eqo's honest scope |
| [Getting Started](https://kodalabs-io.github.io/eqo/getting-started/) | Install, configure, and run your first audit in 5 minutes |
| [Configuration](https://kodalabs-io.github.io/eqo/configuration/) | Full `rgaa.config.ts` reference — every option explained |
| [Accessibility Page](https://kodalabs-io.github.io/eqo/guides/accessibility-page/) | Build your `/accessibilite` page in Next.js |
| [CI/CD Integration](https://kodalabs-io.github.io/eqo/guides/ci-cd/) | Blocking strategies, thresholds, PR comments |
| [CLI Reference](https://kodalabs-io.github.io/eqo/reference/cli/) | All `eqo` commands and flags |
| [API Reference](https://kodalabs-io.github.io/eqo/reference/api/) | Programmatic usage as a library |

---

## License

[MIT](LICENSE) — Copyright © 2026 Koda Labs
