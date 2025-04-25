// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT || 4000;
const DATA_FILE = path.join(__dirname, 'board.json');

// All 50 states, excluding Maryland
const ALL_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado",
  "Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho",
  "Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana",
  "Maine","Maryland","Massachusetts","Michigan","Minnesota",
  "Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York",
  "North Carolina","North Dakota","Ohio","Oklahoma","Oregon",
  "Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington",
  "West Virginia","Wisconsin","Wyoming"
].filter(s => s !== "Maryland");

// Fisher–Yates shuffle
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateBoard() {
  const selected = shuffle(ALL_STATES).slice(0, 49);
  return selected.map(name => ({
    state: name,
    player: '',
    called: false
  }));
}

const app = express();
app.use(cors());
app.use(express.json());

// GET /board → read or generate
app.get('/board', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      // file missing or unreadable → create new
      const board = generateBoard();
      fs.writeFile(DATA_FILE, JSON.stringify(board, null, 2), () => {});
      return res.json(board);
    }
    try {
      const board = JSON.parse(data);
      return res.json(board);
    } catch {
      // invalid JSON → regenerate
      const board = generateBoard();
      fs.writeFile(DATA_FILE, JSON.stringify(board, null, 2), () => {});
      return res.json(board);
    }
  });
});

// POST /board → overwrite
app.post('/board', (req, res) => {
  const board = req.body;
  if (!Array.isArray(board) || board.length !== 49) {
    return res.status(400).json({ error: 'Invalid board format' });
  }
  fs.writeFile(DATA_FILE, JSON.stringify(board, null, 2), err => {
    if (err) {
      console.error('Write error:', err);
      return res.status(500).json({ error: 'Failed to write board' });
    }
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
