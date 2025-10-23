/**
 * Results View Component - Displays quiz results with charts and recommendations
 */

import React, { useEffect, useRef, useState } from 'react';
import type { DiagnosticResults, AppData } from '../models/types';
import { drawDonutChart, drawRadarChart } from '../utils/chart.utils';
import { APP_CONFIG } from '../config/app.config';
import ExportButtons from './ExportButtons';

interface ResultsViewProps {
  appData?: AppData;
  results: DiagnosticResults;
  onReturnToIntro: () => void;
  onShowHistory: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ appData, results, onReturnToIntro, onShowHistory }) => {
  const donutCanvasRef = useRef<HTMLCanvasElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  const [showAnswersDetails, setShowAnswersDetails] = useState(false);

  const getQuestionText = (questionId: string): string | null => {
    if (!appData) return null;
    
    const allQuestions = [...appData.coreQuestions, ...appData.metaQuestions];
    const question = allQuestions.find((q) => q.id === questionId);
    return question?.text || null;
  };

  const getAnswerLabel = (answer: number | string, questionId: string): string => {
    if (typeof answer === 'string') return answer;
    
    // Determine if this question is a likert5 or ynm type
    if (!appData) return String(answer);
    
    const allQuestions = [...appData.coreQuestions, ...appData.metaQuestions];
    const question = allQuestions.find((q) => q.id === questionId);
    
    if (question?.type === 'likert5') {
      const labels = ['', 'Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
      return labels[answer as number] || String(answer);
    } else if (question?.type === 'ynm') {
      const labels = ['', 'Yes', 'No', 'Maybe'];
      return labels[answer as number] || String(answer);
    }
    
    return String(answer);
  };

  useEffect(() => {
    const handleResize = () => {
      if (donutCanvasRef.current) {
        drawDonutChart(donutCanvasRef.current, results.scores, results.overall);
      }
      if (radarCanvasRef.current) {
        drawRadarChart(radarCanvasRef.current, results.scores);
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial draw
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [results]);

  return (
    <div className="card">
      <h1>Your Personalised Report</h1>

      <ExportButtons results={results} onReturnToIntro={onReturnToIntro} onShowHistory={onShowHistory} allQuestions={appData ? [...appData.coreQuestions, ...appData.metaQuestions] : undefined} style={{ marginTop: '1rem' }} />

      {/* Charts */}
      <div className="chart-container">
        <canvas ref={donutCanvasRef} width="800" height="600"></canvas>
        <canvas ref={radarCanvasRef} width="800" height="600"></canvas>
      </div>

      {/* One Thing */}
      <div className="card">
        <h2>The One Thing You Can Do Now!</h2>
        <h3>{results.oneThing.title}</h3>
        <p>{results.oneThing.description}</p>
        <p><i>{results.oneThing.reason}</i></p>
        <ul className="info-list">
          {results.oneThing.steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      </div>

      {/* Domain Actions */}
      <div className="card">
        <h2>Domain-Specific Actions</h2>
        {APP_CONFIG.CORE_DOMAINS.map((domain) => {
          const domainScore = results.scores[domain] ?? 0;
          const actions = results.domainActions[domain] || [];
          return (
            <div key={domain}>
              <h3>
                {domain.charAt(0).toUpperCase() + domain.slice(1)} ({domainScore}%)
              </h3>
              <ul className="info-list">
                {actions.map((action, idx) => (
                  <li key={idx}>{action}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Recommended Videos */}
      {results.recommendedVideos.length > 0 && (
        <div className="card">
          <h2>Recommended Videos</h2>
          {results.recommendedVideos.map((video) => (
            <div key={video.url} className="card" style={{ marginBottom: '1rem' }}>
              <h3>{video.title}</h3>
              <p>{video.tldr}</p>
              <p><i>{video.reason}</i></p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
                style={{ marginTop: '0.5rem' }}
              >
                Watch
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Recommended Articles */}
      {results.recommendedArticles.length > 0 && (
        <div className="card">
          <h2>Recommended Articles</h2>
          {results.recommendedArticles.map((article, idx) => (
            <div key={idx} className="card" style={{ marginBottom: '1rem' }}>
              <h3>{article.title}</h3>
              <p className="subtitle">
                {article.authors} ({article.year}) – {article.source}
              </p>
              <p><i>{article.reason}</i></p>
              <ul className="info-list">
                {article.tldr.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p style={{ fontWeight: 'bold', marginTop: '1rem' }}>Try Tomorrow:</p>
              <ul className="info-list">
                {article.try_tomorrow.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="button"
                style={{ marginTop: '0.5rem' }}
              >
                Read
              </a>
            </div>
          ))}
        </div>
      )}

      <ExportButtons results={results} onReturnToIntro={onReturnToIntro} onShowHistory={onShowHistory} allQuestions={appData ? [...appData.coreQuestions, ...appData.metaQuestions] : undefined} />

      {/* Collapsible Answers Details */}
      <div style={{ marginTop: '2rem' }}>
        <button
          className="button"
          onClick={() => setShowAnswersDetails(!showAnswersDetails)}
          style={{
            width: '100%',
            backgroundColor: '#8b5cf6',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>{showAnswersDetails ? '▼' : '▶'} View Detailed Answers</span>
        </button>

        {showAnswersDetails && (
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            maxHeight: '500px',
            overflowY: 'auto',
          }}>
            <h4 style={{ marginBottom: '1rem' }}>All Answers</h4>
            {Object.entries(results.answers).map(([questionId, answer]) => {
              const questionText = getQuestionText(questionId);
              const answerLabel = getAnswerLabel(answer, questionId);
              
              return (
                <div
                  key={questionId}
                  style={{
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <div style={{ fontSize: '0.875rem', color: '#374151', marginBottom: '0.25rem' }}>
                    <strong>Q:</strong> {questionText || questionId}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#7c3aed', fontWeight: 'bold' }}>
                    <strong>A:</strong> {answerLabel}
                  </div>
                </div>
              );
            })}
            {Object.keys(results.answers).length === 0 && (
              <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                No answers found for this attempt.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsView;
