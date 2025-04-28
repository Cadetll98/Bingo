import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [board, setBoard] = useState([]);

  // On mount, fetch existing or generate anew on server
  useEffect(() => {
    fetch('/.netlify/functions/getBoard')
      .then(res => res.json())
      .then(setBoard)
      .catch(err => console.error('Fetch board failed:', err));
  }, []);

  // Update local board when typing
  function handleInputChange(idx, val) {
    setBoard(b =>
      b.map((cell, i) =>
        i === idx ? { ...cell, player: val } : cell
      )
    );
  }

  // “Call” a cell
  function handleCall(idx) {
    const cell = board[idx];
    if (cell.called) return;
    if (!cell.player.trim()) {
      alert('Please enter a name first.');
      return;
    }

    const updated = board.map((c, i) =>
      i === idx ? { ...c, called: true } : c
    );
    setBoard(updated);

    // persist to server
    fetch('/.netlify/functions/postBoard', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    }).catch(err => console.error('Save board failed:', err));
  }

  return (
    <div>
      <header>
        <h1>States Bingo</h1>
      </header>
      <div className="grid">
        {board.map((cell, i) => (
          <div key={i} className="cell">
            <div className="state-name">{cell.state}</div>
            <input
              type="text"
              value={cell.player}
              onChange={e => handleInputChange(i, e.target.value)}
              placeholder="Your name"
              disabled={cell.called}
            />
            <button
              onClick={() => handleCall(i)}
              disabled={cell.called}
            >
              {cell.called ? 'Called' : 'Call'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
