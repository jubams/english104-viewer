import './VocabResults.css';

function VocabResults({ results, onHome, onRetryWrong, onRetryAll, onNextSession }) {
  const { score, correct, total, answers, date } = results;
  const wrongAnswers = answers.filter(a => !a.correct);

  function getGrade() {
    if (score === 100) return { emoji: '🎯', label: 'Perfect!', color: '#10b981' };
    if (score >= 80) return { emoji: '🌟', label: 'Great Job!', color: '#10b981' };
    if (score >= 60) return { emoji: '👍', label: 'Good Effort!', color: '#f59e0b' };
    if (score >= 40) return { emoji: '📚', label: 'Keep Studying!', color: '#f59e0b' };
    return { emoji: '💪', label: 'Keep Going!', color: '#ef4444' };
  }

  const grade = getGrade();

  return (
    <div className="vocab-results">
      <div className="results-header">
        <div className="results-score-circle" style={{ borderColor: grade.color }}>
          <span className="results-score-number" style={{ color: grade.color }}>{score}%</span>
        </div>
        <div className="results-grade">
          <span className="results-emoji">{grade.emoji}</span>
          <h3>{grade.label}</h3>
        </div>
        <p className="results-summary">
          {correct} correct out of {total} questions
        </p>
        <p className="results-date">
          {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      <div className="results-actions">
        {onNextSession && (
          <button className="results-btn primary" onClick={onNextSession}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            Next Session
          </button>
        )}
        <button className="results-btn accent" onClick={onRetryAll}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          {onNextSession ? 'Restart All' : 'Retry All'}
        </button>
        {wrongAnswers.length > 0 && (
          <button className="results-btn warning" onClick={onRetryWrong}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            Retry Wrong ({wrongAnswers.length})
          </button>
        )}
        <button className="results-btn outline" onClick={onHome}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </button>
      </div>

      {wrongAnswers.length > 0 && (
        <div className="results-review">
          <h3>Review Wrong Answers</h3>
          <div className="review-list">
            {wrongAnswers.map((ans, i) => (
              <div key={i} className="review-item">
                <div className="review-definition">"{ans.correctDefinition}"</div>
                <div className="review-your-answer">
                  <span className="review-label">Your answer:</span>
                  <span className="review-wrong">{ans.selected}</span>
                </div>
                <div className="review-correct-answer">
                  <span className="review-label">Correct term:</span>
                  <span className="review-right">{ans.term}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default VocabResults;
