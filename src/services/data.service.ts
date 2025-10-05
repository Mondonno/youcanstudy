/**
 * Data service - handles data fetching and validation
 */

import type { Question, VideoRec, ArticleRec, AppData } from '../models/types.js';
import { APP_CONFIG } from '../config/app.config.js';

/**
 * Validate a question object
 */
export function validateQuestion(q: unknown): q is Question {
  if (typeof q !== 'object' || q === null) return false;
  const obj = q as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.text === 'string' &&
    (obj.type === 'likert5' || obj.type === 'ynm') &&
    typeof obj.domain === 'string' &&
    (obj.reverse === undefined || typeof obj.reverse === 'boolean')
  );
}

/**
 * Validate a video recommendation object
 */
export function validateVideo(v: unknown): v is VideoRec {
  if (typeof v !== 'object' || v === null) return false;
  const obj = v as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.url === 'string' &&
    Array.isArray(obj.maps_to) &&
    typeof obj.tldr === 'string' &&
    typeof obj.duration_minutes === 'number'
  );
}

/**
 * Validate an article recommendation object
 */
export function validateArticle(a: unknown): a is ArticleRec {
  if (typeof a !== 'object' || a === null) return false;
  const obj = a as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.authors === 'string' &&
    typeof obj.year === 'number' &&
    typeof obj.source === 'string' &&
    typeof obj.url === 'string' &&
    Array.isArray(obj.maps_to) &&
    typeof obj.est_minutes === 'number' &&
    Array.isArray(obj.tldr) &&
    Array.isArray(obj.try_tomorrow)
  );
}

/**
 * Fetch and validate JSON data
 */
async function fetchJSON<T>(url: string, validator: (item: unknown) => boolean): Promise<T[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error(`Expected array from ${url}, got ${typeof data}`);
    }

    // Validate each item
    const validated = data.filter(validator);
    if (validated.length !== data.length) {
      console.warn(
        `${url}: ${data.length - validated.length} invalid items filtered out`
      );
    }

    return validated as T[];
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

/**
 * Load all application data
 */
export async function loadAppData(): Promise<AppData> {
  const paths = APP_CONFIG.DATA_PATHS;

  const [coreQuestions, metaQuestions, videos, articles] = await Promise.all([
    fetchJSON<Question>(paths.CORE_QUESTIONS, validateQuestion),
    fetchJSON<Question>(paths.META_QUESTIONS, validateQuestion),
    fetchJSON<VideoRec>(paths.VIDEOS, validateVideo),
    fetchJSON<ArticleRec>(paths.ARTICLES, validateArticle),
  ]);

  return {
    coreQuestions,
    metaQuestions,
    videos,
    articles,
  };
}
