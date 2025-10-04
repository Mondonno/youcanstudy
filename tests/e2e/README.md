# End-to-End Testing Guide

This directory contains comprehensive E2E tests for the YouCanStudy learning diagnostic application using Playwright.

## Test Files

### 1. `quiz-flow.spec.ts`
Tests the complete quiz flow from start to finish:
- ✅ Full quiz completion (39 questions)
- ✅ Question navigation (back/forward)
- ✅ Quiz cancellation
- ✅ Previous answer display on retake
- ✅ Different question types (likert5, ynm)

### 2. `scoring.spec.ts`
Tests scoring calculations, especially the **encoding domain bug fix**:
- ✅ Encoding score is calculated correctly (not always 0)
- ✅ All domain scores are present and valid (0-100)
- ✅ Overall score calculation
- ✅ Reverse-scored questions handling

### 3. `export.spec.ts`
Tests export functionality (PDF/JSON):
- ✅ Export modal display
- ✅ JSON export (importable format)
- ✅ PDF export (print preview)
- ✅ JSON import via history
- ✅ LLM prompt copy to clipboard

### 4. `history.spec.ts`
Tests history management:
- ✅ Automatic history saving
- ✅ History entry viewing
- ✅ Entry deletion
- ✅ Clear all history
- ✅ Export/import history
- ✅ Persistence across page refreshes

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run with UI (interactive mode)
```bash
npm run test:e2e:ui
```

### Run with debugging
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test tests/e2e/quiz-flow.spec.ts
```

### Run tests in headed mode (see the browser)
```bash
npx playwright test --headed
```

## Test Coverage

The E2E tests cover the most fragile parts of the codebase:

1. **Quiz State Management**: Ensures answers are properly tracked through all 39 questions
2. **Score Calculation**: Validates the encoding domain fix (was always 0, now calculated correctly)
3. **Local Storage**: Tests persistence and history management
4. **Export/Import**: Ensures data can be exported and re-imported correctly
5. **User Interactions**: Modal dialogs, button clicks, form inputs

## Bug Fixes Validated

### Encoding Score Always 0 Bug
**Problem**: The encoding domain score was always 0 because no questions had `domain: "encoding"`

**Fix**: Reassigned questions Q5, Q6, Q7, Q11, Q12 from `priming` to `encoding`

**Tests**: `scoring.spec.ts` validates that:
- Encoding score is now calculated correctly
- All domain scores are present in results
- Scores are properly saved to localStorage

### Export Format Inconsistency
**Problem**: JSON export wasn't compatible with history import

**Fix**: Changed export format to match `HistoryEntry` structure

**Tests**: `export.spec.ts` validates that:
- Exported JSON can be imported via history manager
- JSON structure matches expected format

## Configuration

Tests are configured in `playwright.config.ts`:
- Base URL: `http://localhost:5173`
- Browser: Chromium
- Auto-starts dev server before tests
- Screenshots on failure
- Trace on first retry

## Writing New Tests

Follow the existing patterns:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should do something specific', async ({ page }) => {
    // Arrange
    await page.getByRole('button', { name: /start/i }).click();
    
    // Act
    await page.getByRole('button', { name: /next/i }).click();
    
    // Assert
    await expect(page.getByText(/expected text/i)).toBeVisible();
  });
});
```

## Debugging Tips

1. **Use headed mode** to see what's happening:
   ```bash
   npx playwright test --headed --debug
   ```

2. **Pause in tests** using `await page.pause()`:
   ```typescript
   test('debug test', async ({ page }) => {
     await page.goto('/');
     await page.pause(); // Opens Playwright Inspector
   });
   ```

3. **Check screenshots** in `test-results/` folder after failures

4. **View HTML report** after test run:
   ```bash
   npx playwright show-report
   ```

## CI/CD Integration

To run E2E tests in CI:

```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps chromium

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Common Issues

### Port already in use
If port 5173 is busy, the dev server won't start. Kill the existing process:
```bash
lsof -ti:5173 | xargs kill -9
```

### Tests timing out
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  actionTimeout: 10000, // 10 seconds
}
```

### Flaky tests
Add explicit waits:
```typescript
await page.waitForLoadState('networkidle');
await expect(element).toBeVisible({ timeout: 10000 });
```
