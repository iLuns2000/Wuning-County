import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export const MobileLogToast: React.FC = () => {
  const logs = useGameStore((state) => state.logs);
  const mobileToastSeconds = useGameStore((state) => state.timeSettings.mobileToastSeconds ?? 1);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const isFirstRender = useRef(true);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Skip the first render to avoid showing old logs on page load
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (logs.length > 0) {
      setMessage(logs[0]);
      setVisible(true);

      // Clear existing timer if any
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, Math.max(1000, Math.min(5000, Math.floor(mobileToastSeconds * 1000))));
    }
  }, [logs, mobileToastSeconds]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getToastStyle = (msg: string) => {
    const positiveKeywords = ['+', '获得', '成功', '提升', '领悟', '恢复', '增加', '盈利'];
    const negativeKeywords = ['-', '减少', '失败', '扣除', '损失', '丢失', '下降'];
    
    const hasPositive = positiveKeywords.some(k => msg.includes(k));
    const hasNegative = negativeKeywords.some(k => msg.includes(k));
    
    // Priority: Positive > Negative (e.g. Work: Health -5, Money +10 => Positive)
    if (hasPositive) return 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-emerald-500/20'; // Blue-Green
    if (hasNegative) return 'bg-gradient-to-r from-red-500 to-orange-500 shadow-red-500/20';       // Red/Error
    return 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-amber-500/20';                   // Yellow/Warning (Default)
  };

  if (!visible) return null;

  return (
    <div className={`fixed top-16 left-1/2 z-50 px-4 py-2 text-sm text-center text-white rounded-lg shadow-lg duration-200 -translate-x-1/2 pointer-events-none max-w-[90vw] md:hidden animate-in slide-in-from-top-4 fade-in ${getToastStyle(message)}`}>
      {message}
    </div>
  );
};
