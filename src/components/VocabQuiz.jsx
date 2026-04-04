import { useState, useCallback } from 'react';
import './VocabQuiz.css';

function VocabQuiz({ quiz, onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(quiz.currentIndex);
  const [answers, setAnswers] = useState(quiz.answers);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const question = quiz.questions[currentIndex];
  const progress = ((currentIndex) / quiz.questions.length) * 100;

  const handleSelect = useCallback((option, index) => {
    if (showFeedback) return;
    setSelectedOption(index);
    setShowFeedback(true);

    const correctTerm = question.options.find(o => o.correct)?.text || '';
    setAnswers(prev => [...prev, {
      term: correctTerm,
      selected: option.text,
      correctDefinition: question.definition,
      correct: option.correct,
      chapterKey: question.chapterKey,
      chapterTitle: question.chapterTitle,
    }]);
  }, [showFeedback, question]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= quiz.questions.length) {
      onComplete(answers);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  }, [currentIndex, quiz.questions.length, answers, onComplete]);

  return (
    <div className="vocab-quiz">
      <div className="quiz-header">
        <button className="quiz-back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="quiz-progress-info">
          <span className="quiz-counter">
            {quiz.mode === 'all' ? `Session ${quiz.sessionIndex + 1}` : ''}
            {' '}Question {currentIndex + 1} of {quiz.questions.length}
          </span>
          <span className="quiz-score">Score: {answers.filter(a => a.correct).length}/{answers.length}</span>
        </div>
      </div>

      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="quiz-card">
        <div className="quiz-definition">"{question.definition}"</div>
        <p className="quiz-prompt">Which term matches this definition?</p>

        <div className="quiz-options">
          {question.options.map((option, index) => {
            let optionClass = 'quiz-option';
            if (showFeedback) {
              if (option.correct) {
                optionClass += ' correct';
              } else if (index === selectedOption && !option.correct) {
                optionClass += ' wrong';
              }
            }

            return (
              <button
                key={index}
                className={optionClass}
                onClick={() => handleSelect(option, index)}
                disabled={showFeedback}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option.text}</span>
                {showFeedback && option.correct && (
                  <svg className="option-icon correct-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                {showFeedback && index === selectedOption && !option.correct && (
                  <svg className="option-icon wrong-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
              </button>
            );
          })}
        </div>

        {showFeedback && (
          <div className="quiz-feedback-actions">
            <button className="quiz-next-btn" onClick={handleNext}>
              {currentIndex + 1 >= quiz.questions.length ? 'See Results' : 'Next Question'}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default VocabQuiz;
