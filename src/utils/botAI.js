// Bot AI with three difficulty levels for TicTacThree game

const WIN_PATTERNS = [
  [0,1,2], [3,4,5], [6,7,8], // Rows
  [0,3,6], [1,4,7], [2,5,8], // Columns
  [0,4,8], [2,4,6]           // Diagonals
];

// Check if a player can win in the next move
const findWinningMove = (board, player) => {
  for (let i = 0; i < board.length; i++) {
    if (!board[i]) {
      const testBoard = [...board];
      testBoard[i] = player;
      if (checkWinner(testBoard, player)) {
        return i;
      }
    }
  }
  return null;
};

// Check if there's a winner
const checkWinner = (board, player) => {
  return WIN_PATTERNS.some(([a, b, c]) =>
    board[a] === player && board[b] === player && board[c] === player
  );
};

// Count potential wins for a player
const evaluatePosition = (board, player, playerMarks, opponentMarks) => {
  let score = 0;

  WIN_PATTERNS.forEach(([a, b, c]) => {
    const line = [board[a], board[b], board[c]];
    const playerCount = line.filter(cell => cell === player).length;
    const opponentCount = line.filter(cell => cell === (player === 'X' ? 'O' : 'X')).length;

    if (opponentCount === 0) {
      score += playerCount * playerCount;
    }
    if (playerCount === 0 && opponentCount > 0) {
      score -= opponentCount * opponentCount;
    }
  });

  return score;
};

// EASY: Random valid moves
const getEasyMove = (board) => {
  const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(i => i !== null);
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};

// MEDIUM: Block opponent wins, try to win, prefer center and corners
const getMediumMove = (board, botSymbol, botMarks, playerMarks) => {
  const opponent = botSymbol === 'X' ? 'O' : 'X';

  // Try to win
  const winMove = findWinningMove(board, botSymbol);
  if (winMove !== null) return winMove;

  // Block opponent win
  const blockMove = findWinningMove(board, opponent);
  if (blockMove !== null) return blockMove;

  // Prefer center
  if (board[4] === null) return 4;

  // Prefer corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter(i => board[i] === null);
  if (availableCorners.length > 0) {
    return availableCorners[Math.floor(Math.random() * availableCorners.length)];
  }

  // Any available move
  return getEasyMove(board);
};

// HARD: Advanced strategy with mark management consideration
const getHardMove = (board, botSymbol, botMarks, playerMarks) => {
  const opponent = botSymbol === 'X' ? 'O' : 'X';

  // Try to win
  const winMove = findWinningMove(board, botSymbol);
  if (winMove !== null) return winMove;

  // Block opponent win
  const blockMove = findWinningMove(board, opponent);
  if (blockMove !== null) return blockMove;

  // Advanced strategy: Evaluate all possible moves
  let bestMove = null;
  let bestScore = -Infinity;

  board.forEach((cell, index) => {
    if (cell === null) {
      const testBoard = [...board];
      testBoard[index] = botSymbol;

      // Simulate mark management (remove oldest if at limit)
      const testBotMarks = [...botMarks, index];
      if (testBotMarks.length > 3) {
        const removed = testBotMarks[0];
        testBoard[removed] = null;
      }

      let score = evaluatePosition(testBoard, botSymbol, testBotMarks, playerMarks);

      // Bonus for center and corners
      if (index === 4) score += 3;
      if ([0, 2, 6, 8].includes(index)) score += 2;

      // Consider if this move would cause us to lose a mark
      if (botMarks.length === 3) {
        const wouldRemove = botMarks[0];
        // Check if removing this mark breaks a potential win
        const tempBoard = [...testBoard];
        tempBoard[wouldRemove] = null;
        const lossScore = evaluatePosition(tempBoard, botSymbol, botMarks.slice(1), playerMarks);
        score += (lossScore - score) * 0.5; // Penalize if removal is bad
      }

      if (score > bestScore) {
        bestScore = score;
        bestMove = index;
      }
    }
  });

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
