import { useState } from 'react';
import ImageViewer from './ImageViewer';
import ImageModal from './ImageModal';
import './ExerciseCard.css';

const BASE = import.meta.env.BASE_URL;

function ExerciseCard({ exercise, unitId }) {
  const [showSolutions, setShowSolutions] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const hasSolutions = exercise.solutions && exercise.solutions.length > 0;

  function openModal(src) {
    setModalImage(src);
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    setModalImage(null);
    document.body.style.overflow = '';
  }

  return (
    <div className="exercise-card">
      <h3>
        <span className="exercise-number">{exercise.number}</span>
        Exercise {exercise.number}
      </h3>

      <div className="exercise-questions">
        {exercise.parts.map((part, index) => (
          <div key={index} className="image-wrapper" onClick={() => openModal(`${BASE}exercises/unit-${unitId}/${part}`)}>
            <ImageViewer
              src={`${BASE}exercises/unit-${unitId}/${part}`}
              alt={`Exercise ${exercise.number} part ${index}`}
            />
            <div className="zoom-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </div>
          </div>
        ))}
      </div>

      {hasSolutions && (
        <div className="exercise-solutions">
          <button
            className={`toggle-btn ${showSolutions ? 'active' : ''}`}
            onClick={() => setShowSolutions(!showSolutions)}
          >
            {showSolutions ? 'Hide Answer' : 'Show Answer'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </button>

          {showSolutions && (
            <div className="solutions-container">
              {exercise.solutions.map((solution, index) => (
                <div key={index} className="image-wrapper" onClick={() => openModal(`${BASE}exercises/unit-${unitId}/${solution}`)}>
                  <ImageViewer
                    src={`${BASE}exercises/unit-${unitId}/${solution}`}
                    alt={`Exercise ${exercise.number} solution ${index + 1}`}
                    className="solution-image"
                  />
                  <div className="zoom-overlay">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modalImage && <ImageModal src={modalImage} onClose={closeModal} />}
    </div>
  );
}

export default ExerciseCard;
