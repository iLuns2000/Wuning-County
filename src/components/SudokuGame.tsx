import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { X, RotateCcw, Check, Lightbulb, Trophy, Medal } from 'lucide-react';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { getSudokuLeaderboard, submitSudokuScore, getDeviceId, getSudokuBestScores, type SudokuLeaderboardEntry } from '@/utils/cloudApi';
import { useGameStore } from '@/store/gameStore';

interface SudokuGameProps {
  onClose: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_GIVENS: Record<Difficulty, number> = {
  // 给定数字数量（剩余空格数 = 81 - 给定数）
  easy: 36,    // 简单：45个空格
  medium: 30,  // 中等：51个空格
  hard: 25     // 困难：56个空格
};

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
};

type CellState = {
  value: number;
  isGiven: boolean;
  isError: boolean;
  isHighlighted: boolean;
  notes: number[];
};

type Board = CellState[][];

const createEmptyBoard = (): Board => {
  return Array(9).fill(null).map(() =>
    Array(9).fill(null).map(() => ({
      value: 0,
      isGiven: false,
      isError: false,
      isHighlighted: false,
      notes: []
    }))
  );
};

const isValidPlacement = (board: number[][], row: number, col: number, num: number): boolean => {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[boxRow + i][boxCol + j] === num) return false;
    }
  }
  return true;
};

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// 检查是否违反数独规则（用于实时验证玩家输入）
const violatesRules = (board: Board, row: number, col: number, num: number): boolean => {
  for (let i = 0; i < 9; i++) {
    if (i !== col && board[row][i].value === num) return true;
    if (i !== row && board[i][col].value === num) return true;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const r = boxRow + i, c = boxCol + j;
      if (!(r === row && c === col) && board[r][c].value === num) return true;
    }
  }
  return false;
};

// 检查数独是否有唯一解（用于生成有效题目）
const hasUniqueSolution = (board: number[][]): boolean => {
  const copy = board.map(row => [...row]);
  let solutions = 0;

  const solve = (b: number[][]): boolean => {
    if (solutions > 1) return false; // 超过一个解，提前终止

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(b, row, col, num)) {
              b[row][col] = num;
              if (solve(b)) {
                b[row][col] = 0;
                if (solutions > 1) return false;
              } else {
                b[row][col] = 0;
              }
            }
          }
          return false;
        }
      }
    }
    solutions++;
    return true;
  };

  solve(copy);
  return solutions === 1;
};

const generateSudoku = (difficulty: Difficulty): { puzzle: Board; solution: number[][] } => {
  const solution: number[][] = Array(9).fill(null).map(() => Array(9).fill(0));

  const fillBoard = (board: number[][]): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (board[row][col] === 0) {
          const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of nums) {
            if (isValidPlacement(board, row, col, num)) {
              board[row][col] = num;
              if (fillBoard(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  fillBoard(solution);

  // 先将完整解复制到puzzle
  const puzzle: Board = createEmptyBoard();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      puzzle[r][c].value = solution[r][c];
      puzzle[r][c].isGiven = true;
    }
  }

  // 挖洞生成题目，确保唯一解
  const givens = DIFFICULTY_GIVENS[difficulty];
  const positions = shuffleArray(
    Array.from({ length: 81 }, (_, i) => ({ row: Math.floor(i / 9), col: i % 9 }))
  );

  let removedCount = 0;
  const targetRemoved = 81 - givens;

  for (const pos of positions) {
    if (removedCount >= targetRemoved) break;

    const backup = puzzle[pos.row][pos.col].value;
    puzzle[pos.row][pos.col].value = 0;
    puzzle[pos.row][pos.col].isGiven = false;

    // 创建纯数字数组用于验证唯一解
    const testBoard = puzzle.map(row => row.map(cell => cell.value));

    if (hasUniqueSolution(testBoard)) {
      removedCount++;
    } else {
      // 恢复，因为会导致多解
      puzzle[pos.row][pos.col].value = backup;
      puzzle[pos.row][pos.col].isGiven = true;
    }
  }

  return { puzzle, solution };
};

export const SudokuGame: React.FC<SudokuGameProps> = ({ onClose }) => {
  const vibrate = useGameVibrate();
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [board, setBoard] = useState<Board>(() => createEmptyBoard());
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true); // 初始为true，等待生成
  const [showNotes, setShowNotes] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  
  // 排行榜相关状态
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<SudokuLeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bestTimes, setBestTimes] = useState<Record<string, number>>({});
  
  const playerName = useGameStore((state) => state.playerProfile)?.name || '';
  const deviceId = getDeviceId();

  const startNewGame = useCallback((diff: Difficulty) => {
    setIsGenerating(true);
    setIsComplete(false);
    setSelectedCell(null);
    setTimer(0);
    setIsTimerRunning(false);

    setTimeout(() => {
      const { puzzle, solution: sol } = generateSudoku(diff);
      setBoard(puzzle);
      setSolution(sol);
      setDifficulty(diff);
      setIsGenerating(false);
      setIsTimerRunning(true);
    }, 50);
  }, []);

  // 组件挂载时自动开始一局游戏
  useEffect(() => {
    startNewGame('easy');
  }, [startNewGame]);

  useEffect(() => {
    if (isTimerRunning && timer < 3600) {
      const interval = setInterval(() => {
        setTimer(t => t + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, timer]);

  // 加载排行榜
  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const result = await getSudokuLeaderboard(difficulty, 10, 0);
      if (result.success) {
        setLeaderboard(result.leaderboard);
      }
    } catch (e) {
      console.error('加载排行榜失败:', e);
    } finally {
      setLeaderboardLoading(false);
    }
  }, [difficulty]);

  // 加载用户最佳成绩
  const loadBestTimes = useCallback(async () => {
    try {
      const result = await getSudokuBestScores(deviceId);
      if (result.success && result.records) {
        const times: Record<string, number> = {};
        result.records.forEach(r => {
          times[r.difficulty] = r.time_seconds;
        });
        setBestTimes(times);
      }
    } catch (e) {
      console.error('加载最佳成绩失败:', e);
    }
  }, [deviceId]);

  // 提交成绩
  const submitScore = useCallback(async () => {
    if (!isComplete) return;
    setSubmitting(true);
    try {
      const result = await submitSudokuScore(deviceId, playerName || undefined, difficulty, timer);
      if (result.success) {
        if (result.is_new_record) {
          alert(`🎉 新纪录！\n用时: ${formatTime(timer)}`);
        } else {
          alert(`成绩已提交！\n当前用时: ${formatTime(timer)}\n最佳成绩: ${formatTime(result.best_time || timer)}`);
        }
        loadLeaderboard();
        loadBestTimes();
      }
    } catch (e) {
      console.error('提交成绩失败:', e);
      alert('提交失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }, [isComplete, deviceId, playerName, difficulty, timer, loadLeaderboard, loadBestTimes]);

  // 切换排行榜显示
  useEffect(() => {
    if (showLeaderboard) {
      loadLeaderboard();
    }
  }, [showLeaderboard, loadLeaderboard]);

  // 初始加载最佳成绩
  useEffect(() => {
    loadBestTimes();
  }, [loadBestTimes]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const checkCompletion = useCallback((currentBoard: Board): boolean => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (currentBoard[row][col].value !== solution[row][col]) {
          return false;
        }
      }
    }
    return true;
  }, [solution]);

  const handleCellClick = (row: number, col: number) => {
    if (board[row][col].isGiven || isComplete) return;
    vibrate(VIBRATION_PATTERNS.LIGHT);
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num: number) => {
    if (!selectedCell || isComplete) return;
    vibrate(VIBRATION_PATTERNS.LIGHT);

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const cell = newBoard[selectedCell.row][selectedCell.col];

    if (showNotes) {
      if (cell.value === 0) {
        const notes = cell.notes.includes(num)
          ? cell.notes.filter(n => n !== num)
          : [...cell.notes, num];
        cell.notes = notes;
      }
    } else {
      cell.value = num;
      cell.notes = [];
      // 检查是否违反数独规则（实时反馈）
      const ruleViolation = violatesRules(board, selectedCell.row, selectedCell.col, num);
      // 检查是否与答案不符
      const wrongAnswer = num !== solution[selectedCell.row][selectedCell.col];
      // 只有在违反规则或与答案不符时才标记错误
      cell.isError = ruleViolation || wrongAnswer;

      if (checkCompletion(newBoard)) {
        setIsComplete(true);
        setIsTimerRunning(false);
        vibrate(VIBRATION_PATTERNS.MEDIUM);
      }
    }

    setBoard(newBoard);
  };

  const handleClear = () => {
    if (!selectedCell || isComplete) return;
    vibrate(VIBRATION_PATTERNS.LIGHT);
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    const cell = newBoard[selectedCell.row][selectedCell.col];
    if (!cell.isGiven) {
      cell.value = 0;
      cell.notes = [];
      cell.isError = false;
    }
    setBoard(newBoard);
  };

  const handleErase = () => {
    handleClear();
  };

  // 键盘输入支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在生成或已完成，不处理
      if (isGenerating || isComplete) return;

      // 数字键 1-9 输入数字
      if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        handleNumberInput(num);
        return;
      }

      // 删除/退格键清除
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        handleClear();
        return;
      }

      // 方向键移动选中格子
      if (selectedCell) {
        let newRow = selectedCell.row;
        let newCol = selectedCell.col;

        switch (e.key) {
          case 'ArrowUp':
            newRow = Math.max(0, selectedCell.row - 1);
            e.preventDefault();
            break;
          case 'ArrowDown':
            newRow = Math.min(8, selectedCell.row + 1);
            e.preventDefault();
            break;
          case 'ArrowLeft':
            newCol = Math.max(0, selectedCell.col - 1);
            e.preventDefault();
            break;
          case 'ArrowRight':
            newCol = Math.min(8, selectedCell.col + 1);
            e.preventDefault();
            break;
        }

        if (newRow !== selectedCell.row || newCol !== selectedCell.col) {
          setSelectedCell({ row: newRow, col: newCol });
        }
      }

      // N 键切换笔记模式
      if (e.key === 'n' || e.key === 'N') {
        setShowNotes(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating, isComplete, selectedCell, handleNumberInput, handleClear]);

  const getHighlightedCells = useMemo(() => {
    if (!selectedCell) return new Set<string>();
    const { row, col } = selectedCell;
    const cellValue = board[row][col].value;
    const highlighted = new Set<string>();

    for (let i = 0; i < 9; i++) {
      highlighted.add(`${row},${i}`);
      highlighted.add(`${i},${col}`);
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        highlighted.add(`${boxRow + i},${boxCol + j}`);
      }
    }

    if (cellValue !== 0) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (board[r][c].value === cellValue && !(r === row && c === col)) {
            highlighted.add(`${r},${c}`);
          }
        }
      }
    }

    return highlighted;
  }, [selectedCell, board]);

  const sameNumbersCount = useMemo(() => {
    if (!selectedCell) return 0;
    const { row, col } = selectedCell;
    const cellValue = board[row][col].value;
    if (cellValue === 0) return 0;
    let count = 1;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c].value === cellValue && !(r === row && c === col)) {
          count++;
        }
      }
    }
    return count;
  }, [selectedCell, board]);

  return (
    <div
      className="relative w-full max-w-lg mx-auto overflow-hidden flex flex-col rounded-lg
                 bg-[#f5f0e6] dark:bg-[#1a1815]
                 border border-[#d4c9b5] dark:border-[#3d3629]
                 shadow-2xl"
    >
      <div className="h-1 bg-gradient-to-r from-[#8b7355] via-[#a08060] to-[#8b7355]" />

      <div className="px-6 py-4 bg-[#ebe5d8] dark:bg-[#2a2318] border-b border-[#d4c9b5] dark:border-[#3d3629]">
        <div className="flex justify-between items-center">
          <div className="flex gap-3 items-center">
            <div className="p-2 rounded-lg bg-[#8b7355]/10 border border-[#8b7355]/20">
              <svg className="w-5 h-5 text-[#6b5544] dark:text-[#a08060]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#4a3f32] dark:text-[#e8e0d0] font-display">数独游戏</h2>
              <p className="text-xs text-[#8b7355]/70 dark:text-[#a08060]/70">逻辑推理 · 益智填数</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <span className="font-mono text-sm text-[#6b5544] dark:text-[#a08060]">
              {formatTime(timer)}
            </span>
          </div>
        </div>
      </div>

        <div className="px-6 py-3 bg-[#f0ebe0] dark:bg-[#221e16] border-b border-[#d4c9b5] dark:border-[#3d3629] flex gap-2 flex-wrap">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                startNewGame(diff);
              }}
              className={`
                px-3 py-1.5 rounded text-sm font-medium transition-all
                ${difficulty === diff
                  ? 'bg-[#6b5544] dark:bg-[#5a4a38] text-white dark:text-[#f5f0e6]'
                  : 'bg-[#e8e0d8] dark:bg-[#2a2318] text-[#6b5544] dark:text-[#a08060] hover:bg-[#d4c9b5] dark:hover:bg-[#3d3629]'
                }
              `}
            >
              {DIFFICULTY_LABELS[diff]}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              setShowLeaderboard(true);
            }}
            className="px-3 py-1.5 rounded text-sm font-medium bg-[#e8e0d8] dark:bg-[#2a2318] text-[#6b5544] dark:text-[#a08060] hover:bg-[#d4c9b5] flex items-center gap-1"
          >
            <Trophy className="w-4 h-4" />
            排行
          </button>
          <button
            onClick={() => {
              vibrate(VIBRATION_PATTERNS.LIGHT);
              startNewGame(difficulty);
            }}
            className="px-3 py-1.5 rounded text-sm font-medium bg-[#e8e0d8] dark:bg-[#2a2318] text-[#6b5544] dark:text-[#a08060] hover:bg-[#d4c9b5] flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            重开
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-[#faf7f0] dark:bg-[#1a1815]">
          {isGenerating ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-10 h-10 rounded-full border-t-2 border-b-2 animate-spin border-[#8b7355] dark:border-[#a08060]" />
            </div>
          ) : isComplete ? (
            <div className="flex flex-col gap-4 justify-center items-center h-64">
              <div className="p-4 bg-green-100 rounded-full dark:bg-green-900/30">
                <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-[#4a3f32] dark:text-[#e8e0d0]">恭喜完成！</h3>
                <p className="text-[#8b7355] dark:text-[#a08060] mt-1">
                  用时 {formatTime(timer)}
                </p>
                {bestTimes[difficulty] && timer < bestTimes[difficulty] && (
                  <p className="mt-1 text-sm text-green-500">🎉 打破个人最佳纪录！</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.LIGHT);
                    submitScore();
                  }}
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-[#8b7355] text-[#f5f0e6] font-medium hover:bg-[#7a6345] flex items-center gap-1 disabled:opacity-50"
                >
                  <Trophy className="w-4 h-4" />
                  {submitting ? '提交中...' : '提交成绩'}
                </button>
                <button
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.LIGHT);
                    setShowLeaderboard(true);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#4a3f32] dark:bg-[#5a4a38] text-[#f5f0e6] font-medium hover:bg-[#3d3228] flex items-center gap-1"
                >
                  <Medal className="w-4 h-4" />
                  查看排行
                </button>
                <button
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.LIGHT);
                    startNewGame(difficulty);
                  }}
                  className="px-4 py-2 rounded-lg bg-[#e8e0d8] dark:bg-[#2a2318] text-[#6b5544] dark:text-[#a08060] font-medium hover:bg-[#d4c9b5]"
                >
                  再来一局
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-3">
                <div
                  className="grid grid-cols-9 p-0.5 rounded-lg bg-[#8b7355] dark:bg-[#3d3629] overflow-hidden"
                  style={{
                    boxShadow: '0 0 0 1px #8b7355'
                  }}
                >
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                      const isHighlighted = getHighlightedCells.has(`${rowIndex},${colIndex}`);
                      const isSameNumber = sameNumbersCount > 1 && board[rowIndex][colIndex].value === board[selectedCell?.row ?? 0][selectedCell?.col ?? 0].value && board[selectedCell?.row ?? 0][selectedCell?.col ?? 0].value !== 0;

                      // 3x3 区域分割线
                      const isRightEdge = (colIndex + 1) % 3 === 0 && colIndex !== 8;
                      const isBottomEdge = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;

                      return (
                        <button
                          key={`${rowIndex}-${colIndex}`}
                          onClick={() => handleCellClick(rowIndex, colIndex)}
                          disabled={cell.isGiven}
                          className={`
                            w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base font-medium
                            transition-all duration-100
                            border-b border-r border-[#d4c9b5]/60 dark:border-[#3d3629]/30
                            ${isRightEdge ? 'mr-[2px]' : ''}
                            ${isBottomEdge ? 'mb-[2px]' : ''}
                            ${cell.isGiven
                              ? 'bg-[#fcfaf7] dark:bg-[#2a2318] text-[#4a3f32] dark:text-[#e8e0d0] font-bold cursor-default'
                              : 'bg-white dark:bg-[#242018] text-[#8b7355] dark:text-[#a08060] cursor-pointer hover:bg-[#f5f0e6] dark:hover:bg-[#2a2318]'
                            }
                            ${isSelected
                              ? 'bg-[#8b7355]/30 dark:bg-[#8b7355]/40 ring-2 ring-inset ring-[#8b7355] !border-transparent z-10'
                              : isHighlighted
                                ? 'bg-[#d4c9b5]/30 dark:bg-[#8b7355]/15'
                                : ''
                            }
                            ${cell.isError
                              ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
                              : ''
                            }
                            ${isSameNumber && !isSelected
                              ? 'bg-[#c9b896]/40 dark:bg-[#8b7355]/20'
                              : ''
                            }
                          `}
                        >
                          {cell.value !== 0 ? (
                            <span className={cell.isGiven ? 'text-[#4a3f32] dark:text-[#e8e0d0]' : 'text-[#8b7355] dark:text-[#a08060]'}>
                              {cell.value}
                            </span>
                          ) : cell.notes.length > 0 ? (
                            <div className="grid grid-cols-3 gap-0.5 text-[8px] sm:text-[10px] leading-none">
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                                <span
                                  key={n}
                                  className={cell.notes.includes(n) ? 'text-[#8b7355] dark:text-[#a08060]' : 'text-transparent'}
                                >
                                  {n}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-center mb-3">
                <button
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.LIGHT);
                    setShowNotes(!showNotes);
                  }}
                  className={`
                    px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 transition-colors
                    ${showNotes
                      ? 'bg-[#8b7355] text-white dark:text-[#f5f0e6]'
                      : 'bg-[#e8e0d8] dark:bg-[#2a2318] text-[#6b5544] dark:text-[#a08060] hover:bg-[#d4c9b5] dark:hover:bg-[#3d3629]'
                    }
                  `}
                >
                  <Lightbulb className="w-4 h-4" />
                  笔记
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                  <button
                    key={num}
                    onClick={() => handleNumberInput(num)}
                    className="w-10 h-10 rounded-lg bg-[#6b5544] dark:bg-[#5a4a38] text-white dark:text-[#f5f0e6] font-bold text-lg hover:bg-[#5a4838] dark:hover:bg-[#4a3a28] transition-colors"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleErase}
                  className="w-10 h-10 rounded-lg bg-[#e8e0d8] dark:bg-[#2a2318] text-[#6b5544] dark:text-[#a08060] font-bold text-lg hover:bg-[#d4c9b5] dark:hover:bg-[#3d3629] transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
      </div>

      {/* 排行榜弹窗 */}
      {showLeaderboard && (
        <div className="flex absolute inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/50">
          <div className="w-[90%] max-w-md max-h-[80%] overflow-hidden flex flex-col rounded-lg bg-[#f5f0e6] dark:bg-[#1a1815] border border-[#d4c9b5] dark:border-[#3d3629] shadow-2xl">
            <div className="px-4 py-3 bg-[#ebe5d8] dark:bg-[#2a2318] border-b border-[#d4c9b5] dark:border-[#3d3629] flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <Trophy className="w-5 h-5 text-[#8b7355]" />
                <h3 className="text-lg font-bold text-[#4a3f32] dark:text-[#e8e0d0]">数独排行榜</h3>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="p-1 rounded hover:bg-[#d4c9b5]/50"
              >
                <X className="w-5 h-5 text-[#6b5544]" />
              </button>
            </div>
            
            {/* 难度切换 */}
            <div className="px-4 py-2 bg-[#f0ebe0] dark:bg-[#221e16] border-b border-[#d4c9b5] dark:border-[#3d3629] flex gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => {
                    vibrate(VIBRATION_PATTERNS.LIGHT);
                    setDifficulty(diff);
                  }}
                  className={`
                    px-3 py-1 rounded text-sm font-medium transition-all
                    ${difficulty === diff
                      ? 'bg-[#4a3f32] dark:bg-[#5a4a38] text-[#f5f0e6]'
                      : 'bg-[#e8e0d8] dark:bg-[#2a2318] text-[#6b5544] dark:text-[#a08060] hover:bg-[#d4c9b5]'
                    }
                  `}
                >
                  {DIFFICULTY_LABELS[diff]}
                </button>
              ))}
            </div>
            
            {/* 排行榜列表 */}
            <div className="overflow-y-auto flex-1 p-4">
              {leaderboardLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="w-8 h-8 rounded-full border-t-2 border-b-2 animate-spin border-[#8b7355]" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center text-[#8b7355] py-8">
                  暂无记录，快来挑战吧！
                </div>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.user_id}
                      className={`
                        flex items-center gap-3 p-2 rounded-lg
                        ${entry.user_id === deviceId
                          ? 'bg-[#8b7355]/20 border border-[#8b7355]/40'
                          : 'bg-[#e8e0d8] dark:bg-[#2a2318]'
                        }
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-gray-400 text-white' : index === 2 ? 'bg-amber-600 text-white' : 'bg-[#d4c9b5] text-[#6b5544]'}
                      `}>
                        {entry.rank}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-[#4a3f32] dark:text-[#e8e0d0]">
                          {entry.nickname || `玩家${entry.user_id.slice(-4)}`}
                        </div>
                        <div className="text-xs text-[#8b7355]/70">
                          {formatTime(entry.time_seconds)}
                        </div>
                      </div>
                      {entry.user_id === deviceId && (
                        <span className="text-xs text-[#8b7355] bg-[#8b7355]/20 px-2 py-0.5 rounded">我</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* 我的最隹成绩 */}
            {bestTimes[difficulty] && (
              <div className="px-4 py-3 bg-[#ebe5d8] dark:bg-[#2a2318] border-t border-[#d4c9b5] dark:border-[#3d3629]">
                <div className="text-sm text-[#6b5544] dark:text-[#a08060]">
                  我的最佳成绩: <span className="font-bold text-[#4a3f32] dark:text-[#e8e0d0]">{formatTime(bestTimes[difficulty])}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SudokuGame;