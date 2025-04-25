import React from 'react';

function Cell({ value, isPulsing, isWinner, onClick }) {
  return (
    <div 
      className={`cell ${value} ${isPulsing ? 'blink' : ''} ${isWinner ? 'winner' : ''}`} 
      onClick={onClick}
    >
      {value}
    </div>
  );
}

export default Cell;
