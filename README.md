# Learning Diagnostic App

An evidence-based learning diagnostic tool that provides personalized study recommendations based on cognitive science principles. **Now powered by React** with full TypeScript support and comprehensive test coverage.

## ✨ Features

- **Interactive Quiz**: Evidence-based questions across 5 core learning domains
- **Personalized Reports**: Detailed score breakdowns with visual charts
- **History Management**: Track and compare quiz attempts over time
- **Import/Export**: Save, backup, and restore quiz history
- **Smart Recommendations**: Tailored videos and articles based on your learning profile
- **Visual Analytics**: Interactive charts showing domain strengths
- **React Components**: Modern, maintainable component architecture

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```
Visit: http://localhost:3000

### Production Build
```bash
npm run build
npm run preview
```
Visit: http://localhost:4173/youcanstudy/

### Deploy
Push to main branch - GitHub Actions automatically deploys to:
**https://mondonno.github.io/youcanstudy/**

## 🏗️ Architecture

The application uses a modern React architecture with TypeScript:

```
src/
├── components/          # React components (.tsx)
│   ├── App.tsx         # Main app with routing
│   ├── IntroView.tsx   # Welcome screen
│   ├── QuizView.tsx    # Quiz interface
│   ├── ResultsView.tsx # Results display
│   └── HistoryManager.tsx # History management
├── models/          # TypeScript interfaces and types
├── services/        # Pure business logic (testable)
│   ├── scoring.service.ts
│   ├── flags.service.ts
│   ├── recommendation.service.ts
│   ├── data.service.ts
│   ├── export.service.ts
│   └── history.service.ts
├── utils/           # Reusable utility functions
│   ├── dom.utils.ts
│   ├── chart.utils.ts
├── config/          # App configuration
└── main.tsx         # React entry point
```

### Key Principles

- **React Components**: Modern component-based architecture
- **Separation of Concerns**: Business logic separated from UI
- **Pure Functions**: Services use pure, testable functions
- **Type Safety**: Full TypeScript coverage with React types
- **Maintainability**: Clear module boundaries and documentation
- **Fast Development**: Vite HMR for instant updates

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once
npm test -- --run

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 📊 Learning Domains

The app assesses five core learning domains:

1. **Priming**: Pre-learning preparation and schema activation
2. **Encoding**: Deep processing and comprehension
3. **Reference**: Note-taking strategies and organization
4. **Retrieval**: Active recall and practice testing
5. **Overlearning**: Deliberate practice and mastery

## 🧪 Testing

Comprehensive test suite with **67 passing tests**:

- ✅ **Scoring Service**: 16 tests (answer scoring, domain computation, weighted averages)
- ✅ **Flags Service**: 15 tests (diagnostic flag detection)
- ✅ **Recommendation Service**: 22 tests (personalized recommendations)
- ✅ **Data Service**: 14 tests (validation and data loading)

Run `npm run test:coverage` to see detailed coverage reports.

## 📝 Development Scripts

```bash
npm run dev          # Start Vite dev server with HMR
npm run build        # Type-check and build for production
npm run preview      # Preview production build locally
npm run clean        # Remove compiled JS files
npm test             # Run tests in watch mode
npm run type-check   # Run TypeScript type checking
npm run lint         # Lint TypeScript files
npm run format       # Format code with Prettier
```

## 📚 Documentation

- **[QUICK_START.md](docs/guides/QUICK_START.md)** - Getting started guide
- **[REACT_MIGRATION.md](docs/migration/REACT_MIGRATION.md)** - React migration details
- **[FINAL_SUMMARY.md](docs/summaries/FINAL_SUMMARY.md)** - All fixes and resolved issues
- **[CLEANUP.md](docs/maintenance/CLEANUP.md)** - Repository cleanup notes

## 🔧 Configuration

### TypeScript

- Strict mode enabled
- ES2020 target
- Bundler module resolution
- Full DOM type definitions

### Testing

- **Framework**: Vitest
- **Environment**: jsdom
- **Coverage**: v8 provider
- **Globals**: Enabled for test utilities

### Build

- **Tool**: Vite 5 with React plugin
- **Output**: `dist/`
- **Dev Server**: Port 3000
- **Base Path**: `/youcanstudy/` (GitHub Pages)

## 🛠️ Tech Stack

- **React 19** - UI components with hooks
- **TypeScript 5.9** - Type safety
- **Vite 5** - Fast build tool and dev server
- **Vitest** - Unit testing framework
- **Canvas API** - Chart rendering
- **LocalStorage** - History persistence

## 📦 Project Structure

```
youcanstudy/
├── src/                    # Source code
│   ├── components/        # React components (.tsx)
│   ├── models/            # TypeScript types
│   ├── services/          # Business logic
│   ├── utils/             # Helper functions
│   ├── config/            # Configuration
│   └── main.tsx           # React entry point
├── tests/                  # Test files
│   ├── unit/              # Unit tests
│   └── fixtures/          # Test data
├── public/                 # Static assets
│   ├── data/              # JSON data files
│   └── styles.css         # Global CSS
├── index.html              # HTML entry (at root)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

## 🎯 Design Decisions

### Why React?

- **Component Reusability**: Easy to maintain and extend
- **Better State Management**: React hooks for clean state handling
- **Developer Experience**: Hot module replacement, better debugging
- **Type Safety**: Full TypeScript + React type integration
- **Future Ready**: Easy to add libraries and features

### Why This Architecture?

1. **Testability**: Pure functions in services are easy to test
2. **Maintainability**: Clear separation makes changes predictable
3. **Scalability**: Easy to add new features or domains
4. **Type Safety**: TypeScript catches errors at compile time
5. **Performance**: Vite provides fast builds and HMR

## 📈 Status

- ✅ **All features working**: Quiz, results, history management
- ✅ **No console errors**: Clean runtime
- ✅ **TypeScript strict mode passing**: Full type safety
- ✅ **Tests passing**: Service layer fully tested
- ✅ **Production ready**: Deployed to GitHub Pages
- ✅ **React 19**: Modern hooks and components

## 🤝 Contributing

### Adding New Features

1. Create types in `src/models/types.ts`
2. Add business logic in appropriate service
3. Write unit tests in `tests/unit/`
4. Update views if UI changes needed
5. Run `npm test` to verify all tests pass

### Code Style

- Use Prettier for formatting (`npm run format`)
- Follow ESLint rules (`npm run lint`)
- Write tests for all new functions
- Document public APIs with JSDoc

## 📚 API Documentation

### Scoring Service

```typescript
// Score an individual answer (0-100)
scoreAnswer(question: Question, answer: any): number

// Compute domain scores
computeScoresForQuestions(questions: Question[], answers: Answers): Scores

// Compute weighted overall score
computeOverallScore(scores: Scores): number
```

### Recommendation Service

```typescript
// Select primary focus area
selectOneThing(flags: string[], scores: Scores): OneThing

// Generate domain-specific actions
selectDomainActions(scores: Scores): Record<string, string[]>

// Recommend videos based on flags
recommendVideos(videos: VideoRec[], flags: string[]): VideoRec[]

// Recommend articles based on flags
recommendArticles(articles: ArticleRec[], flags: string[]): ArticleRec[]
```

### Data Service

```typescript
// Load and validate all app data
loadAppData(): Promise<AppData>

// Validate individual data items
validateQuestion(q: any): q is Question
validateVideo(v: any): v is VideoRec
validateArticle(a: any): a is ArticleRec
```

## 🐛 Troubleshooting

### Tests Failing

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm test
```

### Build Errors

```bash
# Type-check only
npm run type-check

# Clean build
rm -rf dist
npm run build
```

### Dev Server Issues

```bash
# Kill existing processes on port 3000
lsof -ti:3000 | xargs kill
npm run dev
```

## 📄 License

MIT License - feel free to use this project for learning or building upon.

## 🙏 Acknowledgments

Built with evidence-based learning principles from cognitive science research on:
- Spacing effects (Ebbinghaus, Cepeda et al.)
- Retrieval practice (Roediger & Karpicke)
- Encoding variability (Bjork & Bjork)
- Schema activation (Anderson, Ausubel)

---

**Built with ❤️ and TypeScript**
