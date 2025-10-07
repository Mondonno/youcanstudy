import { describe, it, expect } from 'vitest';
import getScoreSummaryFromEntry from '../../src/utils/history.utils';

describe('History Utils', () => {
  it('returns rounded overall when present', () => {
    const entry: any = {
      results: {
        overall: 72.4,
      },
    };

    const val = getScoreSummaryFromEntry(entry);
    expect(val).toBe(72);
  });

  it('returns null when overall missing', () => {
    const entry: any = {
      results: {
        scores: {
          priming: 60,
          encoding: 80,
        },
      },
    };

    const val = getScoreSummaryFromEntry(entry);
    expect(val).toBeNull();
  });
});
