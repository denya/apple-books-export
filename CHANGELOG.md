# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- TypeScript strict mode with `noUncheckedIndexedAccess` and `noImplicitOverride`
- Comprehensive test suite with Vitest
- ESLint and Prettier configuration for code quality
- GitHub Actions CI/CD pipeline
- CONTRIBUTING.md with development guidelines
- CODE_OF_CONDUCT.md using Contributor Covenant
- SECURITY.md with security reporting policy
- GitHub issue and PR templates

### Changed
- Improved error handling in all exporters
- Added input validation for colors and output paths

## [1.0.1] - 2026-01-27

### Fixed
- Fixed "require is not defined" error in ESM package by converting CommonJS imports to ESM
- Fixed .gitignore to properly track package.json and tsconfig.json

### Added
- Repository, homepage, and bugs URLs to package.json
- npm badges to README

## [1.0.0] - 2026-01-27

### Added
- Initial release
- HTML export with searchable interface
- Markdown export (single or multi-file)
- JSON export (single or multi-file)
- CSV export
- Support for highlight colors filtering
- Highlights-only mode
- Support for custom database paths
- Comprehensive README with examples and troubleshooting
