# Contributing to Apple Books Export

Thank you for considering contributing! Here's how you can help:

## Development Setup

1. **Prerequisites:**
   - macOS (required for Apple Books database access)
   - Bun runtime: `curl -fsSL https://bun.sh/install | bash`
   - Node.js 18+ (for testing compatibility)

2. **Clone and Install:**
   ```bash
   git clone https://github.com/denya/apple-books-export.git
   cd apple-books-export
   bun install
   ```

3. **Run Tests:**
   ```bash
   bun run test
   ```

4. **Build:**
   ```bash
   bun run build
   ```

## Making Changes

1. Create a new branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Add tests for new functionality
4. Run linter: `bun run lint`
5. Run tests: `bun run test:run`
6. Ensure code is formatted: `bun run format`
7. Commit with clear messages
8. Push and create a PR

## Code Style

- Use TypeScript with strict mode enabled
- Follow existing code patterns and conventions
- Add JSDoc comments for exported functions
- Keep functions small and focused
- Use meaningful variable and function names

## Testing

- Add tests for all new features in `src/__tests__/`
- Aim to maintain >80% code coverage
- Test both Bun and Node.js runtimes when applicable
- Use descriptive test names that explain what is being tested

## Development Scripts

- `bun run dev` - Run the CLI in development mode
- `bun run build` - Build the TypeScript project
- `bun run test` - Run tests in watch mode
- `bun run test:run` - Run tests once
- `bun run test:coverage` - Run tests with coverage report
- `bun run lint` - Run ESLint
- `bun run lint:fix` - Run ESLint and auto-fix issues
- `bun run format` - Format code with Prettier
- `bun run type-check` - Type-check without building

## Pull Request Process

1. Update CHANGELOG.md with your changes under the "Unreleased" section
2. Ensure all tests pass (`bun run test:run`)
3. Ensure linting passes (`bun run lint`)
4. Ensure code is formatted (`bun run format:check`)
5. Update documentation if needed (README.md)
6. Submit your PR with a clear description of the changes
7. Wait for review and address feedback

## Commit Message Guidelines

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests when relevant

Examples:
- `Add CSV export with proper escaping`
- `Fix color filter not applying to bookmarks`
- `Update README with new CLI options`

## Reporting Bugs

When reporting bugs, please include:

1. Your macOS version
2. Node.js/Bun version (`node --version`, `bun --version`)
3. Package version (`bunx apple-books-export --version` or from package.json)
4. Steps to reproduce the issue
5. Expected behavior vs actual behavior
6. Any error messages or logs

## Suggesting Features

We welcome feature suggestions! Please:

1. Check if the feature has already been requested in Issues
2. Clearly describe the feature and its use case
3. Explain why this would be valuable to users
4. Consider if it fits within the project's scope

## Code of Conduct

Please be respectful and considerate in all interactions. We're all here to learn and improve this tool together.

## Questions?

Feel free to open an issue with the "question" label if you need help or clarification.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
