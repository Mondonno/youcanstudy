/**
 * Data service - handles data fetching and validation
 */
import { APP_CONFIG } from '../config/app.config.js';
/**
 * Validate a question object
 */
export function validateQuestion(q) {
    return (typeof q === 'object' &&
        q !== null &&
        typeof q.id === 'string' &&
        typeof q.text === 'string' &&
        (q.type === 'likert5' || q.type === 'ynm') &&
        typeof q.domain === 'string' &&
        (q.reverse === undefined || typeof q.reverse === 'boolean'));
}
/**
 * Validate a video recommendation object
 */
export function validateVideo(v) {
    return (typeof v === 'object' &&
        v !== null &&
        typeof v.id === 'string' &&
        typeof v.title === 'string' &&
        typeof v.url === 'string' &&
        Array.isArray(v.maps_to) &&
        typeof v.tldr === 'string' &&
        typeof v.duration_minutes === 'number');
}
/**
 * Validate an article recommendation object
 */
export function validateArticle(a) {
    return (typeof a === 'object' &&
        a !== null &&
        typeof a.id === 'string' &&
        typeof a.title === 'string' &&
        typeof a.authors === 'string' &&
        typeof a.year === 'number' &&
        typeof a.source === 'string' &&
        typeof a.url === 'string' &&
        Array.isArray(a.maps_to) &&
        typeof a.est_minutes === 'number' &&
        Array.isArray(a.tldr) &&
        Array.isArray(a.try_tomorrow));
}
/**
 * Fetch and validate JSON data
 */
async function fetchJSON(url, validator) {
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
            console.warn(`${url}: ${data.length - validated.length} invalid items filtered out`);
        }
        return validated;
    }
    catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }
}
/**
 * Load all application data
 */
export async function loadAppData() {
    const paths = APP_CONFIG.DATA_PATHS;
    const [coreQuestions, metaQuestions, videos, articles] = await Promise.all([
        fetchJSON(paths.CORE_QUESTIONS, validateQuestion),
        fetchJSON(paths.META_QUESTIONS, validateQuestion),
        fetchJSON(paths.VIDEOS, validateVideo),
        fetchJSON(paths.ARTICLES, validateArticle),
    ]);
    return {
        coreQuestions,
        metaQuestions,
        videos,
        articles,
    };
}
