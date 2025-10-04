/**
 * Unit tests for scoring service
 */

import { describe, it, expect } from 'vitest';
import {
  scoreAnswer,
  computeScoresForQuestions,
  computeOverallScore,
  computeScores,
} from '../../src/services/scoring.service';
import { mockQuestions, mockMetaQuestions, mockAnswers } from '../fixtures/mock-data';
import type { Question } from '../../src/models/types';

describe('Scoring Service', () => {
  describe('scoreAnswer', () => {
    it('should score likert5 answers correctly', () => {
      const question: Question = {
        id: 'Q1',
        text: 'Test',
        type: 'likert5',
        domain: 'priming',
      };

      expect(scoreAnswer(question, 1)).toBe(0);
      expect(scoreAnswer(question, 3)).toBe(50);
      expect(scoreAnswer(question, 5)).toBe(100);
    });

    it('should score reversed likert5 answers correctly', () => {
      const question: Question = {
        id: 'Q2',
        text: 'Test',
        type: 'likert5',
        domain: 'priming',
        reverse: true,
      };

      expect(scoreAnswer(question, 1)).toBe(100);
      expect(scoreAnswer(question, 3)).toBe(50);
      expect(scoreAnswer(question, 5)).toBe(0);
    });

    it('should score ynm answers correctly', () => {
      const question: Question = {
        id: 'Q3',
        text: 'Test',
        type: 'ynm',
        domain: 'encoding',
      };

      expect(scoreAnswer(question, 'yes')).toBe(0);
      expect(scoreAnswer(question, 'maybe')).toBe(50);
      expect(scoreAnswer(question, 'no')).toBe(100);
    });

    it('should score reversed ynm answers correctly', () => {
      const question: Question = {
        id: 'Q4',
        text: 'Test',
        type: 'ynm',
        domain: 'encoding',
        reverse: true,
      };

      expect(scoreAnswer(question, 'yes')).toBe(100);
      expect(scoreAnswer(question, 'maybe')).toBe(50);
      expect(scoreAnswer(question, 'no')).toBe(0);
    });

    it('should handle string numbers for likert5', () => {
      const question: Question = {
        id: 'Q1',
        text: 'Test',
        type: 'likert5',
        domain: 'priming',
      };

      expect(scoreAnswer(question, '3')).toBe(50);
    });

    it('should throw error for invalid likert5 answer', () => {
      const question: Question = {
        id: 'Q1',
        text: 'Test',
        type: 'likert5',
        domain: 'priming',
      };

      expect(() => scoreAnswer(question, 6)).toThrow('Invalid likert5 answer');
      expect(() => scoreAnswer(question, 0)).toThrow('Invalid likert5 answer');
      expect(() => scoreAnswer(question, 'invalid')).toThrow('Invalid likert5 answer');
    });

    it('should throw error for invalid ynm answer', () => {
      const question: Question = {
        id: 'Q3',
        text: 'Test',
        type: 'ynm',
        domain: 'encoding',
      };

      expect(() => scoreAnswer(question, 'invalid')).toThrow('Invalid ynm answer');
    });
  });

  describe('computeScoresForQuestions', () => {
    it('should compute average scores per domain', () => {
      const questions: Question[] = [
        { id: 'Q1', text: 'Test 1', type: 'likert5', domain: 'priming' },
        { id: 'Q2', text: 'Test 2', type: 'likert5', domain: 'retrieval' },
      ];

      const answers = {
        Q1: 1, // 0%
        Q2: 5, // 100%
      };

      const scores = computeScoresForQuestions(questions, answers);

      expect(scores.priming).toBe(0); // 0 / 1 = 0
      expect(scores.retrieval).toBe(100); // 100 / 1 = 100
    });

    it('should skip unanswered questions', () => {
      const questions: Question[] = [
        { id: 'Q1', text: 'Test 1', type: 'likert5', domain: 'priming' },
        { id: 'Q2', text: 'Test 2', type: 'likert5', domain: 'priming' },
      ];

      const answers = {
        Q1: 5, // 100%
      };

      const scores = computeScoresForQuestions(questions, answers);

      expect(scores.priming).toBe(100); // Only Q1 counted
    });

    it('should handle empty answers', () => {
      const scores = computeScoresForQuestions(mockQuestions, {});
      expect(Object.keys(scores).length).toBe(0);
    });

    it('should work with mixed question types', () => {
      const questions: Question[] = [
        { id: 'Q1', text: 'Test 1', type: 'likert5', domain: 'priming' },
        { id: 'Q2', text: 'Test 2', type: 'ynm', domain: 'priming' },
      ];

      const answers = {
        Q1: 3, // 50%
        Q2: 'yes', // 0%
      };

      const scores = computeScoresForQuestions(questions, answers);

      expect(scores.priming).toBe(25); // (50 + 0) / 2 = 25
    });
  });

  describe('computeOverallScore', () => {
    it('should compute weighted average correctly', () => {
      const scores = {
        priming: 50,
        retrieval: 60,
        encoding: 70,
        reference: 80,
        overlearning: 40,
      };

      const overall = computeOverallScore(scores);

      // (50*1 + 60*1 + 70*1 + 80*1 + 40*0.8) / (1+1+1+1+0.8) = 292 / 4.8 = 60.83...
      expect(overall).toBe(61);
    });

    it('should handle missing domains', () => {
      const scores = {
        priming: 50,
        retrieval: 60,
      };

      const overall = computeOverallScore(scores);

      // Should use default weight of 1 for unknown domains
      expect(overall).toBe(55); // (50 + 60) / 2
    });

    it('should handle empty scores', () => {
      const overall = computeOverallScore({});
      expect(overall).toBe(0);
    });
  });

  describe('computeScores', () => {
    it('should compute all scores correctly', () => {
      const result = computeScores(mockQuestions, mockMetaQuestions, mockAnswers);

      expect(result.scores).toBeDefined();
      expect(result.metaScores).toBeDefined();
      expect(result.overall).toBeDefined();
      expect(typeof result.overall).toBe('number');
    });

    it('should separate core and meta scores', () => {
      const result = computeScores(mockQuestions, mockMetaQuestions, mockAnswers);

      // Core domains
      expect(result.scores.priming).toBeDefined();
      expect(result.scores.retrieval).toBeDefined();

      // Meta domains
      expect(result.metaScores.mindset_fixed).toBeDefined();
      expect(result.metaScores.resourcefulness).toBeDefined();
    });
  });
});
