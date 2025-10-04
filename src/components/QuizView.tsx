/**
 * Quiz View Component - Handles the quiz flow
 */

import React, { useState, useEffect } from 'react';
import type { AppData, Answers } from '../models/types';
import { getLatestEntry } from '../services/history.service';

interface QuizViewProps {
  appData: AppData;
  onComplete: (answers: Answers) => void;
  onCancel: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ appData, onComplete, onCancel }) => {
  const [answers, setAnswers] = useState<Answers>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMetaPhase, setIsMetaPhase] = useState(false);

  const questions = !isMetaPhase ? appData.coreQuestions : appData.metaQuestions;
  const question = questions[currentIndex];
  const total = appData.coreQuestions.length + appData.metaQuestions.length;
  const currentNum = !isMetaPhase
    ? currentIndex + 1
    : appData.coreQuestions.length + currentIndex + 1;

  // Get previous answer if available
  const latestEntry = getLatestEntry();
  const previousAnswer = latestEntry?.results.answers[question?.id];

  useEffect(() => {
    // Initialize answer if not set
    if (question && answers[question.id] === undefined) {
      setAnswers((prev) => ({
        ...prev,
        [question.id]: question.type === 'likert5' ? 3 : 'maybe',
      }));
    }
  }, [question, answers]);

  const handleAnswer = (answer: any) => {
    if (!question) return;
    setAnswers((prev) => ({
      ...prev,
      [question.id]: answer,
    }));
  };

  const handleNext = () => {
    if (!question) return;

    // Ensure answer is set
    if (answers[question.id] === undefined) {
      setAnswers((prev) => ({
        ...prev,
        [question.id]: question.type === 'likert5' ? 3 : 'maybe',
      }));
    }

    // Check if we're at the end of current phase
    if (currentIndex + 1 >= questions.length) {
      if (!isMetaPhase) {
        // Move to meta phase
        setIsMetaPhase(true);
        setCurrentIndex(0);
      } else {
        // All done - complete quiz
        onComplete(answers);
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (isMetaPhase) {
      // Go back to end of core questions
      setIsMetaPhase(false);
      setCurrentIndex(appData.coreQuestions.length - 1);
    }
  };

  if (!question) {
    return <div className="card"><p>Loading...</p></div>;
  }

  const progress = ((currentNum - 1) / total) * 100;

  return (
    <div className="card">
      <div style={{ marginBottom: '1rem' }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e5e7eb',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#7c3aed',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>

      <h2>Question {currentNum} of {total}</h2>
      <p>{question.text}</p>

      {previousAnswer !== undefined && (
        <p style={{ fontStyle: 'italic', color: '#7c3aed', marginTop: '0.5rem' }}>
          Last time: {question.type === 'likert5'
            ? ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'][(previousAnswer as number) - 1]
            : previousAnswer}
        </p>
      )}

      <div style={{ margin: '2rem 0' }}>
        {question.type === 'likert5' ? (
          <Likert5Input
            questionId={question.id}
            value={typeof answers[question.id] === 'number' ? answers[question.id] as number : 3}
            onChange={handleAnswer}
          />
        ) : (
          <YesNoMaybeInput
            questionId={question.id}
            value={typeof answers[question.id] === 'string' ? answers[question.id] as string : 'maybe'}
            onChange={handleAnswer}
          />
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {(currentIndex > 0 || isMetaPhase) && (
            <button className="button" onClick={handleBack}>
              ← Back
            </button>
          )}
          <button className="button" onClick={handleNext}>
            {currentIndex + 1 >= questions.length && isMetaPhase ? 'Finish' : 'Next →'}
          </button>
        </div>
        <button 
          className="button" 
          onClick={onCancel}
          style={{ backgroundColor: '#6b7280' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

interface Likert5InputProps {
  questionId: string;
  value: number;
  onChange: (value: number) => void;
}

const Likert5Input: React.FC<Likert5InputProps> = ({ value, onChange }) => {
  const labels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

  return (
    <div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        style={{ width: '100%' }}
      />
      <div className="subtitle" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        {labels[value - 1]}
      </div>
    </div>
  );
};

interface YesNoMaybeInputProps {
  questionId: string;
  value: string;
  onChange: (value: string) => void;
}

const YesNoMaybeInput: React.FC<YesNoMaybeInputProps> = ({ questionId, value, onChange }) => {
  const options: [string, string][] = [
    ['yes', 'Yes'],
    ['no', 'No'],
    ['maybe', 'Maybe'],
  ];

  return (
    <div className="radio-group">
      {options.map(([val, label]) => (
        <label key={val} htmlFor={`${questionId}-${val}`}>
          <input
            type="radio"
            name={questionId}
            id={`${questionId}-${val}`}
            value={val}
            checked={value === val}
            onChange={() => onChange(val)}
          />
          {label}
        </label>
      ))}
    </div>
  );
};

export default QuizView;
