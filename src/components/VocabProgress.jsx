import { useState } from 'react';
import { getAllChapters, getProgress, resetProgress } from '../utils/vocabQuiz';
import './VocabProgress.css';

function VocabProgress({ compact }) {
  const [expanded, setExpanded] = useState(false);
  const chapters = getAllChapters();
  const progress = getProgress();

  function handleReset() {
    if (window.confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      resetProgress();
      window.location.reload();
    }
  }

  const totalCorrect = Object.values(progress).reduce((sum, p) => sum + (p.correct || 0), 0);
  const totalQuestions = Object.values(progress).reduce((sum, p) => sum + (p.total || 0), 0);
  const overallScore = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  if (compact) {
    const completedCount = Object.values(progress).filter(p => p.completed).length;
    if (totalQuestions === 0) return null;

    return (
      <div className="vocab-progress-compact">
        <div className="progress-summary">
          <span className="progress-stat">
            <strong>{overallScore}%</strong> overall
          </span>
          <span className="progress-stat">
            <strong>{completedCount}/{chapters.length}</strong> chapters mastered
          </span>
        </div>
        <div className="progress-bar-mini">
          <div className="progress-bar-mini-fill" style={{ width: `${overallScore}%` }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="vocab-progress-panel">
      <div className="progress-panel-header">
        <h3>Your Progress</h3>
        <div className="progress-panel-actions">
          <button className="toggle-details-btn" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show Less' : 'Show Details'}
          </button>
          <button className="reset-btn" onClick={handleReset}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Reset
          </button>
        </div>
      </div>

      <div className="progress-overview">
        <div className="overview-card">
          <span className="overview-value">{overallScore}%</span>
          <span className="overview-label">Overall Score</span>
        </div>
        <div className="overview-card">
          <span className="overview-value">{totalCorrect}/{totalQuestions}</span>
          <span className="overview-label">Questions Answered</span>
        </div>
        <div className="overview-card">
          <span className="overview-value">{Object.values(progress).filter(p => p.completed).length}/{chapters.length}</span>
          <span className="overview-label">Chapters Mastered</span>
        </div>
      </div>

      {expanded && (
        <div className="progress-details">
          {chapters.map(ch => {
            const p = progress[ch.key];
            const score = p ? p.bestScore : 0;
            const attempts = p ? p.attempts : 0;

            return (
              <div key={ch.key} className="progress-chapter-row">
                <div className="progress-chapter-info">
                  <span className="progress-chapter-label">{ch.label}</span>
                  <span className="progress-chapter-title">{ch.title}</span>
                </div>
                <div className="progress-chapter-bar">
                  <div className="progress-chapter-fill" style={{ width: `${score}%` }}></div>
                </div>
                <div className="progress-chapter-stats">
                  <span className={`progress-badge ${score === 100 ? 'mastered' : score > 0 ? 'in-progress' : 'not-started'}`}>
                    {score === 100 ? 'Mastered' : score > 0 ? `${score}%` : 'Not Started'}
                  </span>
                  {attempts > 0 && <span className="progress-attempts">{attempts} attempt{attempts > 1 ? 's' : ''}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default VocabProgress;
