// Bot AI with three difficulty levels for TicTacThree game
// Key rule: Each player can only have 3 marks on the board at any time.
// When a 4th mark is placed, the oldest mark is automatically removed.

const WIN_PATTERNS = [
  [0,1,2], [3,4,5], [6,7,8], // Rows
  [0,3,6], [1,4,7], [2,5,8], // Columns
  [0,4,8], [2,4,6]           // Diagonals
];

// Check if there's a winner on the given board
const checkWinner = (board, player) => {
  return WIN_PATTERNS.some(([a, b, c]) =>
    board[a] === player && board[b] === player && board[c] === player
  );
};

// Simulate placing a mark and removing the oldest if necessary
// Returns { board, marks } after the move
const simulateMove = (board, marks, index, player) => {
  const newBoard = [...board];
  const newMarks = [...marks, index];
  newBoard[index] = player;

  // If player has more than 3 marks, remove the oldest
  if (newMarks.length > 3) {
    const removedIndex = newMarks.shift();
    newBoard[removedIndex] = null;
  }

  return { board: newBoard, marks: newMarks };
};

// Check if a player can win in the next move, accounting for mark removal
const findWinningMove = (board, player, playerMarks) => {
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      // Simulate the move with mark removal
      const result = simulateMove(board, playerMarks, i, player);
      if (checkWinner(result.board, player)) {
        return i;
      }
    }
  }
  return null;
};

// Check if opponent can win and if blocking actually works (considering our mark removal)
const findBlockingMove = (board, botSymbol, botMarks, playerMarks) => {
  const opponent = botSymbol === 'X' ? 'O' : 'X';

  // Find all positions where opponent could win
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      // Simulate opponent's move
      const { board: oppBoard } = simulateMove(board, playerMarks, i, opponent);
      if (checkWinner(oppBoard, opponent)) {
        // Opponent could win here - but can we actually block it?
        // Check if our block won't be immediately removed
        const { board: blockBoard } = simulateMove(board, botMarks, i, botSymbol);

        // After we block, check if opponent still can't win on their next turn
        // Our blocking mark won't be removed until our NEXT turn after this one
        // So the block is valid as long as the mark stays for at least one opponent turn
        if (blockBoard[i] === botSymbol) {
          return i;
        }
      }
    }
  }
  return null;
};

// Count potential wins for a player on a given board
const evaluatePosition = (board, player) => {
  const opponent = player === 'X' ? 'O' : 'X';
  let score = 0;

  WIN_PATTERNS.forEach(([a, b, c]) => {
    const line = [board[a], board[b], board[c]];
    const playerCount = line.filter(cell => cell === player).length;
    const opponentCount = line.filter(cell => cell === opponent).length;

    // Reward lines where we have marks and opponent doesn't
    if (opponentCount === 0) {
      if (playerCount === 3) score += 100; // Win!
      else if (playerCount === 2) score += 10;
      else if (playerCount === 1) score += 1;
    }
    // Penalize lines where opponent has advantage
    if (playerCount === 0) {
      if (opponentCount === 3) score -= 100; // Opponent wins
      else if (opponentCount === 2) score -= 10;
      else if (opponentCount === 1) score -= 1;
    }
  });

  return score;
};

// EASY: Random valid moves
const getEasyMove = (board) => {
  const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(i => i !== null);
  if (availableMoves.length === 0) return null;
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

// MEDIUM: Block opponent wins, try to win, prefer center and corners
// Now properly accounts for mark removal
const getMediumMove = (board, botSymbol, botMarks, playerMarks) => {
  // Try to win (accounting for our mark removal)
  const winMove = findWinningMove(board, botSymbol, botMarks);
  if (winMove !== null) return winMove;

  // Block opponent win (accounting for removal rules)
  const blockMove = findBlockingMove(board, botSymbol, botMarks, playerMarks);
  if (blockMove !== null) return blockMove;

  // Prefer center (if it won't be immediately removed)
  if (board[4] === null) {
    // Check if playing center makes sense
    const { board: testBoard } = simulateMove(board, botMarks, 4, botSymbol);
    if (testBoard[4] === botSymbol) {
      return 4;
    }
  }

  // Prefer corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => board[i] === null);
  if (availableCorners.length > 0) {
    // Pick a corner that won't immediately be removed
    for (const corner of availableCorners) {
      const { board: testBoard } = simulateMove(board, botMarks, corner, botSymbol);
      if (testBoard[corner] === botSymbol) {
        return corner;
      }
    }
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // Any available move
  return getEasyMove(board);
};

// HARD: Advanced strategy with full mark management consideration
const getHardMove = (board, botSymbol, botMarks, playerMarks) => {
  const opponent = botSymbol === 'X' ? 'O' : 'X';

  // First, check for immediate win
  const winMove = findWinningMove(board, botSymbol, botMarks);
  if (winMove !== null) return winMove;

  // Check if we need to block opponent
  const blockMove = findBlockingMove(board, botSymbol, botMarks, playerMarks);
  if (blockMove !== null) return blockMove;

  // Advanced strategy: Evaluate all possible moves with full simulation
  let bestMove = null;
  let bestScore = -Infinity;

  const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(i => i !== null);

  for (const index of availableMoves) {
    // Simulate our move
    const { board: boardAfterOurMove } = simulateMove(board, botMarks, index, botSymbol);

    // Check if we win immediately
    if (checkWinner(boardAfterOurMove, botSymbol)) {
      return index; // Immediate win
    }

    let score = evaluatePosition(boardAfterOurMove, botSymbol);

    // Bonus for center
    if (index === 4 && boardAfterOurMove[4] === botSymbol) score += 15;

    // Bonus for corners
    if ([0, 2, 6, 8].includes(index) && boardAfterOurMove[index] === botSymbol) score += 8;

    // Penalize if our move removes a strategically important mark
    if (botMarks.length >= 3) {
      const removedMark = botMarks[0];
      // Check if the removed mark was part of a potential winning line
      for (const [a, b, c] of WIN_PATTERNS) {
        if ([a, b, c].includes(removedMark)) {
          const lineMarks = [a, b, c].filter(pos =>
            botMarks.includes(pos) && pos !== removedMark
          );
          if (lineMarks.length >= 1) {
            score -= 5; // Penalize breaking potential lines
          }
        }
      }
    }

    // Look ahead: What's the best opponent response?
    let worstOpponentResponse = Infinity;
    const oppAvailableMoves = boardAfterOurMove.map((cell, idx) => cell === null ? idx : null).filter(i => i !== null);

    for (const oppIndex of oppAvailableMoves) {
      const { board: boardAfterOppMove } = simulateMove(boardAfterOurMove, playerMarks, oppIndex, opponent);

      // If opponent wins, this is very bad for us
      if (checkWinner(boardAfterOppMove, opponent)) {
        worstOpponentResponse = -1000;
        break;
      }

      const oppScore = evaluatePosition(boardAfterOppMove, botSymbol);
      if (oppScore < worstOpponentResponse) {
        worstOpponentResponse = oppScore;
      }
    }

    // Consider opponent's best response in our evaluation
    if (worstOpponentResponse !== Infinity) {
      score = score * 0.6 + worstOpponentResponse * 0.4;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove !== null ? bestMove : getEasyMove(board);
};

// Main function to get bot move based on difficulty
export const getBotMove = (board, difficulty, botSymbol, botMarks = [], playerMarks = []) => {
  // Add a small delay to make it feel more natural
  return new Promise((resolve) => {
    setTimeout(() => {
      let move;
      switch (difficulty) {
        case 'easy':
          move = getEasyMove(board);
          break;
        case 'medium':
          move = getMediumMove(board, botSymbol, botMarks, playerMarks);
          break;
        case 'hard':
          move = getHardMove(board, botSymbol, botMarks, playerMarks);
          break;
        default:
          move = getEasyMove(board);
      }
      resolve(move);
    }, 500 + Math.random() * 500); // 500-1000ms delay
  });
};

export const DIFFICULTY_INFO = {
  easy: {
    label: 'Easy',
    description: 'Random moves',
    color: '#4caf50',
    coinReward: 10
  },
  medium: {
    label: 'Medium',
    description: 'Smart strategy',
    color: '#ff9800',
    coinReward: 25
  },
  hard: {
    label: 'Hard',
    description: 'Expert tactics',
    color: '#f44336',
    coinReward: 50
  }
};
