/**
 * Flag computation service - determines user flags based on scores and answers
 */

import type { Scores, Answers, Question } from '../models/types.js';
import { APP_CONFIG } from '../config/app.config.js';
import { scoreAnswer } from './scoring.service.js';

/**
 * Find a question by ID from a list of questions
 */
export function findQuestionById(
  questions: Question[],
  id: string
): Question | undefined {
  return questions.find((q) => q.id === id);
}

/**
 * Compute diagnostic flags based on scores and answers
 */
export function computeFlags(
  scores: Scores,
  metaScores: Scores,
  answers: Answers,
  allQuestions: Question[]
): string[] {
  const flags: string[] = [];
  const t = APP_CONFIG.THRESHOLDS;

  // Core domain based flags
  if ((scores.priming ?? 100) < t.LOW_PRIMING) {
    flags.push('low_priming');
  }
  if ((scores.retrieval ?? 100) < t.LOW_RETRIEVAL) {
    flags.push('low_retrieval');
  }
  if ((scores.encoding ?? 100) < t.LOW_ENCODING) {
    flags.push('low_encoding');
  }
  if ((scores.reference ?? 100) < t.WEAK_REFERENCE) {
    flags.push('weak_reference');
  }
  if (
    (scores.overlearning ?? 0) > t.OVERLEARNING_THRESHOLD &&
    (scores.priming ?? 100) < t.PRIMING_THRESHOLD
  ) {
    flags.push('overlearning_early');
  }

  // Note-taking behaviours (Q15, Q17)
  const q15 = answers['Q15'];
  const q17 = answers['Q17'];

  if (q15 !== undefined) {
    const q15Question = findQuestionById(allQuestions, 'Q15');
    if (q15Question && scoreAnswer(q15Question, q15) < 50) {
      flags.push('linear_notes');
    }
  }

  if (q17 !== undefined) {
    const q17Question = findQuestionById(allQuestions, 'Q17');
    if (q17Question && scoreAnswer(q17Question, q17) > 50) {
      flags.push('linear_notes');
    }
  }

  // Meta domains
  if ((metaScores.mindset_fixed ?? 100) < t.FIXED_MINDSET) {
    flags.push('risk_fixed_mindset');
  }
  if ((metaScores.resourcefulness ?? 100) < t.LOW_RESOURCEFULNESS) {
    flags.push('low_resourcefulness');
  }
  if ((metaScores.big_picture ?? 100) < t.BIG_PICTURE) {
    flags.push('needs_big_picture');
  }

  // Remove duplicates
  return Array.from(new Set(flags));
}
