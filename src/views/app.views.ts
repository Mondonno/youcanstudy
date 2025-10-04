/**
 * View components for rendering different screens
 */

import { el } from '../utils/dom.utils.js';
import type { Question, VideoRec, ArticleRec, OneThing, Scores } from '../models/types.js';
import { drawDonutChart, drawRadarChart } from '../utils/chart.utils.js';
import { APP_CONFIG } from '../config/app.config.js';

/**
 * Render intro screen
 */
export function renderIntroView(onStart: () => void): HTMLElement {
  const title = el('h1', null, 'Learning Diagnostic');
  const desc = el(
    'p',
    null,
    'Welcome to the learning diagnostic tool. Answer a few short questions to receive personalised recommendations on how to study more effectively.'
  );
  const startBtn = el('button', { class: 'button', onclick: onStart }, 'Start');

  return el('div', { class: 'card' }, title, desc, startBtn);
}

/**
 * Render a question view
 */
export function renderQuestionView(
  question: Question,
  currentNum: number,
  total: number,
  currentAnswer: any,
  onAnswer: (answer: any) => void,
  onNext: () => void,
  onBack: () => void
): HTMLElement {
  const progress = ((currentNum - 1) / total) * 100;
  const qCard = el('div', { class: 'card' });
  const qNumber = el('h2', null, `Question ${currentNum} of ${total}`);
  const qText = el('p', null, question.text);

  // Create input according to type
  let inputNode: HTMLElement;

  if (question.type === 'likert5') {
    const stored = currentAnswer ?? 3;
    const labels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];
    const valueLabel = el('div', { class: 'subtitle' }, labels[stored - 1]);

    const input = el('input', {
      type: 'range',
      min: '1',
      max: '5',
      step: '1',
      value: String(stored),
      oninput: (ev: Event) => {
        const target = ev.target as HTMLInputElement;
        const value = parseInt(target.value, 10);
        onAnswer(value);
        valueLabel.textContent = labels[value - 1];
      },
    });

    inputNode = el('div', null, input, valueLabel);
  } else {
    // Yes/No/Maybe radio buttons
    const stored = currentAnswer ?? 'maybe';
    const options: [string, string][] = [
      ['yes', 'Yes'],
      ['no', 'No'],
      ['maybe', 'Maybe'],
    ];

    inputNode = el(
      'div',
      { class: 'radio-group' },
      ...options.map(([value, label]) => {
        const id = `${question.id}-${value}`;
        const radio = el('input', {
          type: 'radio',
          name: question.id,
          id,
          value,
          checked: stored === value ? 'checked' : null,
          onchange: () => onAnswer(value),
        });
        const lbl = el('label', { for: id }, label);
        return el('div', { class: 'radio-option' }, radio, lbl);
      })
    );
  }

  // Progress bar
  const bar = el(
    'div',
    { class: 'progress-bar' },
    el('div', { class: 'progress-bar-inner', style: `width: ${progress}%` })
  );

  // Buttons
  const controls = el('div', {
    style: 'margin-top:1rem; display:flex; justify-content: space-between;',
  });

  if (currentNum > 1) {
    const backBtn = el('button', { class: 'button', onclick: onBack }, 'Back');
    controls.appendChild(backBtn);
  } else {
    controls.appendChild(el('div', null));
  }

  const isLastQuestion = currentNum === total;
  const nextBtn = el(
    'button',
    { class: 'button', onclick: onNext },
    isLastQuestion ? 'Finish' : 'Next'
  );
  controls.appendChild(nextBtn);

  qCard.appendChild(qNumber);
  qCard.appendChild(qText);
  qCard.appendChild(inputNode);
  qCard.appendChild(bar);
  qCard.appendChild(controls);

  return qCard;
}

/**
 * Render results view
 */
export function renderResultsView(
  scores: Scores,
  overall: number,
  oneThing: OneThing,
  domainActions: Record<string, string[]>,
  videos: VideoRec[],
  articles: ArticleRec[],
  onExport: () => void,
  onCopyPrompt: () => void
): HTMLElement {
  const resultCard = el('div', { class: 'card' });
  resultCard.appendChild(el('h1', null, 'Your Personalised Report'));
  resultCard.appendChild(el('h2', null, `Overall Score: ${overall}%`));

  // Chart container
  const chartDiv = el('div', { class: 'chart-container' });

  // Create donut chart canvas
  const donutCanvas = el('canvas', { width: '300', height: '300' }) as HTMLCanvasElement;
  chartDiv.appendChild(donutCanvas);
  drawDonutChart(donutCanvas, scores);

  // Radar chart canvas
  const radarCanvas = el('canvas', { width: '300', height: '300' }) as HTMLCanvasElement;
  chartDiv.appendChild(radarCanvas);
  drawRadarChart(radarCanvas, scores);

  resultCard.appendChild(chartDiv);

  // One thing
  const oneThingCard = el('div', { class: 'card' });
  oneThingCard.appendChild(el('h2', null, 'The One Thing'));
  oneThingCard.appendChild(el('h3', null, oneThing.title));
  oneThingCard.appendChild(el('p', null, oneThing.description));
  const stepsList = el('ul', { class: 'info-list' });
  oneThing.steps.forEach((s) => {
    stepsList.appendChild(el('li', null, s));
  });
  oneThingCard.appendChild(stepsList);
  resultCard.appendChild(oneThingCard);

  // Domain actions
  const domainSection = el('div', { class: 'card' });
  domainSection.appendChild(el('h2', null, 'Domain-Specific Actions'));
  for (const domain of APP_CONFIG.CORE_DOMAINS) {
    const domainScore = scores[domain] ?? 0;
    const heading = el(
      'h3',
      null,
      `${domain.charAt(0).toUpperCase() + domain.slice(1)} (${domainScore}%)`
    );
    domainSection.appendChild(heading);
    const list = el('ul', { class: 'info-list' });
    domainActions[domain].forEach((a) => list.appendChild(el('li', null, a)));
    domainSection.appendChild(list);
  }
  resultCard.appendChild(domainSection);

  // Recommended videos
  if (videos.length > 0) {
    const videoSection = el('div', { class: 'card' });
    videoSection.appendChild(el('h2', null, 'Recommended Videos'));
    videos.forEach((vid) => {
      const card = el('div', { class: 'card' });
      card.style.marginBottom = '1rem';
      card.appendChild(el('h3', null, vid.title));
      card.appendChild(el('p', null, vid.tldr));
      const watch = el(
        'a',
        { href: vid.url, target: '_blank', class: 'button', style: 'margin-top:0.5rem;' },
        'Watch'
      );
      card.appendChild(watch);
      videoSection.appendChild(card);
    });
    resultCard.appendChild(videoSection);
  }

  // Recommended articles
  if (articles.length > 0) {
    const articleSection = el('div', { class: 'card' });
    articleSection.appendChild(el('h2', null, 'Recommended Articles'));
    articles.forEach((art) => {
      const card = el('div', { class: 'card' });
      card.style.marginBottom = '1rem';
      card.appendChild(el('h3', null, art.title));
      const meta = el('p', { class: 'subtitle' }, `${art.authors} (${art.year}) – ${art.source}`);
      card.appendChild(meta);
      const tldrList = el('ul', { class: 'info-list' });
      art.tldr.forEach((t) => tldrList.appendChild(el('li', null, t)));
      card.appendChild(tldrList);
      const tryList = el('ul', { class: 'info-list' });
      art.try_tomorrow.forEach((t) => tryList.appendChild(el('li', null, t)));
      card.appendChild(el('p', null, 'Try Tomorrow:'));
      card.appendChild(tryList);
      const readBtn = el(
        'a',
        { href: art.url, target: '_blank', class: 'button', style: 'margin-top:0.5rem;' },
        'Read'
      );
      card.appendChild(readBtn);
      articleSection.appendChild(card);
    });
    resultCard.appendChild(articleSection);
  }

  // Export and copy section
  const exportDiv = el('div', { class: 'export-buttons' });
  const exportBtn = el('button', { class: 'button', onclick: onExport }, 'Export JSON');
  const copyBtn = el('button', { class: 'button', onclick: onCopyPrompt }, 'Copy LLM Prompt');
  exportDiv.appendChild(exportBtn);
  exportDiv.appendChild(copyBtn);
  resultCard.appendChild(exportDiv);

  return resultCard;
}
