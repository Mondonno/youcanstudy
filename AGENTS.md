# Agent Guidelines

## Code Editing Rules

- **Do not edit JavaScript (.js) files.** All code modifications must be made to TypeScript (.ts) files only.
  - **Why?** Editing JavaScript files directly bypasses TypeScript's static type checking and compilation process. TypeScript provides compile-time error detection, better IDE support, and improved code maintainability. Changes made to JS files won't be reflected in the source TS files, leading to inconsistencies and potential loss of type safety. Always modify the TypeScript source files and let the build process generate the corresponding JavaScript files.
- Use TypeScript files exclusively for new code and updates.
- Ensure all changes compile successfully using the project's TypeScript configuration.
- Follow clean code practices:
  - Use meaningful variable and function names
  - Keep functions small and focused on a single responsibility
  - Add comments for complex logic
  - Maintain consistent code formatting
  - Write unit tests for new functionality
  - Avoid code duplication
  - Use appropriate design patterns where applicable