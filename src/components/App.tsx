/**
 * Main App Component - React refactored version
 */

import React, { useState, useEffect } from 'react';
import type { AppData, Answers, DiagnosticResults } from '../models/types';
import { loadAppData } from '../services/data.service';
import IntroView from './IntroView';
import QuizView from './QuizView';
import ResultsView from './ResultsView';
import HistoryManager from './HistoryManager';
import { computeScores } from '../services/scoring.service';
import { computeFlags } from '../services/flags.service';
import {
  selectOneThing,
  selectDomainActions,
  recommendVideos,
  recommendArticles,
} from '../services/recommendation.service';
import { saveToHistory } from '../services/history.service';

type AppView = 'intro' | 'quiz' | 'results' | 'history';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('intro');
  const [appData, setAppData] = useState<AppData | null>(null);
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppData()
      .then((data) => {
        setAppData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load app data:', err);
        setError('Failed to load app data. Please refresh the page.');
        setLoading(false);
      });
  }, []);

  const handleStartQuiz = () => {
    setResults(null);
    setView('quiz');
  };

  const handleQuizComplete = (finalAnswers: Answers) => {
    if (!appData) return;

    // Compute scores
    const { scores, metaScores, overall } = computeScores(
      appData.coreQuestions,
      appData.metaQuestions,
      finalAnswers
    );

    // Compute flags
    const allQuestions = [...appData.coreQuestions, ...appData.metaQuestions];
    const flags = computeFlags(scores, metaScores, finalAnswers, allQuestions);

    // Generate recommendations
    const oneThing = selectOneThing(flags, scores);
    const domainActions = selectDomainActions(scores);
    const recommendedVideos = recommendVideos(appData.videos, flags);
    const recommendedArticles = recommendArticles(appData.articles, flags);

    // Create results object
    const diagnosticResults: DiagnosticResults = {
      answers: finalAnswers,
      scores,
      metaScores,
      flags,
      overall,
      oneThing,
      domainActions,
      recommendedVideos,
      recommendedArticles,
    };

    // Save to history
    try {
      saveToHistory(diagnosticResults);
    } catch (error) {
      console.error('Failed to save to history:', error);
    }

    setResults(diagnosticResults);
    setView('results');
  };

  const handleReturnToIntro = () => {
    setView('intro');
  };

  const handleShowHistory = () => {
    setView('history');
  };

  if (loading) {
    return (
      <div className="card">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <p>{error}</p>
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="card">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div>
      {view === 'intro' && (
        <IntroView 
          onStartQuiz={handleStartQuiz} 
          onShowHistory={handleShowHistory}
        />
      )}
      {view === 'quiz' && (
        <QuizView
          appData={appData}
          onComplete={handleQuizComplete}
          onCancel={handleReturnToIntro}
        />
      )}
      {view === 'results' && results && (
        <ResultsView
          results={results}
          onReturnToIntro={handleReturnToIntro}
          onShowHistory={handleShowHistory}
        />
      )}
      {view === 'history' && (
        <HistoryManager
          onReturnToIntro={handleReturnToIntro}
          onViewResult={(historyResults: DiagnosticResults) => {
            setResults(historyResults);
            setView('results');
          }}
        />
      )}
    </div>
  );
};

export default App;
