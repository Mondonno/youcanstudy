/**
 * Recommendation service - generates personalized recommendations
 */

import type { VideoRec, ArticleRec, OneThing, Scores } from '../models/types.js';
import { APP_CONFIG } from '../config/app.config.js';

/**
 * Select the one thing to focus on based on flags and scores
 */
export function selectOneThing(flags: string[], _scores: Scores): OneThing {
  // Primary priority: low priming
  if (flags.includes('low_priming')) {
    return {
      title: 'Establish a Priming and Brain-Dump Routine',
      description:
        'Start every learning session by previewing the topic, asking questions, and connecting new ideas to what you already know. Then summarise from memory immediately after.',
      steps: [
        'Before class: skim headings and bold terms to get the big picture.',
        'Write down three questions you expect to answer and one analogy or connection.',
        'After class: do a 2–3 minute brain dump without notes to consolidate and uncover gaps.',
      ],
    };
  }

  // Secondary: low retrieval
  if (flags.includes('low_retrieval')) {
    return {
      title: 'Implement Daily Micro-Retrieval',
      description:
        'Spaced, low-stakes recall strengthens memory better than re-reading. Engage in short recall sessions each day to test your knowledge and reveal misunderstandings.',
      steps: [
        'Write three practice questions at the end of each study session.',
        'The next day, answer those questions from memory without looking at notes.',
        'Check your answers and identify areas that need more work.',
      ],
    };
  }

  // Next: weak reference / linear notes
  if (flags.includes('weak_reference') || flags.includes('linear_notes')) {
    return {
      title: 'Switch to Concept-Map Based Note-Taking',
      description:
        'Rethink your notes: separate facts from concepts and use non-linear structures to map relationships instead of transcribing everything linearly.',
      steps: [
        'Use a blank page: centre the main idea and branch out related concepts, causes, examples and implications.',
        'Keep isolated facts in a small fact-bank separate from conceptual maps.',
        'Review your maps regularly and update them with new insights.',
      ],
    };
  }

  // Next: risk fixed mindset
  if (flags.includes('risk_fixed_mindset')) {
    return {
      title: 'Cultivate a Growth Mindset',
      description:
        'Believing that intelligence can grow increases motivation and resilience. Reframe mistakes as opportunities and focus on effort and strategy.',
      steps: [
        'Reflect on a time when persistence led to success.',
        "Replace 'I can't' with 'I can't yet' in your self-talk.",
        'Seek feedback and view challenges as ways to strengthen your brain.',
      ],
    };
  }

  // Default: interleaving improvement
  return {
    title: 'Practice Interleaving and Spaced Revision',
    description:
      'Mix different topics and problem types within a study session and distribute your practice over time to improve discrimination and long-term retention.',
    steps: [
      'Alternate between different subjects or problem types instead of studying one in isolation.',
      'Schedule multiple short review sessions over several days instead of one long cram.',
      'Include problems that combine multiple concepts to encourage transfer.',
    ],
  };
}

/**
 * Generate domain-specific action recommendations
 */
export function selectDomainActions(_scores: Scores): Record<string, string[]> {
  const actions: Record<string, string[]> = {};

  actions['priming'] = [
    'Preview material before class by skimming headings and summaries.',
    'Write down what you already know and generate questions to guide your learning.',
    'Create analogies to relate new concepts to familiar experiences.',
    'Pause during study to reorganise and summarise what you have learned so far.',
  ];

  actions['encoding'] = [
    'Teach the material to someone else or record yourself explaining it.',
    'Break complex ideas into smaller chunks and relate them to examples.',
    'Use diagrams or flowcharts to illustrate processes and relationships.',
    'Make connections across topics to deepen understanding.',
  ];

  actions['reference'] = [
    'Separate conceptual maps from fact banks: use non-linear structures for concepts and lists for facts.',
    'Minimise verbatim note-taking; focus on relationships and synthesis.',
    'Organise notes using colours or shapes to group related ideas.',
    'Regularly prune your notes, keeping only what aids understanding.',
  ];

  actions['retrieval'] = [
    'Self-test within 24 hours of learning new material to identify gaps.',
    'Use flashcards or quizzes for isolated facts and open-ended questions for concepts.',
    'Practice recalling information in different ways: writing, drawing and explaining verbally.',
    'Incorporate cumulative questions that combine topics to encourage transfer.',
  ];

  actions['overlearning'] = [
    'Delay intensive drilling until you have built a solid understanding through priming, encoding and retrieval.',
    'Use high-volume practice strategically for core skills that require speed or automaticity.',
    'Balance repetition with reflection to avoid rote memorisation without understanding.',
  ];

  return actions;
}

/**
 * Recommend videos based on flags
 */
export function recommendVideos(videos: VideoRec[], flags: string[]): VideoRec[] {
  const scored: Array<{ vid: VideoRec; score: number }> = [];

  for (const v of videos) {
    let s = 0;
    for (const tag of v.maps_to) {
      if (flags.includes(tag)) s += 2;
    }
    // Only include videos that match at least one flag
    if (s === 0) continue;
    
    // slight bonus for shorter videos
    s += Math.max(0, 5 - v.duration_minutes) * 0.1;
    scored.push({ vid: v, score: s });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, APP_CONFIG.RECOMMENDATIONS.MAX_VIDEOS).map((s) => s.vid);
}

/**
 * Recommend articles based on flags
 */
export function recommendArticles(articles: ArticleRec[], flags: string[]): ArticleRec[] {
  const scored: Array<{ art: ArticleRec; score: number }> = [];

  for (const a of articles) {
    let s = 0;
    for (const tag of a.maps_to) {
      if (flags.includes(tag)) s += 2;
    }
    // Only include articles that match at least one flag
    if (s === 0) continue;
    
    // favour easy and medium reads (≤8 minutes)
    s += Math.max(0, 10 - a.est_minutes) * 0.1;
    scored.push({ art: a, score: s });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, APP_CONFIG.RECOMMENDATIONS.MAX_ARTICLES).map((s) => s.art);
}
