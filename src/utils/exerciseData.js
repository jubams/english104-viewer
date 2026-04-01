let exerciseData = null;

async function loadExerciseData() {
  if (exerciseData) return exerciseData;

  try {
    const response = await fetch(`${import.meta.env.BASE_URL}exercises/index.json`);
    if (!response.ok) {
      throw new Error(`Failed to load index.json: ${response.status}`);
    }
    exerciseData = await response.json();
    return exerciseData;
  } catch (error) {
    console.error('Error loading exercise data:', error);
    exerciseData = { units: [] };
    return exerciseData;
  }
}

const UNIT_ORDER = [9, 10, 11, 12, 13, 14, 15, 1, 2, 3, 4];

export async function getAllUnits() {
  const data = await loadExerciseData();
  return data.units
    .map(unit => ({
      id: unit.id,
      name: unit.name,
      book: unit.id >= 9 ? 2 : 3
    }))
    .sort((a, b) => UNIT_ORDER.indexOf(a.id) - UNIT_ORDER.indexOf(b.id));
}

export async function getUnitById(id) {
  const data = await loadExerciseData();
  const unit = data.units.find(u => u.id === id);
  if (!unit) {
    console.warn(`Unit ${id} not found`);
    return null;
  }
  return unit;
}

export async function getUnitCount() {
  const data = await loadExerciseData();
  return data.units.length;
}

export { loadExerciseData };
