import React, { useEffect, useState, useCallback } from 'react';
import Board from './components/Board';
import Modals from './components/Modals';
import TopInfo from './components/TopInfo';
import Controls from './components/Controls';
import HostJoinModals from './components/HostJoinModals';
import HomeScreen from './components/HomeScreen';
import Auth from './components/Auth';
import OnlineMatchmaking from './components/OnlineMatchmaking';
import Settings from './components/Settings';
import StatsModal from './components/StatsModal';
import Leaderboard from './components/Leaderboard';
import CoinDisplay from './components/CoinDisplay';
import Shop from './components/Shop';
import FriendsList from './components/FriendsList';
import './styles/App.css';
import { db } from './firebase';
import { doc, updateDoc, onSnapshot, arrayUnion, getDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { getBotMove } from './utils/botAI';
import { getCoins, getStats, awardCoins, updateStats, resetAllData, setCoins as setLocalCoins } from './utils/coinsManager';
import { soundManager } from './utils/soundManager';
import { updateRankAfterOnlineMatch, ensureSeasonForUser, getCurrentSeasonId } from './utils/rankManager';
import {
  rollMysteryReward,
  canClaimDailyBox,
  dailyCooldownMs,
  duplicateToCoins,
  getLocalBoxState,
  saveLocalBoxState,
  getDailyBoxOpenState,
  normalizeDailyBoxOpenState
} from './utils/mysteryBoxManager';
import {
  onAuthStateChange,
  signOutUser,
  getCurrentUserId,
  isGuest as checkIsGuest,
  getUserData,
  updateUserCoins,
  syncGuestDataToUser
} from './utils/authManager';
import { leaveQueue } from './utils/matchmaking';
import { updateHeadToHeadForFriends, listenFriendRequests, listenGameInvites } from './utils/friendsManager';

function App() {
  // Auth state
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [gameState, setGameState] = useState({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    startingPlayer: 'X',
    gameActive: true,
    xScore: 0,
    oScore: 0,
    playerXMarks: [],
    playerOMarks: [],
    markToRemoveIndex: null,
    winningLine: [],
    showRules: false,
    showWinModal: false,
    winMessage: ''
  });

  // Game mode: 'home', 'local', 'bot', 'online', 'matchmaking'
  const [gameMode, setGameMode] = useState('home');
  const [botDifficulty, setBotDifficulty] = useState(null);

  // Coins and stats
  const [coins, setCoins] = useState(getCoins());
  const [stats, setStats] = useState(getStats());
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [rankInfo, setRankInfo] = useState({
    rank: 'Bronze',
    seasonScore: 0,
    seasonId: getCurrentSeasonId(),
    seasonStats: { wins: 0, losses: 0, gamesPlayed: 0 }
  });
  const [rankUpFlash, setRankUpFlash] = useState(false);
  const [processedResultId, setProcessedResultId] = useState(null);
  const [mysteryBoxes, setMysteryBoxes] = useState(0);
  const [boxWinProgress, setBoxWinProgress] = useState(0);
  const [lastDailyBoxClaim, setLastDailyBoxClaim] = useState(null);
  const [dailyBoxOpens, setDailyBoxOpens] = useState(getDailyBoxOpenState());
  const [boxOpening, setBoxOpening] = useState(false);
  const [boxReward, setBoxReward] = useState(null);
  const [shopInitialView, setShopInitialView] = useState('store');
  const [friendRequestCount, setFriendRequestCount] = useState(0);
  const [inviteCount, setInviteCount] = useState(0);
  const [latestInviteName, setLatestInviteName] = useState('');

  const DAILY_BOX_OPEN_LIMIT = 3;

  const persistBoxState = async (boxes, progress, lastClaim, dailyOpens = dailyBoxOpens) => {
    const normalizedDaily = normalizeDailyBoxOpenState(dailyOpens?.date, dailyOpens?.count);

    setMysteryBoxes(boxes);
    setBoxWinProgress(progress);
    setLastDailyBoxClaim(lastClaim);
    setDailyBoxOpens(normalizedDaily);

    if (user && !checkIsGuest(user)) {
      await updateDoc(doc(db, 'users', user.uid), {
        mysteryBoxes: boxes,
        boxWinProgress: progress,
        lastMysteryBoxClaim: lastClaim || null,
        dailyBoxOpenCount: normalizedDaily.count,
        dailyBoxOpenDate: normalizedDaily.date
      });
    } else {
      saveLocalBoxState(boxes, progress, lastClaim, normalizedDaily);
    }
  };

  const applyWinTowardBox = async () => {
    const nextProgress = boxWinProgress + 1;
    let newBoxes = mysteryBoxes;
    let progress = nextProgress;
    if (nextProgress >= 5) {
      newBoxes += 1;
      progress = nextProgress - 5;
      soundManager.playCoin();
    }
    await persistBoxState(newBoxes, progress, lastDailyBoxClaim);
  };

  const handleClaimDailyBox = async () => {
    if (!canClaimDailyBox(lastDailyBoxClaim)) return;
    const now = Date.now();
    soundManager.playCoin();
    await persistBoxState(mysteryBoxes + 1, boxWinProgress, now);
  };

  const handleOpenMysteryBox = async () => {
    if (boxOpening || mysteryBoxes <= 0) return;

    const todayOpens = normalizeDailyBoxOpenState(dailyBoxOpens.date, dailyBoxOpens.count);
    setDailyBoxOpens(todayOpens);

    if (todayOpens.count >= DAILY_BOX_OPEN_LIMIT) {
      soundManager.playClick();
      setBoxReward({ type: 'limit' });
      return;
    }

    const nextDailyOpens = { date: todayOpens.date, count: todayOpens.count + 1 };
    setBoxOpening(true);
    setBoxReward(null);
    soundManager.playClick();

    setTimeout(async () => {
      const reward = rollMysteryReward(userInventory);
      let coinsToGrant = 0;
      let inventoryToSet = [...userInventory];
      let grantedItem = null;

      if (reward.type === 'cosmetic') {
        if (inventoryToSet.includes(reward.item.id)) {
          const fallback = duplicateToCoins();
          coinsToGrant = fallback.coins;
        } else {
          grantedItem = reward.item;
          inventoryToSet.push(reward.item.id);
        }
      } else {
        coinsToGrant = reward.coins;
      }

      if (coinsToGrant > 0) {
        setCoins((prev) => {
          const total = prev + coinsToGrant;
          if (!user || checkIsGuest(user)) {
            setLocalCoins(total);
          }
          return total;
        });
      }

      if (grantedItem) {
        setUserInventory(inventoryToSet);
        if (user && !checkIsGuest(user)) {
          await updateDoc(doc(db, 'users', user.uid), {
            inventory: arrayUnion(grantedItem.id)
          });
        }
      }

      await persistBoxState(mysteryBoxes - 1, boxWinProgress, lastDailyBoxClaim, nextDailyOpens);
      setDailyBoxOpens(nextDailyOpens);
      setBoxReward(grantedItem ? { type: 'cosmetic', item: grantedItem } : { type: 'coins', coins: coinsToGrant });
      soundManager.playCoin();
      setBoxOpening(false);
    }, 650);
  };

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  // Avatar and inventory
  const [userInventory, setUserInventory] = useState(['frame_basic', 'bg_none']);
  const [userAvatar, setUserAvatar] = useState({
    frame: 'frame_basic',
    background: 'bg_none'
  });

  // Local game state
  const [localXScore, setLocalXScore] = useState(0);
  const [localOScore, setLocalOScore] = useState(0);

  // Online game state
  const [onlineXScore, setOnlineXScore] = useState(0);
  const [onlineOScore, setOnlineOScore] = useState(0);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [hostRoomId, setHostRoomId] = useState(nanoid(4).toUpperCase());
  const [joinRoomId, setJoinRoomId] = useState('');
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [opponentId, setOpponentId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [playerXName, setPlayerXName] = useState('Player X');
  const [playerOName, setPlayerOName] = useState('Player O');

  // Bot state
  const [isBotThinking, setIsBotThinking] = useState(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      setAuthLoading(false);

      // Load coins, inventory, avatar, rank, and boxes for authenticated users
      if (firebaseUser && !firebaseUser.isAnonymous) {
        const userData = await getUserData(firebaseUser.uid);
        const seasonState = await ensureSeasonForUser(firebaseUser.uid);

        if (userData.success) {
          setCoins(userData.data.coins || 0);
          setUserInventory(userData.data.inventory || ['frame_basic', 'bg_none']);
          setUserAvatar({
            frame: userData.data.equippedFrame || 'frame_basic',
            background: userData.data.equippedBackground || 'bg_none'
          });

          const rank = seasonState?.rank || userData.data.rank || 'Bronze';
          const seasonScore = seasonState?.seasonScore ?? userData.data.seasonScore ?? 0;
          const seasonStats = seasonState?.seasonStats || userData.data.seasonStats || {
            seasonId: getCurrentSeasonId(),
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
            lossStreak: 0,
            winRate: 0,
            seasonScore: seasonScore
          };
          setRankInfo({
            rank,
            seasonScore,
            seasonStats,
            seasonId: seasonStats.seasonId || getCurrentSeasonId(),
            lastSeasonRank: seasonState?.lastSeasonRank || userData.data.lastSeasonRank || null
          });

          setMysteryBoxes(userData.data.mysteryBoxes || 0);
          setBoxWinProgress(userData.data.boxWinProgress || 0);
          setLastDailyBoxClaim(userData.data.lastMysteryBoxClaim || null);
          setDailyBoxOpens(normalizeDailyBoxOpenState(userData.data.dailyBoxOpenDate, userData.data.dailyBoxOpenCount));
        }
      } else {
        // Load from localStorage for guests
        setCoins(getCoins());
        setRankInfo({
          rank: 'Bronze',
          seasonScore: 0,
          seasonId: getCurrentSeasonId(),
          seasonStats: { wins: 0, losses: 0, gamesPlayed: 0 }
        });

        const localBoxState = getLocalBoxState();
        setMysteryBoxes(localBoxState.boxes);
        setBoxWinProgress(localBoxState.progress);
        setLastDailyBoxClaim(localBoxState.lastClaim);
        setDailyBoxOpens(localBoxState.dailyOpens);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || checkIsGuest(user)) {
      setFriendRequestCount(0);
      setInviteCount(0);
      setLatestInviteName('');
      return () => {};
    }

    const unsubReq = listenFriendRequests(user.uid, (requests) => {
      setFriendRequestCount(requests.length);
    });

    const unsubInv = listenGameInvites(user.uid, (invites) => {
      setInviteCount(invites.length);
      setLatestInviteName(invites[0]?.fromDisplayName || '');
    });

    return () => {
      unsubReq && unsubReq();
      unsubInv && unsubInv();
    };
  }, [user]);

  useEffect(() => {
    if (gameMode !== 'online' || !roomId || !user || checkIsGuest(user)) return;
    if (!gameState.showWinModal && gameState.gameActive) return;

    const processRivalry = async () => {
      const roomSnap = await getDoc(doc(db, 'rooms', roomId));
      const roomData = roomSnap.data();
      if (!roomData || roomData.status !== 'finished') return;

      const userId = getCurrentUserId(user);
      const isX = roomData.playerX === userId;
      const isO = roomData.playerO === userId;
      if (!isX && !isO) return;

      const opponent = isX ? roomData.playerO : roomData.playerX;
      setOpponentId(opponent);

      const resultKey = `${roomId}-${roomData.winner || 'none'}`;
      if (processedResultId === resultKey) return;

      let outcome = 'draw';
      if (roomData.winner && roomData.winner !== 'draw') {
        const userWon = (roomData.winner === 'X' && isX) || (roomData.winner === 'O' && isO);
        outcome = userWon ? 'win' : 'loss';
      }

      setProcessedResultId(resultKey);
      await updateHeadToHeadForFriends(userId, opponent, outcome);
    };

    processRivalry();
  }, [gameMode, roomId, user, gameState.showWinModal, gameState.gameActive, processedResultId]);

  // Sync coins to Firestore for authenticated users
  useEffect(() => {
    if (user && !checkIsGuest(user)) {
      updateUserCoins(user.uid, coins);
    }
  }, [coins, user]);

  // Online game listeners
  useEffect(() => {
    if (!roomId) return;
    const unsub = onSnapshot(doc(db, 'rooms', roomId), (docSnap) => {
      const data = docSnap.data();
      if (!data) return;

      if (data.playerX && data.playerO) {
        const inferredOpponent = playerSymbol === 'X' ? data.playerO : playerSymbol === 'O' ? data.playerX : null;
        if (inferredOpponent && inferredOpponent !== opponentId) {
          setOpponentId(inferredOpponent);
        }
      }

      if (data.status === 'left' && data.leftBy !== playerSymbol) {
        setOpponentLeft(true);
        setTimeout(() => {
          leaveGameCleanup();
        }, 2000);
      }

      if (data.rematchRequested) {
        handleRematch(data.winner);
        updateDoc(doc(db, 'rooms', roomId), {
          rematchRequested: null,
          winner: null
        });
      }
    });
    return () => unsub();
  }, [roomId, playerSymbol, opponentId]);

  // Bot move handler
  useEffect(() => {
    if (gameMode === 'bot' && gameState.currentPlayer === 'O' && gameState.gameActive && !isBotThinking) {
      setIsBotThinking(true);
      getBotMove(
        gameState.board,
        botDifficulty,
        'O',
        gameState.playerOMarks,
        gameState.playerXMarks
      ).then((move) => {
        if (move !== null && move !== undefined) {
          handleBotMove(move);
        }
        setIsBotThinking(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.currentPlayer, gameMode, gameState.gameActive, isBotThinking]);

  const handleBotMove = (index) => {
    if (!gameState.gameActive || gameState.board[index]) return;

    soundManager.playMove();

    const updatedBoard = [...gameState.board];
    updatedBoard[index] = 'O';

    let newPlayerOMarks = [...gameState.playerOMarks, index];
    if (newPlayerOMarks.length > 3) {
      const removed = newPlayerOMarks.shift();
      updatedBoard[removed] = null;
    }

    const winPatterns = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];

    let winner = null;
    let winningLine = [];
    for (const pattern of winPatterns) {
      const [a,b,c] = pattern;
      if (updatedBoard[a] && updatedBoard[a] === updatedBoard[b] && updatedBoard[a] === updatedBoard[c]) {
        winner = updatedBoard[a];
        winningLine = pattern;
        break;
      }
    }

    const isDraw = !winner && updatedBoard.every(cell => cell !== null);

    if (winner) {
      soundManager.playLoss();
      const result = 'loss'; // Bot won, so player lost
      const coinReward = awardCoins(result, 'bot', botDifficulty);
      setCoins(coinReward.totalCoins);
      setCoinsEarned(coinReward.coinsAdded);
      setTimeout(() => setCoinsEarned(0), 2000);
      updateStats(result, 'bot', botDifficulty);
      setStats(getStats());
    } else if (isDraw) {
      soundManager.playDraw();
      const coinReward = awardCoins('draw', 'bot', botDifficulty);
      setCoins(coinReward.totalCoins);
      setCoinsEarned(coinReward.coinsAdded);
      setTimeout(() => setCoinsEarned(0), 2000);
      updateStats('draw', 'bot', botDifficulty);
      setStats(getStats());
    }

    setGameState(prev => ({
      ...prev,
      board: updatedBoard,
      playerOMarks: newPlayerOMarks,
      playerXMarks: prev.playerXMarks,
      markToRemoveIndex: newPlayerOMarks.length === 3 ? newPlayerOMarks[0] : null,
      currentPlayer: 'X',
      gameActive: !winner && !isDraw,
      showWinModal: winner || isDraw,
      winMessage: winner ? 'Bot wins!' : isDraw ? "It's a draw!" : '',
      winningLine: winningLine
    }));
  };

  const leaveGameCleanup = async () => {
    // Leave matchmaking queue if in it
    if (user) {
      await leaveQueue(getCurrentUserId(user));
    }
    setRoomId(null);
    setPlayerSymbol(null);
    setGameStarted(false);
    setOpponentLeft(false);
    resetBoardFull();
    setGameMode('home');
  };

  const resetBoardFull = () => {
    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      playerXMarks: [],
      playerOMarks: [],
      markToRemoveIndex: null,
      winningLine: [],
      showRules: false,
      showWinModal: false,
      winMessage: '',
      gameActive: true
    }));
  };

  const handleRematch = async (lastWinner) => {
    const nextStarter = lastWinner === 'X' ? 'O' : lastWinner === 'O' ? 'X' : gameState.startingPlayer === 'X' ? 'O' : 'X';
    let newXScore = 0;
    let newOScore = 0;

    if (!roomId || gameMode === 'bot' || gameMode === 'local') {
      newXScore = lastWinner === 'X' ? localXScore + 1 : localXScore;
      newOScore = lastWinner === 'O' ? localOScore + 1 : localOScore;
      setLocalXScore(newXScore);
      setLocalOScore(newOScore);
    } else {
      newXScore = lastWinner === 'X' ? onlineXScore + 1 : onlineXScore;
      newOScore = lastWinner === 'O' ? onlineOScore + 1 : onlineOScore;
      setOnlineXScore(newXScore);
      setOnlineOScore(newOScore);
    }

    if (roomId) {
      await updateDoc(doc(db, 'rooms', roomId), {
        rematchRequested: null,
        board: Array(9).fill(null),
        winner: null,
        currentPlayer: nextStarter,
        playerXMarks: [],
        playerOMarks: [],
        markToRemoveIndex: null
      });
    }

    setGameState(prev => ({
      ...prev,
      board: Array(9).fill(null),
      playerXMarks: [],
      playerOMarks: [],
      markToRemoveIndex: null,
      winningLine: [],
      winMessage: '',
      showWinModal: false,
      gameActive: true,
      xScore: newXScore,
      oScore: newOScore,
      currentPlayer: nextStarter,
      startingPlayer: nextStarter
    }));
  };

  const handlePlayAgain = async () => {
    soundManager.playClick();

    if (roomId) {
      const lastWinner = gameState.winMessage.includes('X') ? 'X' :
                         gameState.winMessage.includes('O') ? 'O' : null;

      await updateDoc(doc(db, 'rooms', roomId), {
        rematchRequested: true,
        winner: lastWinner || null
      });
    } else {
      const lastWinner = gameState.winMessage.includes('X') ? 'X' :
                         gameState.winMessage.includes('O') ? 'O' : null;

      if (gameMode === 'local' || gameMode === 'bot') {
        if (lastWinner === 'X') setLocalXScore(prev => prev + 1);
        if (lastWinner === 'O') setLocalOScore(prev => prev + 1);
      }

      const nextStarter = lastWinner === 'X' ? 'O' : lastWinner === 'O' ? 'X' : gameState.startingPlayer === 'X' ? 'O' : 'X';
      setGameState(prev => ({
        ...prev,
        board: Array(9).fill(null),
        playerXMarks: [],
        playerOMarks: [],
        markToRemoveIndex: null,
        winningLine: [],
        winMessage: '',
        showWinModal: false,
        gameActive: true,
        currentPlayer: nextStarter,
        startingPlayer: nextStarter
      }));
    }
  };

  const handleLeaveGame = async () => {
    soundManager.playClick();
    if (roomId) {
      await updateDoc(doc(db, 'rooms', roomId), {
        status: 'left',
        leftBy: playerSymbol
      });
    }
    leaveGameCleanup();
    setOpponentId(null);
    setProcessedResultId(null);
  };

  const handleBackToHome = async () => {
    soundManager.playClick();
    if (gameMode === 'online' && roomId) {
      handleLeaveGame();
    } else if (gameMode === 'matchmaking' && user) {
      await leaveQueue(getCurrentUserId(user));
      setGameMode('home');
    } else {
      setGameMode('home');
      resetBoardFull();
      setLocalXScore(0);
      setLocalOScore(0);
      setBotDifficulty(null);
    }
    setOpponentId(null);
    setProcessedResultId(null);
  };

  const handleSelectMode = (mode, difficulty = null) => {
    soundManager.playClick();

    if (mode === 'bot') {
      setBotDifficulty(difficulty);
      setGameMode('bot');
      resetBoardFull();
    } else if (mode === 'local') {
      setGameMode('local');
      resetBoardFull();
      setLocalXScore(0);
      setLocalOScore(0);
    } else if (mode === 'online') {
      setGameMode('matchmaking');
    }
  };

  const handleToggleSound = () => {
    soundManager.toggle();
    soundManager.playClick();
    setShowSettings(false);
    setTimeout(() => setShowSettings(true), 0);
  };

  const handleResetData = () => {
    soundManager.playClick();
    resetAllData();
    setCoins(0);
    setStats(getStats());
    setMysteryBoxes(0);
    setBoxWinProgress(0);
    setLastDailyBoxClaim(null);
    saveLocalBoxState(0, 0, null);
    setShowSettings(false);
  };

  const handleShowStats = () => {
    soundManager.playClick();
    setShowStats(true);
  };

  const handleShowLeaderboard = () => {
    soundManager.playClick();
    setShowLeaderboard(true);
  };

  const handleShowSettings = () => {
    soundManager.playClick();
    setShowSettings(true);
  };

  const handleAuthSuccess = async (firebaseUser) => {
    soundManager.playCoin();

    // Sync guest data if transitioning from guest
    const guestCoins = getCoins();
    const guestStats = getStats();
    if (guestCoins > 0 || guestStats.totalGames > 0) {
      await syncGuestDataToUser(firebaseUser, guestCoins, guestStats);
    }

    setUser(firebaseUser);
  };

  const handleContinueAsGuest = () => {
    soundManager.playClick();
    setAuthLoading(false);
  };

  const handleSignOut = async () => {
    soundManager.playClick();
    await signOutUser();
    setUser(null);
    setCoins(getCoins());
    const localBoxes = getLocalBoxState();
    setMysteryBoxes(localBoxes.boxes);
    setBoxWinProgress(localBoxes.progress);
    setLastDailyBoxClaim(localBoxes.lastClaim);
    setOpponentId(null);
    setProcessedResultId(null);
    setFriendRequestCount(0);
    setInviteCount(0);
    setLatestInviteName('');
  };

  const handleShowShop = (view = 'store') => {
    soundManager.playClick();
    setShopInitialView(view);
    setShowShop(true);
  };

  const handleShowAvatarCollection = () => {
    soundManager.playClick();
    setShopInitialView('collection');
    setShowShop(true);
  };

  const handleShowFriends = () => {
    soundManager.playClick();
    setShowFriends(true);
  };

  const handleShopPurchase = async (item) => {
    if (!item || !item.id) return;
    if (userInventory.includes(item.id)) return;

    // Spend coins locally
    setCoins((prev) => {
      const next = Math.max(0, prev - (item.price || 0));
      if (!user || checkIsGuest(user)) {
        setLocalCoins(next);
      }
      return next;
    });

    // Update inventory in state
    const newInventory = [...userInventory, item.id];
    setUserInventory(newInventory);

    // Update Firestore
    if (user && !checkIsGuest(user)) {
      await updateDoc(doc(db, 'users', user.uid), {
        inventory: arrayUnion(item.id)
      });
    }
  };

  const handleAvatarUpdate = async (avatarData) => {
    // Update avatar in state
    setUserAvatar(avatarData);

    // Update Firestore
    if (user && !checkIsGuest(user)) {
      await updateDoc(doc(db, 'users', user.uid), {
        equippedFrame: avatarData.frame,
        equippedBackground: avatarData.background
      });
    }
  };

  const handleMatchFound = (matchData) => {
    setRoomId(matchData.roomId);
    setPlayerSymbol(matchData.playerSymbol);
    setOpponentId(matchData.opponentId || null);
    setProcessedResultId(null);
    setGameStarted(true);
    setGameMode('online');
    setOnlineXScore(0);
    setOnlineOScore(0);

    // Set player names from match data
    if (matchData.playerXName) setPlayerXName(matchData.playerXName);
    if (matchData.playerOName) setPlayerOName(matchData.playerOName);
  };

  const handleCreateRoom = () => {
    setShowHostModal(true);
  };

  const handleJoinRoom = () => {
    setShowJoinModal(true);
  };

  const handleCancelMatchmaking = () => {
    setGameMode('home');
  };

  // Handle win/loss/draw for player moves
  const handlePlayerMove = useCallback(async (winner, isDraw) => {
    const updateOnlineRank = async (outcome) => {
      if (!user || checkIsGuest(user)) return;
      try {
        const rankResult = await updateRankAfterOnlineMatch(getCurrentUserId(user), outcome);
        if (rankResult) {
          setRankInfo((prev) => ({
            ...prev,
            rank: rankResult.rank,
            seasonScore: rankResult.seasonScore,
            seasonStats: { ...rankResult.seasonStats, seasonId: rankResult.seasonId },
            seasonId: rankResult.seasonId,
            lastSeasonRank: prev.lastSeasonRank || rankResult.previousRank || null
          }));
          if (rankResult.rankUp) {
            setRankUpFlash(true);
            setTimeout(() => setRankUpFlash(false), 1200);
          }
        }
      } catch (err) {
        console.error('Failed to update rank after online match', err);
      }
    };

    // Prevent double coin awards by checking if already awarded
    if (winner) {
      const playerWon = (gameMode === 'online' && winner === playerSymbol) ||
        (gameMode === 'bot' && winner === 'X') ||
        (gameMode === 'local' && winner === 'X');
      if (gameMode === 'bot') {
        if (winner === 'X') {
          soundManager.playWin();
          const coinReward = awardCoins('win', 'bot', botDifficulty);
          setCoins(coinReward.totalCoins);
          setCoinsEarned(coinReward.coinsAdded);
          setTimeout(() => setCoinsEarned(0), 2000);
          updateStats('win', 'bot', botDifficulty);
          setStats(getStats());
        } else {
          soundManager.playLoss();
          updateStats('loss', 'bot', botDifficulty);
          setStats(getStats());
        }
      } else if (gameMode === 'local') {
        soundManager.playWin();
        // Award coins only once for local games
        const coinReward = awardCoins('win', 'local');
        setCoins(coinReward.totalCoins);
        setCoinsEarned(coinReward.coinsAdded);
        setTimeout(() => setCoinsEarned(0), 2000);
        updateStats('win', 'local');
        setStats(getStats());
      } else if (gameMode === 'online' && winner === playerSymbol) {
        soundManager.playWin();
        const coinReward = awardCoins('win', 'online');
        setCoins(coinReward.totalCoins);
        setCoinsEarned(coinReward.coinsAdded);
        setTimeout(() => setCoinsEarned(0), 2000);
        updateStats('win', 'online');
        setStats(getStats());
        applyWinTowardBox();
        await updateOnlineRank('win');
      } else if (gameMode === 'online') {
        soundManager.playLoss();
        updateStats('loss', 'online');
        setStats(getStats());
        await updateOnlineRank('loss');
      }
      if (playerWon && gameMode !== 'online') {
        applyWinTowardBox();
      }
    } else if (isDraw) {
      soundManager.playDraw();
      const coinReward = awardCoins('draw', gameMode, botDifficulty);
      setCoins(coinReward.totalCoins);
      setCoinsEarned(coinReward.coinsAdded);
      setTimeout(() => setCoinsEarned(0), 2000);
      updateStats('draw', gameMode, botDifficulty);
      setStats(getStats());
    }
  }, [gameMode, botDifficulty, playerSymbol, applyWinTowardBox, user]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="app-container">
        <div className="app" style={{ paddingTop: '50px' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  // Show auth screen if not authenticated and not guest
  if (!user && !authLoading) {
    return (
      <Auth
        onAuthSuccess={handleAuthSuccess}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

  return (
    <div className="app-container">
      {gameMode !== 'home' && gameMode !== 'matchmaking' && (
        <CoinDisplay coins={coins} coinsEarned={coinsEarned} />
      )}

      <div className="app">
        {gameMode === 'home' ? (
          <HomeScreen
            onSelectMode={handleSelectMode}
            coins={coins}
            onShowSettings={handleShowSettings}
            onShowStats={handleShowStats}
            onShowLeaderboard={handleShowLeaderboard}
            onShowShop={handleShowShop}
            onShowFriends={handleShowFriends}
            user={user}
            friendBadgeCount={friendRequestCount + inviteCount}
            latestInviteName={latestInviteName}
            mysteryBoxes={mysteryBoxes}
            boxWinProgress={boxWinProgress}
            onOpenMysteryBox={handleOpenMysteryBox}
            onClaimDailyBox={handleClaimDailyBox}
            canClaimDaily={canClaimDailyBox(lastDailyBoxClaim)}
            dailyCooldownMs={dailyCooldownMs(lastDailyBoxClaim)}
            boxOpening={boxOpening}
            boxReward={boxReward}
            boxesOpenedToday={dailyBoxOpens.count}
            dailyOpenLimit={DAILY_BOX_OPEN_LIMIT}
          />
        ) : gameMode === 'matchmaking' ? (
          <OnlineMatchmaking
            userId={getCurrentUserId(user)}
            displayName={user?.displayName || 'Guest'}
            onMatchFound={handleMatchFound}
            onCancel={handleCancelMatchmaking}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        ) : (
          <>
            <TopInfo
              roomId={roomId}
              localXScore={localXScore}
              localOScore={localOScore}
              onlineXScore={onlineXScore}
              onlineOScore={onlineOScore}
              gameState={gameState}
              opponentLeft={opponentLeft}
              gameMode={gameMode}
              botDifficulty={botDifficulty}
              playerXName={playerXName}
              playerOName={playerOName}
              playerXAvatar={playerSymbol === 'X' ? userAvatar : null}
              playerOAvatar={playerSymbol === 'O' ? userAvatar : null}
            />

            <Board
              gameState={gameState}
              setGameState={setGameState}
              playerSymbol={playerSymbol}
              roomId={roomId}
              gameMode={gameMode}
              onGameEnd={handlePlayerMove}
              playerXName={playerXName}
              playerOName={playerOName}
              isBotThinking={isBotThinking}
            />

            <Controls
              gameStarted={gameStarted}
              roomId={roomId}
              resetBoardFull={resetBoardFull}
              setGameState={setGameState}
              setHostRoomId={() => setHostRoomId(nanoid(4).toUpperCase())}
              setShowHostModal={setShowHostModal}
              setJoinRoomId={setJoinRoomId}
              setShowJoinModal={setShowJoinModal}
              handleLeaveGame={handleLeaveGame}
              onBackToHome={handleBackToHome}
              gameMode={gameMode}
            />

            <Modals
              gameState={{ ...gameState, roomId }}
              setGameState={setGameState}
              onPlayAgain={handlePlayAgain}
              onLeaveGame={handleLeaveGame}
            />

            <HostJoinModals
              showHostModal={showHostModal}
              showJoinModal={showJoinModal}
              hostRoomId={hostRoomId}
              setHostRoomId={setHostRoomId}
              joinRoomId={joinRoomId}
              setJoinRoomId={setJoinRoomId}
              setRoomId={setRoomId}
              setPlayerSymbol={setPlayerSymbol}
              setShowHostModal={setShowHostModal}
              setShowJoinModal={setShowJoinModal}
              setOnlineXScore={setOnlineXScore}
              setOnlineOScore={setOnlineOScore}
              setGameStarted={setGameStarted}
              setGameMode={setGameMode}
              user={user}
              setPlayerXName={setPlayerXName}
              setPlayerOName={setPlayerOName}
            />
          </>
        )}

        {showSettings && (
          <Settings
            soundEnabled={soundManager.isEnabled()}
            onToggleSound={handleToggleSound}
            onResetData={handleResetData}
            onClose={() => {
              soundManager.playClick();
              setShowSettings(false);
            }}
            user={user}
            onSignOut={handleSignOut}
            userAvatar={userAvatar}
            onOpenShop={handleShowAvatarCollection}
          />
        )}

        {showStats && (
          <StatsModal
            stats={stats}
            coins={coins}
            onClose={() => {
              soundManager.playClick();
              setShowStats(false);
            }}
          />
        )}

        {showLeaderboard && (
          <Leaderboard
            onClose={() => {
              soundManager.playClick();
              setShowLeaderboard(false);
            }}
          />
        )}

        {showShop && (
          <Shop
            onClose={() => {
              soundManager.playClick();
              setShowShop(false);
            }}
            coins={coins}
            inventory={userInventory}
            equippedItems={userAvatar}
            onPurchase={handleShopPurchase}
            rankInfo={rankInfo}
            initialView={shopInitialView}
            onEquip={handleAvatarUpdate}
          />
        )}

        {showFriends && (
          <FriendsList
            onClose={() => {
              soundManager.playClick();
              setShowFriends(false);
              setLatestInviteName('');
            }}
            user={user}
            userAvatar={userAvatar}
            onJoinGame={handleMatchFound}
          />
        )}
      </div>
    </div>
  );
}

export default App;
