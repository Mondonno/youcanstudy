# Quick Test Guide

## Run All Tests

### 1. Unit Tests (Fast - ~1 second)
```bash
npm test -- --run
```

**What it tests:**
- ✅ Scoring calculations (including encoding fix)
- ✅ Data loading and validation
- ✅ Flag detection logic
- ✅ Recommendation algorithms

**Expected output:**
```
✓ tests/unit/encoding-fix.test.ts (14)
✓ tests/unit/data.service.test.ts (14)
✓ tests/unit/flags.service.test.ts (15)
✓ tests/unit/recommendation.service.test.ts (22)
✓ tests/unit/scoring.service.test.ts (16)

Test Files  5 passed (5)
Tests  81 passed (81)
```

### 2. E2E Tests (Slower - ~30 seconds)
```bash
npm run test:e2e
```

**What it tests:**
- ✅ Complete quiz flow (39 questions)
- ✅ Score display (encoding NOT 0!)
- ✅ PDF/JSON export with modal
- ✅ History save/load/import
- ✅ All user interactions

**Expected output:**
```
✓ tests/e2e/quiz-flow.spec.ts (6)
✓ tests/e2e/scoring.spec.ts (5)
✓ tests/e2e/export.spec.ts (6)
✓ tests/e2e/history.spec.ts (11)

Test Files  4 passed (4)
Tests  28 passed (28)
```

## Interactive Testing

### Watch Mode (Unit Tests)
```bash
npm test
```
Auto-reruns tests when you save files.

### Playwright UI (E2E Tests)
```bash
npm run test:e2e:ui
```
Opens interactive browser to step through tests visually.

## Verify the Bug Fixes

### Test Encoding Score Fix
```bash
npm test -- encoding-fix --run
```

Should show:
```
✓ should not return 0 for encoding when questions are answered
✓ should verify encoding is in APP_CONFIG.CORE_DOMAINS
```

### Test in Browser (Manual)
```bash
npm run dev
```

Then:
1. Visit http://localhost:5173
2. Complete the quiz
3. Check results page - **Encoding score should NOT be 0**
4. Click "Export Results" - Modal should appear with PDF/JSON options
5. Export as JSON - Should be importable via History

## Troubleshooting

### E2E tests fail to start
**Problem:** Dev server port already in use

**Solution:**
```bash
# Kill existing dev server
lsof -ti:5173 | xargs kill -9

# Then run tests again
npm run test:e2e
```

### Tests pass but encoding still 0 in browser
**Problem:** Need to rebuild

**Solution:**
```bash
# Clear and rebuild
npm run clean
npm run build
npm run dev
```

### Import paths error
**Problem:** TypeScript can't find modules

**Solution:**
```bash
# Check type compilation
npm run type-check

# If errors, check tsconfig.json paths
```

## Quick Verification Checklist

After pulling these changes, verify:

- [ ] Unit tests pass: `npm test -- --run`
- [ ] Type check passes: `npm run type-check`
- [ ] Dev server starts: `npm run dev`
- [ ] Quiz loads without errors
- [ ] All 5 domains show scores (including encoding)
- [ ] Export button shows modal with 2 options
- [ ] E2E tests pass: `npm run test:e2e`

## CI/CD Setup

Add to your GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      
      # Unit tests
      - run: npm test -- --run
      
      # E2E tests
      - run: npx playwright install --with-deps chromium
      - run: npm run test:e2e
      
      # Upload artifacts on failure
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: test-results
          path: |
            playwright-report/
            test-results/
```

## Performance Benchmarks

### Unit Tests
- **Duration:** ~1 second
- **Files:** 5 test files
- **Tests:** 81 tests

### E2E Tests
- **Duration:** ~30-60 seconds (includes browser startup)
- **Files:** 4 test files
- **Tests:** 28 tests
- **Browser:** Chromium headless

### Total Test Suite
- **Duration:** ~90 seconds
- **Coverage:** Core logic + Critical user paths
- **Confidence:** High (all bugs validated)
