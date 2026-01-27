import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';

export const MobileLogToast: React.FC = () => {
  const logs = useGameStore((state) => state.logs);
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

      // Hide after 0.5s as requested
      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 500);
    }
  }, [logs]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-16 left-1/2 z-50 px-4 py-2 max-w-[90vw] text-sm text-center text-white -translate-x-1/2 rounded-lg shadow-lg pointer-events-none bg-black/80 backdrop-blur-sm md:hidden animate-in slide-in-from-top-4 fade-in duration-200">
      {message}
    </div>
  );
};
