/**
 * Unit tests for data service
 */

import { describe, it, expect } from 'vitest';
import {
  validateQuestion,
  validateVideo,
  validateArticle,
} from '../../src/services/data.service';

describe('Data Service', () => {
  describe('validateQuestion', () => {
    it('should validate a valid likert5 question', () => {
      const question = {
        id: 'Q1',
        text: 'Test question',
        type: 'likert5',
        domain: 'priming',
      };

      expect(validateQuestion(question)).toBe(true);
    });

    it('should validate a valid ynm question', () => {
      const question = {
        id: 'Q1',
        text: 'Test question',
        type: 'ynm',
        domain: 'encoding',
      };

      expect(validateQuestion(question)).toBe(true);
    });

    it('should validate a question with reverse flag', () => {
      const question = {
        id: 'Q1',
        text: 'Test question',
        type: 'likert5',
        domain: 'priming',
        reverse: true,
      };

      expect(validateQuestion(question)).toBe(true);
    });

    it('should reject invalid question type', () => {
      const question = {
        id: 'Q1',
        text: 'Test question',
        type: 'invalid',
        domain: 'priming',
      };

      expect(validateQuestion(question)).toBe(false);
    });

    it('should reject missing required fields', () => {
      expect(validateQuestion({ id: 'Q1' })).toBe(false);
      expect(validateQuestion({ text: 'Test' })).toBe(false);
      expect(validateQuestion({ type: 'likert5' })).toBe(false);
      expect(validateQuestion({ domain: 'priming' })).toBe(false);
    });

    it('should reject null or non-object', () => {
      expect(validateQuestion(null)).toBe(false);
      expect(validateQuestion('string')).toBe(false);
      expect(validateQuestion(123)).toBe(false);
    });
  });

  describe('validateVideo', () => {
    it('should validate a valid video', () => {
      const video = {
        id: 'V1',
        title: 'Test Video',
        url: 'https://example.com',
        maps_to: ['low_priming'],
        tldr: 'Summary',
        duration_minutes: 5,
      };

      expect(validateVideo(video)).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidVideo = {
        id: 'V1',
        title: 'Test Video',
      };

      expect(validateVideo(invalidVideo)).toBe(false);
    });

    it('should reject invalid maps_to type', () => {
      const video = {
        id: 'V1',
        title: 'Test Video',
        url: 'https://example.com',
        maps_to: 'string', // Should be array
        tldr: 'Summary',
        duration_minutes: 5,
      };

      expect(validateVideo(video)).toBe(false);
    });

    it('should reject null or non-object', () => {
      expect(validateVideo(null)).toBe(false);
      expect(validateVideo('string')).toBe(false);
    });
  });

  describe('validateArticle', () => {
    it('should validate a valid article', () => {
      const article = {
        id: 'A1',
        title: 'Test Article',
        authors: 'Smith et al.',
        year: 2020,
        source: 'Journal',
        url: 'https://example.com',
        maps_to: ['low_priming'],
        est_minutes: 5,
        tldr: ['Point 1', 'Point 2'],
        try_tomorrow: ['Action 1'],
      };

      expect(validateArticle(article)).toBe(true);
    });

    it('should reject missing required fields', () => {
      const invalidArticle = {
        id: 'A1',
        title: 'Test Article',
      };

      expect(validateArticle(invalidArticle)).toBe(false);
    });

    it('should reject invalid array types', () => {
      const article = {
        id: 'A1',
        title: 'Test Article',
        authors: 'Smith',
        year: 2020,
        source: 'Journal',
        url: 'https://example.com',
        maps_to: 'string', // Should be array
        est_minutes: 5,
        tldr: ['Point'],
        try_tomorrow: ['Action'],
      };

      expect(validateArticle(article)).toBe(false);
    });

    it('should reject null or non-object', () => {
      expect(validateArticle(null)).toBe(false);
      expect(validateArticle('string')).toBe(false);
    });
  });
});
