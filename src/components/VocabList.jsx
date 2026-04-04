import { useState } from 'react';
import { getAllChapters, getMastery, resetMastery } from '../utils/vocabQuiz';
import './VocabList.css';

function VocabList({ onBack }) {
  const [expandedChapters, setExpandedChapters] = useState({});
  const [sortBy, setSortBy] = useState('weakness');
  const [confirmReset, setConfirmReset] = useState(false);

  const chapters = getAllChapters();
  const mastery = getMastery();

  function toggleChapter(key) {
    setExpandedChapters(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleReset() {
    if (confirmReset) {
      resetMastery();
      setConfirmReset(false);
      window.location.reload();
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
    }
  }

  function getMasteryLevel(term) {
    return mastery[term]?.mastery || 0;
  }

  function getMasteryColor(level) {
    if (level >= 80) return '#10b981';
    if (level >= 40) return '#f59e0b';
    if (level > 0) return '#f97316';
    return '#94a3b8';
  }

  function getMasteryLabel(level) {
    if (level >= 80) return 'Mastered';
    if (level >= 40) return 'Learning';
    if (level > 0) return 'New';
    return 'Not started';
  }

  function sortTerms(terms) {
    if (sortBy === 'weakness') {
      return [...terms].sort((a, b) => getMasteryLevel(a.term) - getMasteryLevel(b.term));
    }
    if (sortBy === 'alpha') {
      return [...terms].sort((a, b) => a.term.localeCompare(b.term));
    }
    return terms;
  }

  return (
    <div className="vocab-list">
      <div className="vocab-list-header">
        <button className="vocab-back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <h2>Vocabulary List</h2>
        <div className="list-controls">
          <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="weakness">Weakest First</option>
            <option value="alpha">A-Z</option>
          </select>
          <button className={`reset-mastery-btn ${confirmReset ? 'confirm' : ''}`} onClick={handleReset}>
            {confirmReset ? 'Click again to confirm' : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                Reset Progress
              </>
            )}
          </button>
        </div>
      </div>

      <div className="list-legend">
        <span className="legend-item"><span className="legend-dot mastered"></span> Mastered (80+)</span>
        <span className="legend-item"><span className="legend-dot learning"></span> Learning (40-79)</span>
        <span className="legend-item"><span className="legend-dot new-term"></span> New (1-39)</span>
        <span className="legend-item"><span className="legend-dot not-started"></span> Not Started</span>
      </div>

      {chapters.map(ch => {
        const terms = sortTerms(ch.vocabulary);
        const isExpanded = expandedChapters[ch.key];

        return (
          <div key={ch.key} className="list-chapter-section">
            <button className="list-chapter-header" onClick={() => toggleChapter(ch.key)}>
              <div className="list-chapter-info">
                <span className="list-chapter-label">{ch.label}</span>
                <span className="list-chapter-title">{ch.title}</span>
              </div>
              <div className="list-chapter-stats">
                <span className="list-chapter-count">{ch.vocabulary.length} terms</span>
                <svg className={`chevron ${isExpanded ? 'expanded' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </div>
            </button>

            {isExpanded && (
              <div className="list-terms">
                {terms.map(v => {
                  const level = getMasteryLevel(v.term);
                  const color = getMasteryColor(level);
                  const label = getMasteryLabel(level);
                  const termData = mastery[v.term];

                  return (
                    <div key={v.term} className="list-term-row">
                      <div className="list-term-main">
                        <div className="list-term-header">
                          <span className="list-term-name">{v.term}</span>
                          <span className="list-term-badge" style={{ color, borderColor: color }}>{label}</span>
                        </div>
                        <p className="list-term-definition">{v.definition}</p>
                        {termData && termData.attempts > 0 && (
                          <div className="list-term-meta">
                            <span>{termData.attempts} attempt{termData.attempts > 1 ? 's' : ''}</span>
                            {termData.lastCorrect && <span>Last correct: {new Date(termData.lastCorrect).toLocaleDateString()}</span>}
                            {termData.lastWrong && <span>Last wrong: {new Date(termData.lastWrong).toLocaleDateString()}</span>}
                          </div>
                        )}
                      </div>
                      <div className="list-term-mastery">
                        <div className="mastery-bar">
                          <div className="mastery-bar-fill" style={{ width: `${level}%`, backgroundColor: color }}></div>
                        </div>
                        <span className="mastery-value" style={{ color }}>{level}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default VocabList;
