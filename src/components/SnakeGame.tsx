import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';
import { X, Coins, Play, Pause, RotateCcw } from 'lucide-react';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface SnakeGameProps {
  onClose: () => void;
}

type Point = { x: number; y: number };

const GRID_COLS = 20;
const GRID_ROWS = 20;
const INITIAL_SPEED_MS = 200;
const MIN_SPEED_MS = 80;
const SPEED_STEP_MS = 8;

export const SnakeGame: React.FC<SnakeGameProps> = ({ onClose }) => {
  const { handleEventOption } = useGameStore();
  const vibrate = useGameVibrate();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const dirRef = useRef<Point>({ x: 1, y: 0 });
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [running, setRunning] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speedMs, setSpeedMs] = useState(INITIAL_SPEED_MS);
  const [touchStart, setTouchStart] = useState<Point | null>(null);

  const placeFood = useCallback((exclude: Point[]) => {
    const occupied = new Set(exclude.map(p => `${p.x},${p.y}`));
    let fx = 0;
    let fy = 0;
    do {
      fx = Math.floor(Math.random() * GRID_COLS);
      fy = Math.floor(Math.random() * GRID_ROWS);
    } while (occupied.has(`${fx},${fy}`));
    setFood({ x: fx, y: fy });
  }, []);

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const w = container.clientWidth;
    const size = Math.max(240, Math.min(480, w));
    canvas.width = size;
    canvas.height = size;
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cellW = canvas.width / GRID_COLS;
    const cellH = canvas.height / GRID_ROWS;

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    for (let c = 0; c < GRID_COLS; c++) {
      for (let r = 0; r < GRID_ROWS; r++) {
        ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
      }
    }

    ctx.fillStyle = '#ef4444';
    ctx.fillRect(food.x * cellW, food.y * cellH, cellW, cellH);

    ctx.fillStyle = '#10b981';
    snake.forEach((p, i) => {
      const hue = 160 - Math.min(120, i * 6);
      ctx.fillStyle = `hsl(${hue}, 70%, 45%)`;
      ctx.fillRect(p.x * cellW, p.y * cellH, cellW, cellH);
    });
  }, [snake, food]);

  useEffect(() => {
    draw();
  }, [draw]);

  const tick = useCallback(() => {
    setSnake(prev => {
      const head = prev[0];
      const next = { x: head.x + dirRef.current.x, y: head.y + dirRef.current.y };

      if (next.x < 0 || next.x >= GRID_COLS || next.y < 0 || next.y >= GRID_ROWS) {
        setRunning(false);
        setGameOver(true);
        vibrate(VIBRATION_PATTERNS.MEDIUM);
        return prev;
      }

      for (let i = 0; i < prev.length; i++) {
        if (prev[i].x === next.x && prev[i].y === next.y) {
          setRunning(false);
          setGameOver(true);
          vibrate(VIBRATION_PATTERNS.MEDIUM);
          return prev;
        }
      }

      const ate = next.x === food.x && next.y === food.y;
      const newSnake = [next, ...prev];
      if (!ate) newSnake.pop();

      if (ate) {
        setScore(s => s + 1);
        vibrate(VIBRATION_PATTERNS.SUCCESS);
        placeFood(newSnake);
        setSpeedMs(ms => Math.max(MIN_SPEED_MS, ms - SPEED_STEP_MS));
      }

      return newSnake;
    });
  }, [placeFood, vibrate, food]);

  useEffect(() => {
    if (!running || gameOver) return;
    const id = setInterval(tick, speedMs);
    return () => clearInterval(id);
  }, [running, gameOver, speedMs, tick]);

  const changeDir = useCallback((nx: number, ny: number) => {
    const cur = dirRef.current;
    if (cur.x === -nx && cur.y === -ny) return;
    dirRef.current = { x: nx, y: ny };
  }, []);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') changeDir(0, -1);
    else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') changeDir(0, 1);
    else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') changeDir(-1, 0);
    else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') changeDir(1, 0);
    else if (e.key.toLowerCase() === ' ') setRunning(r => !r);
  }, [changeDir]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;
    const th = 24;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > th) changeDir(dx > 0 ? 1 : -1, 0);
    } else {
      if (Math.abs(dy) > th) changeDir(0, dy > 0 ? 1 : -1);
    }
    setTouchStart(null);
  };

  const reset = () => {
    setSnake([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
    dirRef.current = { x: 1, y: 0 };
    setScore(0);
    setSpeedMs(INITIAL_SPEED_MS);
    setGameOver(false);
    setRunning(true);
    placeFood([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  };

  const cashOut = () => {
    const reward = Math.min(50, score);
    if (reward > 0) {
      vibrate(VIBRATION_PATTERNS.SUCCESS);
      handleEventOption({ money: reward }, `【大吃一口】你吞下了不少果子，兑换 ${reward} 文。`);
    }
    onClose();
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/80">
      <div className="relative p-4 w-full max-w-md rounded-xl border shadow-2xl bg-card text-card-foreground">
        <button
          onClick={() => {
            vibrate(VIBRATION_PATTERNS.LIGHT);
            onClose();
          }}
          className="absolute top-2 right-2 p-1 rounded-full transition-colors hover:bg-black/10 dark:hover:bg-white/10"
        >
          <X size={20} />
        </button>

        <div className="mb-3 text-center">
          <h2 className="text-xl font-bold">大吃一口 · 贪吃蛇</h2>
          <p className="text-xs text-muted-foreground">键盘或触控操控，尽量多吃食物</p>
        </div>

        <div ref={containerRef} className="mx-auto w-full max-w-md">
          <div
            className="overflow-hidden relative w-full rounded-md border select-none aspect-square touch-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex gap-3 justify-center items-center p-3 rounded-lg bg-muted">
            <span className="text-sm">分数</span>
            <span className="text-lg font-bold">{score}</span>
          </div>
          <div className="flex gap-2 justify-center items-center p-3 rounded-lg bg-muted">
            <span className="text-sm">速度</span>
            <span className="text-lg font-bold">{Math.round(1000 / speedMs)}x</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            onClick={() => setRunning(r => !r)}
            className="flex gap-2 justify-center items-center p-2 rounded-lg border hover:bg-accent"
          >
            {running ? <Pause size={16} /> : <Play size={16} />}
            <span className="text-sm">{running ? '暂停' : '开始'}</span>
          </button>
          <button
            onClick={reset}
            className="flex gap-2 justify-center items-center p-2 rounded-lg border hover:bg-accent"
          >
            <RotateCcw size={16} />
            <span className="text-sm">重开</span>
          </button>
          <button
            onClick={cashOut}
            className="flex gap-2 justify-center items-center p-2 rounded-lg border hover:bg-green-600 hover:text-white"
          >
            <Coins size={16} />
            <span className="text-sm">结算</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 md:hidden">
          <button onClick={() => changeDir(0, -1)} className="p-3 rounded-lg border">↑</button>
          <div className="flex gap-2 justify-center items-center">
            <button onClick={() => changeDir(-1, 0)} className="p-3 rounded-lg border">←</button>
            <button onClick={() => changeDir(1, 0)} className="p-3 rounded-lg border">→</button>
          </div>
          <button onClick={() => changeDir(0, 1)} className="p-3 rounded-lg border">↓</button>
        </div>

        {gameOver && (
          <div className="p-3 mt-3 text-center text-red-800 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-200">
            <div className="font-bold">游戏结束</div>
            <div className="text-sm">本局分数 {score}</div>
          </div>
        )}
      </div>
    </div>
  );
};

