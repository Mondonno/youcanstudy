/**
 * History Manager Component - Interactive history management
 */

import React, { useState, useEffect } from 'react';
import type { DiagnosticResults } from '../models/types';
import type { HistoryEntry } from '../services/history.service';
import {
  getHistory,
  deleteEntry,
  clearHistory,
  exportHistory,
  importHistory,
} from '../services/history.service';

interface HistoryManagerProps {
  onReturnToIntro: () => void;
  onViewResult: (results: DiagnosticResults) => void;
}

const HistoryManager: React.FC<HistoryManagerProps> = ({ onReturnToIntro, onViewResult }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const entries = getHistory();
    setHistory(entries);
    if (selectedEntry) {
      // Update selected entry if it still exists
      const updated = entries.find((e) => e.id === selectedEntry.id);
      setSelectedEntry(updated || null);
    }
  };

  const handleDelete = (id: string) => {
    deleteEntry(id);
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
    setShowConfirmDelete(null);
    loadHistory();
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete ALL history entries? This cannot be undone.')) {
      clearHistory();
      setHistory([]);
      setSelectedEntry(null);
    }
  };

  const handleExport = () => {
    try {
      exportHistory();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export history');
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const jsonData = event.target?.result as string;
          importHistory(jsonData);
          alert('History imported successfully!');
          loadHistory();
        } catch (error) {
          console.error('Import failed:', error);
          alert('Failed to import history. Please check the file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleViewResults = (entry: HistoryEntry) => {
    onViewResult(entry.results);
  };

  const getScoreSummary = (entry: HistoryEntry) => {
    const scores = entry.results.scores;
    const domains = Object.keys(scores);
    const avgScore = domains.reduce((sum, d) => sum + (scores[d] ?? 0), 0) / domains.length;
    return Math.round(avgScore);
  };

  return (
    <div className="card">
      <h1>Quiz History</h1>
      <p>View, manage, and compare your past quiz attempts.</p>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button className="button" onClick={onReturnToIntro} style={{ backgroundColor: '#10b981' }}>
          ← Back to Home
        </button>
        <button className="button" onClick={handleExport} disabled={history.length === 0}>
          Export History
        </button>
        <button className="button" onClick={handleImport}>
          Import History
        </button>
        {history.length > 0 && (
          <button 
            className="button" 
            onClick={handleClearAll}
            style={{ backgroundColor: '#ef4444', marginLeft: 'auto' }}
          >
            Clear All History
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>No History Yet</h3>
          <p>Take the quiz to create your first history entry, or import existing history.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          {/* History List */}
          <div>
            <h3>Past Attempts ({history.length})</h3>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="card"
                  style={{
                    marginBottom: '0.5rem',
                    cursor: 'pointer',
                    border: selectedEntry?.id === entry.id ? '2px solid #7c3aed' : '1px solid #e5e7eb',
                    backgroundColor: selectedEntry?.id === entry.id ? '#f3f4f6' : 'white',
                  }}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <div style={{ fontSize: '0.875rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                    <div style={{ marginTop: '0.5rem', color: '#7c3aed', fontWeight: 'bold' }}>
                      Avg Score: {getScoreSummary(entry)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Entry Details */}
          <div>
            {selectedEntry ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3>Entry Details</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="button"
                      onClick={() => handleViewResults(selectedEntry)}
                      style={{ backgroundColor: '#7c3aed' }}
                    >
                      View Full Results
                    </button>
                    {showConfirmDelete === selectedEntry.id ? (
                      <>
                        <button
                          className="button"
                          onClick={() => handleDelete(selectedEntry.id)}
                          style={{ backgroundColor: '#ef4444' }}
                        >
                          Confirm Delete
                        </button>
                        <button
                          className="button"
                          onClick={() => setShowConfirmDelete(null)}
                          style={{ backgroundColor: '#6b7280' }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="button"
                        onClick={() => setShowConfirmDelete(selectedEntry.id)}
                        style={{ backgroundColor: '#f59e0b' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h4>Date & Time</h4>
                  <p>{selectedEntry.date}</p>

                  <h4 style={{ marginTop: '1rem' }}>Domain Scores</h4>
                  {Object.entries(selectedEntry.results.scores).map(([domain, score]) => (
                    <div key={domain} style={{ marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold' }}>
                          {domain.charAt(0).toUpperCase() + domain.slice(1)}
                        </span>
                        <span style={{ color: '#7c3aed', fontWeight: 'bold' }}>{score}%</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: '#e5e7eb', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${score}%`,
                          height: '100%',
                          backgroundColor: '#7c3aed',
                          transition: 'width 0.3s ease'
                        }}></div>
                      </div>
                    </div>
                  ))}

                  <h4 style={{ marginTop: '1rem' }}>Overall Score</h4>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed', textAlign: 'center' }}>
                    {selectedEntry.results.overall}%
                  </div>

                  <h4 style={{ marginTop: '1rem' }}>Top Recommendation</h4>
                  <div className="card" style={{ backgroundColor: '#f9fafb' }}>
                    <h5 style={{ color: '#7c3aed' }}>{selectedEntry.results.oneThing.title}</h5>
                    <p style={{ fontSize: '0.875rem' }}>{selectedEntry.results.oneThing.description}</p>
                  </div>

                  <h4 style={{ marginTop: '1rem' }}>Answers Summary</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Total questions answered: {Object.keys(selectedEntry.results.answers).length}
                  </p>
                </div>
              </div>
            ) : (
              <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                <h3>Select an entry to view details</h3>
                <p>Click on any entry in the list to see more information.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryManager;
