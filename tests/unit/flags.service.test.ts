/**
 * Unit tests for flags service
 */

import { describe, it, expect } from 'vitest';
import { computeFlags, findQuestionById } from '../../src/services/flags.service';
import { mockQuestions, mockScores } from '../fixtures/mock-data';

describe('Flags Service', () => {
  describe('findQuestionById', () => {
    it('should find a question by id', () => {
      const question = findQuestionById(mockQuestions, 'Q1');
      expect(question).toBeDefined();
      expect(question?.id).toBe('Q1');
    });

    it('should return undefined for non-existent id', () => {
      const question = findQuestionById(mockQuestions, 'NONEXISTENT');
      expect(question).toBeUndefined();
    });
  });

  describe('computeFlags', () => {
    it('should detect low_priming flag', () => {
      const scores = { priming: 40, retrieval: 80, encoding: 80, reference: 80 };
      const flags = computeFlags(scores, {}, {}, mockQuestions);
      expect(flags).toContain('low_priming');
    });

    it('should detect low_retrieval flag', () => {
      const scores = { priming: 80, retrieval: 50, encoding: 80, reference: 80 };
      const flags = computeFlags(scores, {}, {}, mockQuestions);
      expect(flags).toContain('low_retrieval');
    });

    it('should detect low_encoding flag', () => {
      const scores = { priming: 80, retrieval: 80, encoding: 50, reference: 80 };
      const flags = computeFlags(scores, {}, {}, mockQuestions);
      expect(flags).toContain('low_encoding');
    });

    it('should detect weak_reference flag', () => {
      const scores = { priming: 80, retrieval: 80, encoding: 80, reference: 40 };
      const flags = computeFlags(scores, {}, {}, mockQuestions);
      expect(flags).toContain('weak_reference');
    });

    it('should detect overlearning_early flag', () => {
      const scores = { priming: 50, retrieval: 80, encoding: 80, reference: 80, overlearning: 70 };
      const flags = computeFlags(scores, {}, {}, mockQuestions);
      expect(flags).toContain('overlearning_early');
    });

    it('should detect linear_notes flag from Q15', () => {
      const scores = mockScores;
      const answers = { Q15: 2 }; // Low score on "minimise linear notes"
      const flags = computeFlags(scores, {}, answers, mockQuestions);
      expect(flags).toContain('linear_notes');
    });

    it('should detect linear_notes flag from Q17', () => {
      const scores = mockScores;
      const answers = { Q17: 1 }; // Low score on reversed question means high "write notes you don't read"
      const flags = computeFlags(scores, {}, answers, mockQuestions);
      expect(flags).toContain('linear_notes');
    });

    it('should detect risk_fixed_mindset flag', () => {
      const metaScores = { mindset_fixed: 50, resourcefulness: 80, big_picture: 80 };
      const flags = computeFlags({}, metaScores, {}, mockQuestions);
      expect(flags).toContain('risk_fixed_mindset');
    });

    it('should detect low_resourcefulness flag', () => {
      const metaScores = { mindset_fixed: 80, resourcefulness: 50, big_picture: 80 };
      const flags = computeFlags({}, metaScores, {}, mockQuestions);
      expect(flags).toContain('low_resourcefulness');
    });

    it('should detect needs_big_picture flag', () => {
      const metaScores = { mindset_fixed: 80, resourcefulness: 80, big_picture: 50 };
      const flags = computeFlags({}, metaScores, {}, mockQuestions);
      expect(flags).toContain('needs_big_picture');
    });

    it('should return multiple flags when applicable', () => {
      const scores = { priming: 40, retrieval: 50, encoding: 50, reference: 40 };
      const metaScores = { mindset_fixed: 50 };
      const flags = computeFlags(scores, metaScores, {}, mockQuestions);
      
      expect(flags.length).toBeGreaterThan(1);
      expect(flags).toContain('low_priming');
      expect(flags).toContain('low_retrieval');
      expect(flags).toContain('low_encoding');
      expect(flags).toContain('weak_reference');
      expect(flags).toContain('risk_fixed_mindset');
    });

    it('should remove duplicate flags', () => {
      const scores = mockScores;
      const answers = { Q15: 2, Q17: 4 }; // Both trigger linear_notes
      const flags = computeFlags(scores, {}, answers, mockQuestions);
      
      const linearNotesCount = flags.filter(f => f === 'linear_notes').length;
      expect(linearNotesCount).toBe(1);
    });

    it('should handle missing scores gracefully', () => {
      const flags = computeFlags({}, {}, {}, mockQuestions);
      expect(Array.isArray(flags)).toBe(true);
    });
  });
});
