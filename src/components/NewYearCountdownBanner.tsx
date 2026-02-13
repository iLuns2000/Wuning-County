import React, { useEffect, useMemo, useState } from 'react';

const START_EPOCH = Date.UTC(2026, 1, 16, 14, 0, 0);
const TARGET_EPOCH = Date.UTC(2026, 1, 16, 16, 0, 0);

const formatLeft = (ms: number) => {
  if (ms <= 0) return '已经到来';
  const totalSeconds = Math.floor(ms / 1000);
  const d = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}天`);
  parts.push(`${h}小时`);
  parts.push(`${m}分`);
  parts.push(`${s}秒`);
  return parts.join('');
};

export const NewYearCountdownBanner: React.FC = () => {
  const [now, setNow] = useState<number>(() => Date.now());
  const [visible, setVisible] = useState<boolean>(() => now >= START_EPOCH && now < TARGET_EPOCH);

  useEffect(() => {
    const id = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= TARGET_EPOCH) setVisible(false);
      else if (t >= START_EPOCH) setVisible(true);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const leftMs = useMemo(() => Math.max(0, TARGET_EPOCH - now), [now]);

  if (!visible) return null;

  return (
    <div className="fixed top-2 left-1/2 z-50 -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-sm pointer-events-none select-none">
      <span className="font-semibold">距离新的一年到来还有</span>
      <span className="ml-1 font-mono">{formatLeft(leftMs)}</span>
    </div>
  );
};

export default NewYearCountdownBanner;
