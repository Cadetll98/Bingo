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


  // Check if a call wins the game
  function checkBingo(updatedBoard) {
    const winningCombinations = [
      // horizontals
      [0,1,2,3,4,5,6],
      [7,8,9,10,11,12,13],
      [14,15,16,17,18,19,20],
      [21,22,23,24,25,26,27],
      [28,29,30,31,32,33,34],
      [35,36,37,38,39,40,41],
      [42,43,44,45,46,47,48],
      // verticals
      [0,7,14,21,28,35,42],
      [1,8,15,22,29,36,43],
      [2,9,16,23,30,37,44],
      [3,10,17,24,31,38,45],
      [4,11,18,25,32,39,46],
      [5,12,19,26,33,40,47],
      [6,13,20,27,34,41,48],
      // diagonals
      [0,8,16,24,32,40,48],
      [6,12,18,24,30,36,42]
    ];

    // for each line, check if all called and belong to same non-empty player
    return winningCombinations.some(line => {
      const cells = line.map(i => updatedBoard[i]);

      if (!cells.every(cell => cell.called)) return false;

      const name = cells[0].player.trim().toLowerCase();
      if (!name) return false;  // empty names don’t count

      // all other names must match
      return cells.every(cell => cell.player.trim().toLowerCase() === name);  });
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


    // check if bingo
    if (checkBingo(updated)) {
      alert(`${updated[idx].player} BINGO! 🥳`);
    }

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
