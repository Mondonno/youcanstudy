/**
 * Core type definitions for the Learning Diagnostic App
 */

export type QuestionType = 'likert5' | 'ynm';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  domain: string;
  reverse?: boolean;
}

export interface VideoRec {
  id: string;
  reason: string;
  title: string;
  url: string;
  maps_to: string[];
  tldr: string;
  duration_minutes: number;
}

export interface ArticleRec {
  id: string;
  reason: string;
  title: string;
  authors: string;
  year: number;
  source: string;
  url: string;
  maps_to: string[];
  est_minutes: number;
  tldr: string[];
  try_tomorrow: string[];
}

export interface Scores {
  [domain: string]: number;
}

export interface Answers {
  [questionId: string]: number | string;
}

export interface OneThing {
  title: string;
  reason: string;
  description: string;
  steps: string[];
}

export interface DiagnosticResults {
  answers: Answers;
  scores: Scores;
  metaScores: Scores;
  flags: string[];
  overall: number;
  oneThing: OneThing;
  domainActions: Record<string, string[]>;
  recommendedVideos: VideoRec[];
  recommendedArticles: ArticleRec[];
}

export interface AppData {
  coreQuestions: Question[];
  metaQuestions: Question[];
  videos: VideoRec[];
  articles: ArticleRec[];
}
