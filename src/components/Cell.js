import React from 'react';

function Cell({ value, isPulsing, onClick }) {
  return (
    <div 
    className={`cell ${value} ${isPulsing ? 'blink' : ''}`}
    onClick={onClick}
    >
      {value}
    </div>
  );
}

export default Cell;