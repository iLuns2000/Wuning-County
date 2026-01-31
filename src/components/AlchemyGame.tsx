import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { X, RefreshCw, Coins, Backpack } from 'lucide-react';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

const ALCHEMY_LEVELS: Record<number, { id: string; name: string; price: number; color: string; textColor?: string }> = {
  2: { id: 'herb_residue', name: '药渣', price: 1, color: 'bg-stone-400', textColor: 'text-white' },
  4: { id: 'herb_licorice', name: '甘草', price: 2, color: 'bg-green-600', textColor: 'text-white' },
  8: { id: 'herb_peel', name: '陈皮', price: 5, color: 'bg-orange-600', textColor: 'text-white' },
  16: { id: 'herb_honeysuckle', name: '金银花', price: 15, color: 'bg-yellow-500', textColor: 'text-white' },
  32: { id: 'herb_angelica', name: '当归', price: 40, color: 'bg-amber-800', textColor: 'text-white' },
  64: { id: 'herb_pearl', name: '珍珠粉', price: 100, color: 'bg-slate-500', textColor: 'text-white' },
  128: { id: 'herb_ganoderma', name: '紫灵芝', price: 250, color: 'bg-purple-700', textColor: 'text-white' },
  256: { id: 'herb_cordyceps', name: '冬虫夏草', price: 600, color: 'bg-amber-900', textColor: 'text-white' },
  512: { id: 'herb_ambergris', name: '龙涎香', price: 1500, color: 'bg-gray-600', textColor: 'text-white' },
  1024: { id: 'herb_snow_lotus', name: '天山雪莲', price: 4000, color: 'bg-cyan-600', textColor: 'text-white' },
  2048: { id: 'herb_ginseng_king', name: '千年人参', price: 10000, color: 'bg-red-700', textColor: 'text-white' },
};

interface AlchemyGameProps {
  onClose: () => void;
}

export const AlchemyGame: React.FC<AlchemyGameProps> = ({ onClose }) => {
  const { handleEventOption } = useGameStore();
  const [board, setBoard] = useState<number[][]>(Array(4).fill(null).map(() => Array(4).fill(0)));
  const [gameOver, setGameOver] = useState(false);
  const [highestTile, setHighestTile] = useState(0);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const vibrate = useGameVibrate();

  // Initialize game
  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const newBoard = Array(4).fill(null).map(() => Array(4).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);
    setBoard(newBoard);
    setGameOver(false);
    setHighestTile(2);
  };

  const addRandomTile = (currentBoard: number[][]) => {
    const emptyCells = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let moved = false;
    const newBoard = board.map(row => [...row]);

    const rotateBoard = (b: number[][]) => {
      const N = b.length;
      const res = Array(N).fill(null).map(() => Array(N).fill(0));
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          res[c][N - 1 - r] = b[r][c];
        }
      }
      return res;
    };

    let workingBoard = newBoard;
    // Rotate to handle all directions as "left"
    if (direction === 'up') workingBoard = rotateBoard(rotateBoard(rotateBoard(workingBoard)));
    else if (direction === 'right') workingBoard = rotateBoard(rotateBoard(workingBoard));
    else if (direction === 'down') workingBoard = rotateBoard(workingBoard);

    // Compress and Merge logic (Left)
    for (let r = 0; r < 4; r++) {
      let row = workingBoard[r].filter(val => val !== 0);
      for (let c = 0; c < row.length - 1; c++) {
        if (row[c] === row[c + 1]) {
          row[c] *= 2;
          row[c + 1] = 0;
          moved = true; // Merge happened, but we also need to check if position changed
        }
      }
      row = row.filter(val => val !== 0);
      while (row.length < 4) row.push(0);
      
      if (row.join(',') !== workingBoard[r].join(',')) {
        moved = true;
      }
      workingBoard[r] = row;
    }

    // Rotate back
    if (direction === 'up') workingBoard = rotateBoard(workingBoard);
    else if (direction === 'right') workingBoard = rotateBoard(rotateBoard(workingBoard));
    else if (direction === 'down') workingBoard = rotateBoard(rotateBoard(rotateBoard(workingBoard)));

    if (moved) {
      vibrate(VIBRATION_PATTERNS.LIGHT); // Vibrate on move
      addRandomTile(workingBoard);
      setBoard(workingBoard);
      
      // Update highest tile
      let max = 0;
      for(let r=0; r<4; r++) {
          for(let c=0; c<4; c++) {
              max = Math.max(max, workingBoard[r][c]);
          }
      }
      setHighestTile(max);

      if (checkGameOver(workingBoard)) {
        vibrate(VIBRATION_PATTERNS.ERROR); // Game over vibration
        setGameOver(true);
      }
    }
  }, [board, gameOver, vibrate]);

  const checkGameOver = (b: number[][]) => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) return false;
        if (c < 3 && b[r][c] === b[r][c + 1]) return false;
        if (r < 3 && b[r][c] === b[r + 1][c]) return false;
      }
    }
    return true;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': move('up'); break;
      case 'ArrowDown': move('down'); break;
      case 'ArrowLeft': move('left'); break;
      case 'ArrowRight': move('right'); break;
    }
  }, [move]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 30; // Minimum distance to be considered a swipe

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        move(deltaX > 0 ? 'right' : 'left');
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        move(deltaY > 0 ? 'down' : 'up');
      }
    }
    setTouchStart(null);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCashOut = (sell: boolean) => {
    vibrate(VIBRATION_PATTERNS.SUCCESS);
    const itemData = ALCHEMY_LEVELS[highestTile];
    if (!itemData) {
        onClose();
        return;
    }

    if (sell) {
        handleEventOption(
          { money: itemData.price },
          `你结束了炼丹，将炼出的【${itemData.name}】出售。`
        );
    } else {
        handleEventOption(
          { itemsAdd: [itemData.id] },
          `你结束了炼丹，小心翼翼地收起了【${itemData.name}】。`
        );
    }
    onClose();
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/80">
      <div className="bg-[#f4e4bc] dark:bg-[#2c241b] p-6 rounded-xl w-full max-w-md shadow-2xl border-4 border-[#8b5a2b] dark:border-[#5c3a1b] relative">
        <button 
          onClick={() => {
            vibrate(VIBRATION_PATTERNS.LIGHT);
            onClose();
          }}
          className="absolute top-2 right-2 p-1 rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X size={24} className="text-[#8b5a2b] dark:text-[#d4b483]" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-[#8b5a2b] dark:text-[#d4b483] mb-1">丹房炼化</h2>
          <p className="text-sm text-[#8b5a2b]/80 dark:text-[#d4b483]/80">合成药材，炼制绝世仙丹</p>
        </div>

        {/* Game Board */}
        <div 
            className="bg-[#d4b483] dark:bg-[#4a3b2a] p-2 rounded-lg mb-6 touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-cols-4 gap-2">
            {board.map((row, r) => (
              row.map((val, c) => {
                const item = ALCHEMY_LEVELS[val];
                return (
                  <div 
                    key={`${r}-${c}`}
                    className={`
                      aspect-square rounded-md flex flex-col items-center justify-center p-1 transition-all duration-200
                      ${val === 0 ? 'bg-[#c2a370] dark:bg-[#3e3020]' : item?.color || 'bg-gray-500'}
                    `}
                  >
                    {val > 0 && (
                      <>
                        <span className={`font-bold text-xs sm:text-sm text-center leading-tight ${item?.textColor || 'text-white'}`}>
                          {item?.name}
                        </span>
                        <span className="text-[10px] text-white/90 font-mono mt-0.5">{val}</span>
                      </>
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>

        {/* Controls / Info */}
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#fff8e7] dark:bg-[#3e3020] p-3 rounded-lg border border-[#8b5a2b]/30 dark:border-[#d4b483]/30">
                <span className="text-[#8b5a2b] dark:text-[#d4b483] font-medium">当前最高品质:</span>
                <span className="font-bold text-[#8b5a2b] dark:text-[#d4b483]">
                    {ALCHEMY_LEVELS[highestTile]?.name || '无'}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleCashOut(true)}
                    className="flex gap-2 justify-center items-center p-3 text-white bg-green-600 rounded-lg transition-colors hover:bg-green-700"
                >
                    <Coins size={18} />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-xs opacity-90">出售换钱</span>
                        <span className="font-bold">{ALCHEMY_LEVELS[highestTile]?.price || 0} 文</span>
                    </div>
                </button>

                <button
                    onClick={() => handleCashOut(false)}
                    className="flex gap-2 justify-center items-center p-3 text-white bg-blue-600 rounded-lg transition-colors hover:bg-blue-700"
                >
                    <Backpack size={18} />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-xs opacity-90">收入行囊</span>
                        <span className="font-bold">保留物品</span>
                    </div>
                </button>
            </div>
            
            <div className="text-center">
                <button 
                    onClick={() => {
                        vibrate(VIBRATION_PATTERNS.MEDIUM);
                        initGame();
                    }}
                    className="text-xs text-[#8b5a2b]/60 dark:text-[#d4b483]/60 hover:text-[#8b5a2b] dark:hover:text-[#d4b483] flex items-center justify-center gap-1 mx-auto"
                >
                    <RefreshCw size={12} />
                    重置丹炉 (放弃当前进度)
                </button>
            </div>
        </div>

        {gameOver && (
            <div className="flex absolute inset-0 z-10 justify-center items-center rounded-xl bg-black/60 backdrop-blur-sm">
                <div className="p-6 m-4 text-center bg-card text-card-foreground rounded-lg duration-300 animate-in zoom-in border border-border shadow-xl">
                    <h3 className="mb-2 text-xl font-bold text-red-600 dark:text-red-400">丹炉已满！</h3>
                    <p className="mb-4 text-muted-foreground">无法再放入更多药材了。</p>
                    <p className="mb-6 font-medium text-foreground">最终炼成：{ALCHEMY_LEVELS[highestTile]?.name}</p>
                    <div className="flex flex-col gap-2">
                         <button
                            onClick={() => handleCashOut(true)}
                            className="p-2 w-full text-white bg-green-600 rounded hover:bg-green-700"
                        >
                            出售 ({ALCHEMY_LEVELS[highestTile]?.price} 文)
                        </button>
                        <button
                            onClick={() => handleCashOut(false)}
                            className="p-2 w-full text-white bg-blue-600 rounded hover:bg-blue-700"
                        >
                            保留物品
                        </button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
