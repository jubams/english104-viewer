import { useState, useEffect } from 'react';
import { getAllUnits, getUnitById } from '../utils/exerciseData';
import UnitSelector from './UnitSelector';
import ExerciseList from './ExerciseList';
import VocabHome from './VocabHome';
import './App.css';

function App() {
  const [units, setUnits] = useState([]);
  const [currentUnit, setCurrentUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('exercises');

  useEffect(() => {
    async function loadData() {
      const unitsData = await getAllUnits();
      setUnits(unitsData);
      if (unitsData.length > 0) {
        const firstUnit = await getUnitById(unitsData[0].id);
        setCurrentUnit(firstUnit);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  async function handleUnitSelect(unitId) {
    const unit = await getUnitById(unitId);
    setCurrentUnit(unit);
  }

  async function handlePrevUnit() {
    const currentIndex = units.findIndex(u => u.id === currentUnit.id);
    if (currentIndex > 0) {
      const unit = await getUnitById(units[currentIndex - 1].id);
      setCurrentUnit(unit);
    }
  }

  async function handleNextUnit() {
    const currentIndex = units.findIndex(u => u.id === currentUnit.id);
    if (currentIndex < units.length - 1) {
      const unit = await getUnitById(units[currentIndex + 1].id);
      setCurrentUnit(unit);
    }
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading exercises...</p>
      </div>
    );
  }

  const currentBook = currentUnit?.id >= 9 ? 'Book 2' : 'Book 3';
  const currentIndex = units.findIndex(u => u.id === currentUnit?.id);
  const bookUnits = units.filter(u => (u.id >= 9) === (currentUnit?.id >= 9));
  const bookIndex = bookUnits.findIndex(u => u.id === currentUnit?.id);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div className="book-badge">{currentBook}</div>
          <h1>English104</h1>
        </div>
        <div className="mode-tabs">
          <button
            className={`mode-tab ${mode === 'exercises' ? 'active' : ''}`}
            onClick={() => setMode('exercises')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Exercises
          </button>
          <button
            className={`mode-tab ${mode === 'vocabulary' ? 'active' : ''}`}
            onClick={() => setMode('vocabulary')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Vocabulary
          </button>
        </div>
        {mode === 'exercises' && (
          <div className="unit-selector-wrapper">
            <UnitSelector
              units={units}
              currentUnit={currentUnit}
              onUnitSelect={handleUnitSelect}
            />
          </div>
        )}
      </header>

      <main className="app-main">
        {mode === 'exercises' && currentUnit && (
          <div>
            <div className="unit-navigation">
              <button
                className="nav-btn"
                onClick={handlePrevUnit}
                disabled={currentIndex === 0}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Previous
              </button>
              <div className="unit-info">
                <span className="unit-label">Unit {currentUnit.id}</span>
                <span className="unit-progress">{bookIndex + 1} / {bookUnits.length} in {currentBook}</span>
              </div>
              <button
                className="nav-btn"
                onClick={handleNextUnit}
                disabled={currentIndex === units.length - 1}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>

            <div className="book-divider">
              {currentUnit.id >= 9 ? 'End of Book 2' : 'Start of Book 3'}
            </div>

            <ExerciseList key={currentUnit.id} unit={currentUnit} />
          </div>
        )}
        {mode === 'vocabulary' && (
          <VocabHome onBack={() => setMode('exercises')} />
        )}
      </main>
    </div>
  );
}

export default App;
