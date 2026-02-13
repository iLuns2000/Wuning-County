import React, { useEffect, useRef, useState } from 'react';

const PERIOD_START = Date.UTC(2026, 1, 16, 16, 0, 0);
const PERIOD_END = Date.UTC(2026, 1, 23, 15, 59, 59);
const STORAGE_KEY = 'splash_2026_02_17_23_shown';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  tx?: number;
  ty?: number;
};

const pickShapeUrl = (): string | undefined => {
  const envUrl = (import.meta as any)?.env?.VITE_FIREWORKS_SHAPE_URL as string | undefined;
  if (envUrl && envUrl.trim().length > 0) return envUrl.trim();
  return '/fireworks-shape.png';
};

export const FireworksSplash: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [show, setShow] = useState<boolean>(() => {
    const now = Date.now();
    if (now < PERIOD_START || now > PERIOD_END) return false;
    if (localStorage.getItem(STORAGE_KEY) === '1') return false;
    return true;
  });
  const [stage, setStage] = useState<'fireworks' | 'morph' | 'done'>('fireworks');
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>();
  const imageRef = useRef<HTMLImageElement | null>(null);
  const targetsRef = useRef<Array<{ x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (!show) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const resize = () => {
      const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
    };
    resize();
    const onResize = () => resize();
    window.addEventListener('resize', onResize);

    const spawnExplosion = () => {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height * 0.6 + canvas.height * 0.1;
      const count = 60 + Math.floor(Math.random() * 40);
      const hue = Math.floor(Math.random() * 360);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const speed = 2 + Math.random() * 4;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 80 + Math.random() * 40,
          color: `hsl(${hue}, 100%, ${50 + Math.random() * 20}%)`
        });
      }
    };

    let lastSpawn = 0;
    let elapsed = 0;

    const step = () => {
      rafRef.current = requestAnimationFrame(step);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elapsed += 1;
      if (elapsed - lastSpawn > 30) {
        lastSpawn = elapsed;
        spawnExplosion();
      }
      const g = 0.06;
      const arr = particlesRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        if (stage === 'morph' && p.tx !== undefined && p.ty !== undefined) {
          const ax = (p.tx - p.x) * 0.05;
          const ay = (p.ty - p.y) * 0.05;
          p.vx = (p.vx + ax) * 0.92;
          p.vy = (p.vy + ay) * 0.92;
        } else {
          p.vy += g;
          p.vx *= 0.99;
          p.vy *= 0.99;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        ctx.beginPath();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 120));
        ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (p.life <= 0 && stage !== 'morph') arr.splice(i, 1);
      }

      if (stage === 'fireworks' && targetsRef.current.length > 0 && elapsed > 120) {
        setStage('morph');
      }
      if (stage === 'morph') {
        if (imageRef.current && targetsRef.current.length > 0) {
          if (arr.length < targetsRef.current.length) {
            const needed = targetsRef.current.length - arr.length;
            for (let i = 0; i < needed; i++) {
              const t = targetsRef.current[i % targetsRef.current.length];
              arr.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: 0,
                vy: 0,
                life: 200,
                color: t.color,
                tx: t.x,
                ty: t.y
              });
            }
          } else {
            for (let i = 0; i < targetsRef.current.length; i++) {
              const t = targetsRef.current[i];
              const p = arr[i];
              if (!p) break;
              p.tx = t.x;
              p.ty = t.y;
              p.color = t.color;
            }
          }
        }
      }
    };

    rafRef.current = requestAnimationFrame(step);

    const imgUrl = pickShapeUrl();
    if (imgUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      imageRef.current = img;
      img.onload = () => {
        const off = document.createElement('canvas');
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.6;
        const w = Math.floor(img.width * ratio);
        const h = Math.floor(img.height * ratio);
        off.width = w;
        off.height = h;
        const ox = (canvas.width - w) / 2;
        const oy = (canvas.height - h) / 2;
        const octx = off.getContext('2d');
        if (octx) {
          octx.drawImage(img, 0, 0, w, h);
          const data = octx.getImageData(0, 0, w, h).data;
          const targets: Array<{ x: number; y: number; color: string }> = [];
          const step = Math.max(6, Math.floor(Math.min(w, h) / 80));
          for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
              const idx = (y * w + x) * 4;
              const a = data[idx + 3];
              if (a > 128) {
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                const color = `rgb(${r},${g},${b})`;
                targets.push({ x: ox + x, y: oy + y, color });
              }
            }
          }
          targetsRef.current = targets;
          if (targetsRef.current.length > 0) {
            setStage('morph');
          }
        }
      };
      img.onerror = () => {
        imageRef.current = null;
      };
      img.src = imgUrl;
    }

    const finishTimer = setTimeout(() => {
      setStage('done');
      setShow(false);
      localStorage.setItem(STORAGE_KEY, '1');
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }, 10000);

    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(finishTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="flex fixed inset-0 z-50 justify-center items-center bg-black/80"
      onClick={() => {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, '1');
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 px-3 py-1 text-xs text-white rounded bg-white/10">点击跳过</div>
    </div>
  );
};

export default FireworksSplash;
