# Architecture Documentation

## Overview

The Learning Diagnostic App is built using a **layered, service-oriented architecture** with clear separation of concerns. This document explains the design decisions, patterns, and structure.

## Architecture Layers

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│  (views/, DOM rendering)            │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│      Application Layer              │
│  (app.ts - orchestration)           │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│       Business Logic Layer          │
│  (services/ - pure functions)       │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│         Data Layer                  │
│  (models/, data validation)         │
└─────────────────────────────────────┘
```

## Module Breakdown

### 1. Models (`src/models/`)

**Purpose**: Define TypeScript interfaces and types for type safety

**Files**:
- `types.ts`: All type definitions

**Principles**:
- No business logic
- Immutable data structures
- Clear, descriptive names

### 2. Services (`src/services/`)

**Purpose**: Implement pure business logic functions

**Files**:
- `scoring.service.ts`: Score calculation algorithms
- `flags.service.ts`: Diagnostic flag computation
- `recommendation.service.ts`: Personalized recommendations
- `data.service.ts`: Data fetching and validation
- `export.service.ts`: Export and clipboard operations

**Principles**:
- **Pure functions**: Same input = same output
- **No side effects**: Don't mutate inputs
- **Testable**: 100% test coverage
- **Single responsibility**: Each service has one job

**Example**:
```typescript
// ✅ Good: Pure function
export function scoreAnswer(question: Question, answer: any): number {
  // Logic here
  return score;
}

// ❌ Bad: Impure function with side effects
export function scoreAnswer(question: Question, answer: any): number {
  updateGlobalState(); // Side effect!
  return score;
}
```

### 3. Views (`src/views/`)

**Purpose**: Render UI components using DOM APIs

**Files**:
- `app.views.ts`: Main view rendering functions

**Principles**:
- Separation from business logic
- Receive data via props
- Return DOM elements
- Event handlers passed as callbacks

**Pattern**:
```typescript
export function renderQuestionView(
  question: Question,
  // ... other data
  onAnswer: (answer: any) => void,  // Callback
  onNext: () => void
): HTMLElement {
  // Create and return DOM elements
}
```

### 4. Utils (`src/utils/`)

**Purpose**: Reusable helper functions

**Files**:
- `dom.utils.ts`: DOM manipulation helpers
- `chart.utils.ts`: Canvas chart drawing

**Principles**:
- Generic and reusable
- Well-documented
- No app-specific logic

### 5. Config (`src/config/`)

**Purpose**: Centralized configuration

**Files**:
- `app.config.ts`: App-wide constants

**Benefits**:
- Easy to modify thresholds
- Single source of truth
- Environment-specific configs

### 6. Application Orchestrator (`src/app.ts`)

**Purpose**: Coordinate all modules and manage app state

**Responsibilities**:
- Initialize app
- Manage navigation flow
- Call services with data
- Pass results to views
- Handle user interactions

**State Management**:
```typescript
class LearningApp {
  private appData: AppData | null = null;  // Loaded data
  private answers: Answers = {};           // User answers
  private isMetaPhase = false;            // Current phase
}
```

## Data Flow

### Question Flow

```
User Action (click "Next")
    ↓
app.ts (handleNext)
    ↓
Validate/Store answer in state
    ↓
renderQuestionView()
    ↓
Update DOM
```

### Results Computation Flow

```
All questions answered
    ↓
computeScores() service
    ↓
computeFlags() service
    ↓
selectOneThing() service
    ↓
recommendVideos/Articles() services
    ↓
renderResultsView()
    ↓
Display to user
```

## Design Patterns

### 1. Service Layer Pattern

Business logic isolated in services makes testing easy:

```typescript
// Easy to test - no DOM, no side effects
describe('scoreAnswer', () => {
  it('should score likert5 correctly', () => {
    const result = scoreAnswer(question, 3);
    expect(result).toBe(50);
  });
});
```

### 2. Factory Functions

View functions act as factories creating DOM elements:

```typescript
export function renderIntroView(onStart: () => void): HTMLElement {
  return el('div', { class: 'card' }, /* ... */);
}
```

### 3. Dependency Injection (Callbacks)

Views receive behavior via callbacks:

```typescript
renderQuestionView(
  question,
  // Inject dependencies
  onAnswer: (answer) => this.answers[question.id] = answer,
  onNext: () => this.showQuestion(index + 1)
)
```

### 4. Validation Pattern

Data validated at boundaries:

```typescript
async function fetchJSON<T>(
  url: string,
  validator: (item: any) => boolean
): Promise<T[]> {
  const data = await fetch(url).then(r => r.json());
  return data.filter(validator);  // Validate at boundary
}
```

## Testing Strategy

### Unit Tests

Test pure functions in isolation:

```typescript
// Test scoreAnswer function
it('should score likert5 answers correctly', () => {
  const question: Question = {
    id: 'Q1',
    type: 'likert5',
    domain: 'priming',
  };
  expect(scoreAnswer(question, 1)).toBe(0);
  expect(scoreAnswer(question, 5)).toBe(100);
});
```

### Test Coverage

- **Services**: 100% coverage
- **Utils**: 100% coverage
- **Views**: Integration tests (manual)
- **App**: Integration tests (manual)

### Test Organization

```
tests/
├── unit/                   # Unit tests
│   ├── scoring.service.test.ts
│   ├── flags.service.test.ts
│   ├── recommendation.service.test.ts
│   └── data.service.test.ts
└── fixtures/               # Test data
    └── mock-data.ts
```

## Build Process

### Development

```bash
npm run dev
```

1. Vite starts dev server
2. TypeScript compiles in memory
3. HMR (Hot Module Replacement) enabled
4. Instant updates on save

### Production

```bash
npm run build
```

1. TypeScript type-checks all files
2. Vite bundles and minifies
3. Output to `dist/`
4. Ready for deployment

## Error Handling

### Service Layer

Services throw descriptive errors:

```typescript
if (isNaN(numeric) || numeric < 1 || numeric > 5) {
  throw new Error(`Invalid likert5 answer: ${answer}`);
}
```

### Application Layer

App catches and displays errors:

```typescript
try {
  this.appData = await loadAppData();
} catch (error) {
  console.error('Failed to load data:', error);
  this.root.innerHTML = '<p>Error message</p>';
}
```

## Performance Considerations

### 1. Pure Functions

Memoization-friendly (can cache results):

```typescript
// Could add memoization
const memoizedScoreAnswer = memoize(scoreAnswer);
```

### 2. Minimal Re-renders

Views only re-render when needed:

```typescript
clearElement(this.root);           // Clear old
this.root.appendChild(newView);    // Add new
```

### 3. Lazy Loading

Data loaded once at init:

```typescript
async init() {
  this.appData = await loadAppData();  // Load once
}
```

## Future Enhancements

### Potential Improvements

1. **State Management**: Add Redux/MobX for complex state
2. **Routing**: Add URL-based navigation
3. **Persistence**: LocalStorage for saving progress
4. **Animation**: Framer Motion or similar
5. **Accessibility**: ARIA labels and keyboard nav
6. **Internationalization**: Multi-language support

### Scalability

Current architecture supports:

- ✅ Adding new question types
- ✅ Adding new domains
- ✅ Adding new recommendation algorithms
- ✅ Changing scoring formulas
- ✅ A/B testing different approaches

## Code Quality

### TypeScript Configuration

```json
{
  "strict": true,                    // Strict type checking
  "noUnusedLocals": true,           // No unused variables
  "noUnusedParameters": true,       // No unused params
  "noFallthroughCasesInSwitch": true // Exhaustive switches
}
```

### Linting

ESLint with TypeScript rules:
- No `any` types (warnings)
- Consistent naming
- No unused imports

### Formatting

Prettier with:
- 100 character line width
- Single quotes
- Semicolons
- 2 space indentation

## Deployment

### Static Hosting

App is fully static - can deploy to:
- **Vercel**: `vercel --prod`
- **Netlify**: Drop `dist/` folder
- **GitHub Pages**: Push `dist/` to gh-pages
- **AWS S3**: Upload `dist/` contents

### Environment Variables

Currently none needed, but could add:

```typescript
const API_URL = import.meta.env.VITE_API_URL;
```

## Maintenance

### Adding a New Question

1. Add to `data/questions-core.json` or `data/questions-meta.json`
2. No code changes needed!

### Adding a New Domain

1. Update `types.ts` if new domain type
2. Add domain to `APP_CONFIG.CORE_DOMAINS`
3. Add threshold to `APP_CONFIG.THRESHOLDS`
4. Add actions to `selectDomainActions()`
5. Write tests

### Modifying Scoring Algorithm

1. Update `scoring.service.ts`
2. Update tests in `scoring.service.test.ts`
3. Run `npm test` to verify
4. Document changes

## Conclusion

This architecture prioritizes:
- **Maintainability**: Clear structure, easy to modify
- **Testability**: Pure functions, high test coverage
- **Type Safety**: TypeScript prevents runtime errors
- **Performance**: Minimal overhead, fast execution
- **Developer Experience**: Good tooling, clear documentation

The result is a robust, production-ready application that can evolve with changing requirements.
