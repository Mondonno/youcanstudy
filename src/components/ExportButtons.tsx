/**
 * Export Buttons Component - Provides export and action buttons for quiz results
 */

import React, { useState } from 'react';
import type { DiagnosticResults } from '../models/types';
import {
  exportResultsAsJSON,
  exportResultsAsPDF,
  generateLLMPrompt,
  copyToClipboard,
} from '../services/export.service';

interface ExportButtonsProps {
  results: DiagnosticResults;
  onReturnToIntro: () => void;
  onShowHistory: () => void;
  allQuestions?: any[];
  style?: React.CSSProperties;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ results, onReturnToIntro, onShowHistory, allQuestions, style }) => {
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleExportJSON = () => {
    try {
      exportResultsAsJSON(results);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export as JSON');
    }
  };

  const handleExportPDF = () => {
    try {
      exportResultsAsPDF(results);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export as PDF');
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
        results.recommendedArticles,
        allQuestions,
        results.answers
      );
      await copyToClipboard(prompt);
      alert('Prompt copied to clipboard!');
    } catch (error) {
      console.error('Copy failed:', error);
      alert('Failed to copy prompt');
    }
  };

  return (
    <>
      {/* Export and Action Buttons */}
      <div className="export-buttons" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '2rem', ...style }}>
        <button className="button" onClick={handleExportClick}>
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

      {/* Export Modal */}
      {showExportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div className="card" style={{
            maxWidth: '500px',
            margin: '20px',
          }}>
            <h2>Export Results</h2>
            <p>Choose your export format:</p>
            
            <div style={{ marginTop: '1.5rem' }}>
              <button 
                className="button" 
                onClick={handleExportJSON}
                style={{ 
                  width: '100%', 
                  marginBottom: '1rem',
                  backgroundColor: '#7c3aed'
                }}
              >
                📄 Export as JSON (Importable)
              </button>
              <p className="subtitle" style={{ marginTop: '-0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                Save as JSON to import later via History Manager
              </p>

              <button 
                className="button" 
                onClick={handleExportPDF}
                style={{ 
                  width: '100%',
                  marginBottom: '1rem',
                  backgroundColor: '#6366f1'
                }}
              >
                📑 Export as PDF
              </button>
              <p className="subtitle" style={{ marginTop: '-0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                Print or save as PDF for offline viewing
              </p>

              <button 
                className="button" 
                onClick={() => setShowExportModal(false)}
                style={{ 
                  width: '100%',
                  backgroundColor: '#6b7280'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportButtons;