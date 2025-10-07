/**
 * History utilities
 */

import type { HistoryEntry } from '../services/history.service';

/**
 * Get a summary score for a history entry.
 * Returns the rounded stored overall score if present, otherwise null.
 */
export function getScoreSummaryFromEntry(entry: HistoryEntry): number | null {
  if (entry && entry.results && typeof entry.results.overall === 'number') {
    return Math.round(entry.results.overall);
  }

  return null;
}

export default getScoreSummaryFromEntry;
