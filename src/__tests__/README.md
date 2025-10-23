# Battleship Game Test Suite

This directory contains comprehensive unit tests for all modules in the Battleship game.

## Test Coverage

### Core Modules
- **constants.test.js** - Tests for game constants, ship definitions, and configuration
- **ship.test.js** - Tests for Ship class including hit tracking and sinking logic
- **board.test.js** - Tests for Board class including placement, attacks, and coordinate management
- **ai-controller.test.js** - Tests for AI targeting logic and hunt/target strategy
- **ui-controller.test.js** - Tests for UI rendering and DOM manipulation
- **game.test.js** - Tests for main game controller and game flow

## Running Tests

```bash
# Install dependencies (Jest)
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

Each test file follows a consistent structure:
- **Unit tests** for individual methods and functions
- **Integration tests** for component interactions
- **Edge case tests** for boundary conditions and error handling

## Test Coverage Goals

The test suite aims for:
- High code coverage (>90%)
- Comprehensive edge case testing
- Clear, descriptive test names
- Proper mocking of dependencies
- Fast execution times

## Notes

- Tests use Jest with ES modules support
- DOM manipulation is tested with jsdom environment
- Mocks are created for UI controllers to isolate game logic
- Random behavior is tested probabilistically