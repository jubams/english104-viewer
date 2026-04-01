import ExerciseCard from './ExerciseCard';
import './ExerciseList.css';

function ExerciseList({ unit }) {
  if (!unit || !unit.exercises) {
    return <p>No exercises available for this unit.</p>;
  }

  return (
    <div className="exercise-list">
      <h2>{unit.name}</h2>
      {unit.exercises.map(exercise => (
        <ExerciseCard key={exercise.number} exercise={exercise} unitId={unit.id} />
      ))}
    </div>
  );
}

export default ExerciseList;
