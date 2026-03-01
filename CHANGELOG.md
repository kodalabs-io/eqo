# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-02-28

### Added
- Initial implementation of RGAA v4.1.2 static analysis (Themes 1, 2, 5, 6, 8, 9, 11)
- Runtime analysis via Playwright + axe-core with RGAA mapping
- Output formats: JSON, HTML, SARIF, Markdown, JUnit
- i18n support: `en-US` (default) and `fr-FR`
- CLI commands: `analyze`, `init`
- GitHub Action (`@kodalabs-io/eqo`)
- Programmatic API (`import { analyze } from "@kodalabs-io/eqo"`)
- `threshold: 0` disables CI blocking while still generating the report
- Piscina worker pool for parallel static file analysis

[1.0.0]: https://github.com/kodalabs-io/eqo/releases/tag/v1.0.0
