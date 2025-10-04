/**
 * Results View Component - Displays quiz results with charts and recommendations
 */

import React, { useEffect, useRef } from 'react';
import type { DiagnosticResults } from '../models/types';
import { drawDonutChart, drawRadarChart } from '../utils/chart.utils';
import { APP_CONFIG } from '../config/app.config';
import {
  exportResultsAsJSON,
  generateLLMPrompt,
  copyToClipboard,
} from '../services/export.service';

interface ResultsViewProps {
  results: DiagnosticResults;
  onReturnToIntro: () => void;
  onShowHistory: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ results, onReturnToIntro, onShowHistory }) => {
  const donutCanvasRef = useRef<HTMLCanvasElement>(null);
  const radarCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (donutCanvasRef.current) {
      drawDonutChart(donutCanvasRef.current, results.scores, results.overall);
    }
    if (radarCanvasRef.current) {
      drawRadarChart(radarCanvasRef.current, results.scores);
    }
  }, [results]);

  const handleExport = () => {
    try {
      exportResultsAsJSON(results);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export results');
    }
  };

  const handleCopyPrompt = async () => {
    try {
      const prompt = generateLLMPrompt(
        results.scores,
        results.metaScores,
        results.flags,
        results.oneThing,
        results.domainActions,
        results.recommendedVideos,
        results.recommendedArticles
      );
      await copyToClipboard(prompt);
      alert('Prompt copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy prompt');
    }
  };

  return (
    <div className="card">
      <h1>Your Personalised Report</h1>

      {/* Charts */}
      <div className="chart-container">
        <canvas ref={donutCanvasRef} width="500" height="500"></canvas>
        <canvas ref={radarCanvasRef} width="500" height="500"></canvas>
      </div>

      {/* One Thing */}
      <div className="card">
        <h2>The One Thing</h2>
        <h3>{results.oneThing.title}</h3>
        <p>{results.oneThing.description}</p>
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

      {/* Export and Action Buttons */}
      <div className="export-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        <button className="button" onClick={handleExport}>
          Export Results
        </button>
        <button className="button" onClick={handleCopyPrompt}>
          Copy LLM Prompt
        </button>
        <button className="button" onClick={onShowHistory} style={{ backgroundColor: '#6366f1' }}>
          View History
        </button>
        <button 
          className="button" 
          onClick={onReturnToIntro}
          style={{ backgroundColor: '#10b981' }}
        >
          Take Quiz Again
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
