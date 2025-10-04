/**
 * Application configuration and constants
 */

// Get base URL from Vite (respects base path config)
// In production this will be '/youcanstudy/', in dev it's '/'
const BASE_URL = import.meta.env.BASE_URL;

export const APP_CONFIG = {
  // Data source paths
  DATA_PATHS: {
    CORE_QUESTIONS: `${BASE_URL}data/questions-core.json`,
    META_QUESTIONS: `${BASE_URL}data/questions-meta.json`,
    VIDEOS: `${BASE_URL}data/videos.json`,
    ARTICLES: `${BASE_URL}data/articles.json`,
  },

  // Domain weights for overall score calculation
  DOMAIN_WEIGHTS: {
    priming: 1,
    retrieval: 1,
    encoding: 1,
    reference: 1,
    overlearning: 0.8,
  },

  // Core domain order
  CORE_DOMAINS: ['priming', 'encoding', 'reference', 'retrieval', 'overlearning'] as const,

  // Threshold values for flag computation
  THRESHOLDS: {
    LOW_PRIMING: 50,
    LOW_RETRIEVAL: 60,
    LOW_ENCODING: 60,
    WEAK_REFERENCE: 50,
    OVERLEARNING_THRESHOLD: 60,
    PRIMING_THRESHOLD: 60,
    FIXED_MINDSET: 60,
    LOW_RESOURCEFULNESS: 60,
    BIG_PICTURE: 60,
  },

  // Recommendation limits
  RECOMMENDATIONS: {
    MAX_VIDEOS: 3,
    MAX_ARTICLES: 4,
  },

  // Chart configuration
  CHARTS: {
    DONUT_RADIUS_RATIO: 0.6,
    RADAR_RINGS: 4,
    COLORS: ['#fbbf24', '#34d399', '#60a5fa', '#f87171', '#a78bfa'],
  },
} as const;
