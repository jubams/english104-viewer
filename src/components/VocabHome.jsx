import { useState } from 'react';
import { getAllChapters, generateQuiz, updateTermMastery } from '../utils/vocabQuiz';
import VocabQuiz from './VocabQuiz';
import VocabResults from './VocabResults';
import VocabList from './VocabList';
import './VocabHome.css';

function VocabHome({ onBack }) {
  const [screen, setScreen] = useState('home');
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState(null);
  const [allSessionIndex, setAllSessionIndex] = useState(0);

  const chapters = getAllChapters();
  const book2 = chapters.filter(c => c.book === 2);
  const book3 = chapters.filter(c => c.book === 3);

  function toggleChapter(key) {
    setSelectedChapters(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  }

  function selectAll() {
    setSelectedChapters(chapters.map(c => c.key));
  }

  function startQuiz(mode, sessionIndex = 0) {
    let keys;
    if (mode === 'all') {
      keys = chapters.map(c => c.key);
    } else {
      keys = selectedChapters;
    }
    if (keys.length === 0) return;
    const quizData = generateQuiz(keys, mode, sessionIndex);
    setQuiz({ questions: quizData.questions, currentIndex: 0, answers: [], mode, totalTerms: quizData.totalTerms, sessionIndex: quizData.sessionIndex, isLastSession: quizData.isLastSession });
    setScreen('quiz');
  }

  function handleQuizComplete(answers) {
    for (const ans of answers) {
      updateTermMastery(ans.term, ans.correct);
    }

    const correct = answers.filter(a => a.correct).length;
    const total = answers.length;

    setResults({ answers, correct, total, score: Math.round((correct / total) * 100), date: new Date().toISOString() });
    setScreen('results');
  }

  function goHome() {
    setScreen('home');
    setQuiz(null);
    setResults(null);
    setSelectedChapters([]);
    setAllSessionIndex(0);
  }

  function retryWrong() {
    if (!results) return;
    const wrongTerms = results.answers
      .filter(a => !a.correct)
      .map(a => ({ term: a.term, definition: a.correctDefinition, chapterKey: a.chapterKey, chapterTitle: a.chapterTitle }));
    if (wrongTerms.length === 0) return;

    const allTerms = chapters.flatMap(ch => ch.vocabulary.map(v => ({ ...v, chapterKey: ch.key, chapterTitle: ch.title })));

    function shuffleArr(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    const questions = shuffleArr(wrongTerms).map(term => {
      const chapter = chapters.find(c => c.key === term.chapterKey);
      const chapterPool = chapter.vocabulary.map(v => ({ ...v, chapterKey: chapter.key, chapterTitle: chapter.title }));
      const distractors = shuffleArr(chapterPool.filter(t => t.term !== term.term)).slice(0, 3);
      const options = shuffleArr([
        { text: term.term, correct: true },
        ...distractors.map(d => ({ text: d.term, correct: false })),
      ]);
      return { definition: term.definition, options, chapterKey: term.chapterKey, chapterTitle: term.chapterTitle };
    });

    setQuiz({ questions, currentIndex: 0, answers: [], mode: 'retry', totalTerms: wrongTerms.length, sessionIndex: 0, isLastSession: true });
    setScreen('quiz');
    setResults(null);
  }

  function nextAllSession() {
    const nextIndex = allSessionIndex + 1;
    setAllSessionIndex(nextIndex);
    startQuiz('all', nextIndex);
  }

  if (screen === 'quiz') {
    return <VocabQuiz quiz={quiz} onComplete={handleQuizComplete} onBack={goHome} />;
  }

  if (screen === 'results') {
    return (
      <VocabResults
        results={results}
        onHome={goHome}
        onRetryWrong={retryWrong}
        onNextSession={quiz?.mode === 'all' && !quiz?.isLastSession ? nextAllSession : null}
        onRetryAll={() => {
          if (quiz?.mode === 'all') {
            startQuiz('all', 0);
          } else {
            const quizData = generateQuiz(selectedChapters, 'chapter');
            setQuiz({ questions: quizData.questions, currentIndex: 0, answers: [], mode: 'chapter', totalTerms: quizData.totalTerms, sessionIndex: 0, isLastSession: true });
          }
          setScreen('quiz');
          setResults(null);
        }}
      />
    );
  }

  if (screen === 'list') {
    return <VocabList onBack={() => setScreen('home')} />;
  }

  return (
    <div className="vocab-home">
      <div className="vocab-header">
        <button className="vocab-back-btn" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Exercises
        </button>
        <h2>Vocabulary</h2>
      </div>

      <div className="vocab-tabs">
        <button
          className={`vocab-tab ${screen === 'home' ? 'active' : ''}`}
          onClick={() => {}}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Quiz
        </button>
        <button
          className="vocab-tab"
          onClick={() => setScreen('list')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          Word List
        </button>
      </div>

      <div className="vocab-mode-section">
        <h3>Quick Start</h3>
        <div className="quick-actions">
          <button className="quick-btn all-chapters" onClick={() => startQuiz('all', 0)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <span>All Chapters</span>
            <small>{chapters.reduce((sum, c) => sum + c.vocabulary.length, 0)} terms · 20 per session</small>
          </button>
        </div>
      </div>

      <div className="vocab-chapter-section">
        <div className="section-header">
          <h3>Select Chapters</h3>
          <button className="select-all-btn" onClick={selectAll}>
            Select All
          </button>
        </div>

        {[
          { label: 'Book 2', items: book2 },
          { label: 'Book 3', items: book3 },
        ].map(group => (
          <div key={group.label} className="book-group">
            <span className="book-label">{group.label}</span>
            <div className="chapter-grid">
              {group.items.map(ch => {
                const checked = selectedChapters.includes(ch.key);
                return (
                  <label key={ch.key} className={`chapter-card ${checked ? 'checked' : ''}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleChapter(ch.key)}
                    />
                    <div className="chapter-card-content">
                      <span className="chapter-label">{ch.label}</span>
                      <span className="chapter-title">{ch.title}</span>
                      <span className="chapter-count">{ch.vocabulary.length} terms</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {selectedChapters.length > 0 && (
          <button
            className="start-quiz-btn"
            onClick={() => startQuiz('chapter')}
          >
            Start Quiz ({selectedChapters.length} chapter{selectedChapters.length > 1 ? 's' : ''}, {
              chapters.filter(c => selectedChapters.includes(c.key)).reduce((sum, c) => sum + c.vocabulary.length, 0)
            } terms)
          </button>
        )}
      </div>
    </div>
  );
}

export default VocabHome;
