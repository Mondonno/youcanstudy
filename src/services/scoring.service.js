/**
 * Scoring service - pure functions for score calculation
 */
import { APP_CONFIG } from '../config/app.config.js';
/**
 * Score an individual answer (0-100)
 */
export function scoreAnswer(question, answer) {
    let value = 0;
    if (question.type === 'likert5') {
        // ans is 1..5
        const numeric = typeof answer === 'number' ? answer : parseInt(answer, 10);
        if (isNaN(numeric) || numeric < 1 || numeric > 5) {
            throw new Error(`Invalid likert5 answer: ${answer}`);
        }
        value = (numeric - 1) / 4; // 0..1
    }
    else if (question.type === 'ynm') {
        // yes/no/maybe
        const map = { yes: 0, maybe: 0.5, no: 1 };
        const answerKey = String(answer).toLowerCase();
        if (!(answerKey in map)) {
            throw new Error(`Invalid ynm answer: ${answer}`);
        }
        value = map[answerKey];
    }
    else {
        throw new Error(`Unknown question type: ${question.type}`);
    }
    if (question.reverse) {
        value = 1 - value;
    }
    return Math.round(value * 100);
}
/**
 * Compute scores for a set of questions
 */
export function computeScoresForQuestions(questions, answers) {
    const sums = {};
    const counts = {};
    for (const q of questions) {
        const ans = answers[q.id];
        if (ans === undefined)
            continue;
        const score = scoreAnswer(q, ans);
        if (!sums[q.domain]) {
            sums[q.domain] = 0;
            counts[q.domain] = 0;
        }
        sums[q.domain] += score;
        counts[q.domain] += 1;
    }
    const scores = {};
    for (const d of Object.keys(sums)) {
        scores[d] = counts[d] > 0 ? Math.round(sums[d] / counts[d]) : 0;
    }
    return scores;
}
/**
 * Compute overall weighted score from domain scores
 */
export function computeOverallScore(scores) {
    const weights = APP_CONFIG.DOMAIN_WEIGHTS;
    let weightedSum = 0;
    let totalWeight = 0;
    for (const d of Object.keys(scores)) {
        const w = weights[d] ?? 1;
        weightedSum += scores[d] * w;
        totalWeight += w;
    }
    return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
}
/**
 * Compute all scores (core, meta, and overall)
 */
export function computeScores(coreQuestions, metaQuestions, answers) {
    const scores = computeScoresForQuestions(coreQuestions, answers);
    const metaScores = computeScoresForQuestions(metaQuestions, answers);
    const overall = computeOverallScore(scores);
    return { scores, metaScores, overall };
}
