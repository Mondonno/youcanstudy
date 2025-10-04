/**
 * Intro View Component - Welcome screen with navigation
 */

import React from 'react';

interface IntroViewProps {
  onStartQuiz: () => void;
  onShowHistory: () => void;
}

const IntroView: React.FC<IntroViewProps> = ({ onStartQuiz, onShowHistory }) => {
  return (
    <div className="card">
      <h1>Learning Diagnostic</h1>
      <p>
        Welcome to the learning diagnostic tool. Answer a few short questions to receive 
        personalised recommendations on how to study more effectively.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className="button" onClick={onStartQuiz}>
          Start Quiz
        </button>
        <button className="button" onClick={onShowHistory} style={{ backgroundColor: '#6366f1' }}>
          View History
        </button>
      </div>
    </div>
  );
};

export default IntroView;
