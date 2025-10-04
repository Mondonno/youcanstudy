/**
 * History service - manages local storage of quiz attempts and results
 */

import type { DiagnosticResults } from '../models/types.js';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  date: string;
  results: DiagnosticResults;
}

const HISTORY_KEY = 'youcanstudy_history';
const MAX_HISTORY_ENTRIES = 50;

/**
 * Get all history entries
 */
export function getHistory(): HistoryEntry[] {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    const entries = JSON.parse(data) as HistoryEntry[];
    return entries.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
}

/**
 * Get the most recent history entry
 */
export function getLatestEntry(): HistoryEntry | null {
  const history = getHistory();
  return history.length > 0 ? history[0] : null;
}

/**
 * Save a new result to history
 */
export function saveToHistory(results: DiagnosticResults): HistoryEntry {
  const timestamp = Date.now();
  const date = new Date(timestamp).toLocaleString();
  const id = `entry-${timestamp}`;

  const entry: HistoryEntry = {
    id,
    timestamp,
    date,
    results,
  };

  const history = getHistory();
  history.unshift(entry);

  // Keep only the most recent entries
  const trimmedHistory = history.slice(0, MAX_HISTORY_ENTRIES);

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Failed to save to history:', error);
    throw new Error('Failed to save quiz results');
  }

  return entry;
}

/**
 * Get a specific history entry by ID
 */
export function getEntryById(id: string): HistoryEntry | null {
  const history = getHistory();
  return history.find((entry) => entry.id === id) || null;
}

/**
 * Delete a history entry
 */
export function deleteEntry(id: string): void {
  const history = getHistory();
  const filtered = history.filter((entry) => entry.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

/**
 * Clear all history
 */
export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

/**
 * Export history as JSON
 */
export function exportHistory(): void {
  const history = getHistory();
  const data = JSON.stringify(history, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `youcanstudy-history-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Import history from JSON
 */
export function importHistory(jsonData: string): void {
  try {
    const imported = JSON.parse(jsonData) as HistoryEntry[];
    
    // Validate the structure
    if (!Array.isArray(imported)) {
      throw new Error('Invalid history format');
    }

    const currentHistory = getHistory();
    
    // Merge with existing history, avoiding duplicates
    const merged = [...imported, ...currentHistory];
    const uniqueMap = new Map<string, HistoryEntry>();
    
    merged.forEach((entry) => {
      if (!uniqueMap.has(entry.id)) {
        uniqueMap.set(entry.id, entry);
      }
    });

    const uniqueHistory = Array.from(uniqueMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_HISTORY_ENTRIES);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(uniqueHistory));
  } catch (error) {
    console.error('Failed to import history:', error);
    throw new Error('Failed to import history. Please check the file format.');
  }
}

/**
 * Get comparison data between current and previous attempt
 */
export function getComparison(currentResults: DiagnosticResults): {
  previous: DiagnosticResults | null;
  improvements: Record<string, number>;
} | null {
  const history = getHistory();
  if (history.length < 2) return null;

  const previous = history[1].results; // Second most recent
  const improvements: Record<string, number> = {};

  // Compare core domain scores
  Object.keys(currentResults.scores).forEach((domain) => {
    const current = currentResults.scores[domain] ?? 0;
    const prev = previous.scores[domain] ?? 0;
    improvements[domain] = current - prev;
  });

  return { previous, improvements };
}
