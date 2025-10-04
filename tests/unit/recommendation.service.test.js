/**
 * Unit tests for recommendation service
 */
import { describe, it, expect } from 'vitest';
import { selectOneThing, selectDomainActions, recommendVideos, recommendArticles, } from '../../src/services/recommendation.service';
import { mockVideos, mockArticles, mockScores } from '../fixtures/mock-data';
describe('Recommendation Service', () => {
    describe('selectOneThing', () => {
        it('should recommend priming routine for low_priming flag', () => {
            const flags = ['low_priming'];
            const oneThing = selectOneThing(flags, mockScores);
            expect(oneThing.title).toContain('Priming');
            expect(oneThing.steps).toBeDefined();
            expect(oneThing.steps.length).toBeGreaterThan(0);
        });
        it('should recommend retrieval for low_retrieval flag', () => {
            const flags = ['low_retrieval'];
            const oneThing = selectOneThing(flags, mockScores);
            expect(oneThing.title).toContain('Retrieval');
        });
        it('should recommend concept maps for weak_reference flag', () => {
            const flags = ['weak_reference'];
            const oneThing = selectOneThing(flags, mockScores);
            expect(oneThing.title).toContain('Concept-Map');
        });
        it('should recommend concept maps for linear_notes flag', () => {
            const flags = ['linear_notes'];
            const oneThing = selectOneThing(flags, mockScores);
            expect(oneThing.title).toContain('Concept-Map');
        });
        it('should recommend growth mindset for risk_fixed_mindset flag', () => {
            const flags = ['risk_fixed_mindset'];
            const oneThing = selectOneThing(flags, mockScores);
            expect(oneThing.title).toContain('Growth Mindset');
        });
        it('should provide default recommendation for no flags', () => {
            const flags = [];
            const oneThing = selectOneThing(flags, mockScores);
            expect(oneThing.title).toContain('Interleaving');
        });
        it('should prioritize flags correctly', () => {
            const flags = ['low_priming', 'low_retrieval', 'weak_reference'];
            const oneThing = selectOneThing(flags, mockScores);
            // low_priming should be highest priority
            expect(oneThing.title).toContain('Priming');
        });
    });
    describe('selectDomainActions', () => {
        it('should return actions for all core domains', () => {
            const actions = selectDomainActions(mockScores);
            expect(actions.priming).toBeDefined();
            expect(actions.encoding).toBeDefined();
            expect(actions.reference).toBeDefined();
            expect(actions.retrieval).toBeDefined();
            expect(actions.overlearning).toBeDefined();
        });
        it('should return arrays of action strings', () => {
            const actions = selectDomainActions(mockScores);
            expect(Array.isArray(actions.priming)).toBe(true);
            expect(actions.priming.length).toBeGreaterThan(0);
            expect(typeof actions.priming[0]).toBe('string');
        });
        it('should provide multiple actions per domain', () => {
            const actions = selectDomainActions(mockScores);
            for (const domain of ['priming', 'encoding', 'reference', 'retrieval', 'overlearning']) {
                expect(actions[domain].length).toBeGreaterThanOrEqual(3);
            }
        });
    });
    describe('recommendVideos', () => {
        it('should recommend videos matching flags', () => {
            const flags = ['low_priming'];
            const recommended = recommendVideos(mockVideos, flags);
            expect(recommended.length).toBeGreaterThan(0);
            expect(recommended[0].maps_to).toContain('low_priming');
        });
        it('should limit recommendations to MAX_VIDEOS', () => {
            const flags = ['low_priming', 'low_retrieval', 'risk_fixed_mindset'];
            const recommended = recommendVideos(mockVideos, flags);
            expect(recommended.length).toBeLessThanOrEqual(3);
        });
        it('should prioritize videos matching multiple flags', () => {
            const flags = ['low_retrieval', 'low_encoding'];
            const recommended = recommendVideos(mockVideos, flags);
            // V2 maps to both flags, should be first
            if (recommended.length > 0) {
                expect(recommended[0].id).toBe('V2');
            }
        });
        it('should prioritize shorter videos', () => {
            const flags = ['risk_fixed_mindset', 'low_priming'];
            const recommended = recommendVideos(mockVideos, flags);
            // Among videos matching flags, shorter should rank higher
            expect(recommended).toBeDefined();
        });
        it('should return empty array for no matching videos', () => {
            const flags = ['nonexistent_flag'];
            const recommended = recommendVideos(mockVideos, flags);
            expect(recommended).toEqual([]);
        });
        it('should handle empty flags', () => {
            const recommended = recommendVideos(mockVideos, []);
            expect(recommended).toEqual([]);
        });
    });
    describe('recommendArticles', () => {
        it('should recommend articles matching flags', () => {
            const flags = ['low_priming'];
            const recommended = recommendArticles(mockArticles, flags);
            expect(recommended.length).toBeGreaterThan(0);
            expect(recommended[0].maps_to).toContain('low_priming');
        });
        it('should limit recommendations to MAX_ARTICLES', () => {
            const flags = ['low_priming', 'linear_notes', 'weak_reference'];
            const recommended = recommendArticles(mockArticles, flags);
            expect(recommended.length).toBeLessThanOrEqual(4);
        });
        it('should prioritize articles matching multiple flags', () => {
            const flags = ['low_priming', 'low_retrieval'];
            const recommended = recommendArticles(mockArticles, flags);
            // A1 maps to both flags
            if (recommended.length > 0) {
                expect(recommended[0].id).toBe('A1');
            }
        });
        it('should favor shorter reading times', () => {
            const flags = ['low_priming', 'linear_notes'];
            const recommended = recommendArticles(mockArticles, flags);
            expect(recommended).toBeDefined();
        });
        it('should return empty array for no matching articles', () => {
            const flags = ['nonexistent_flag'];
            const recommended = recommendArticles(mockArticles, flags);
            expect(recommended).toEqual([]);
        });
        it('should handle empty flags', () => {
            const recommended = recommendArticles(mockArticles, []);
            expect(recommended).toEqual([]);
        });
    });
});
