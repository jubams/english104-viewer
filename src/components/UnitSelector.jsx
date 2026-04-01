import './UnitSelector.css';

function UnitSelector({ units, currentUnit, onUnitSelect }) {
  const book2Units = units.filter(u => u.id >= 9);
  const book3Units = units.filter(u => u.id < 9);

  function renderBook(label, bookUnits) {
    return (
      <div className="book-group">
        <span className="book-label">{label}</span>
        <div className="unit-pills">
          {bookUnits.map(unit => (
            <button
              key={unit.id}
              className={`unit-pill ${unit.id === currentUnit?.id ? 'active' : ''}`}
              onClick={() => onUnitSelect(unit.id)}
            >
              {unit.id}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="unit-selector">
      {renderBook('Book 2', book2Units)}
      {renderBook('Book 3', book3Units)}
    </div>
  );
}

export default UnitSelector;
