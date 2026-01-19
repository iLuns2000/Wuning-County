import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';

export const Watermark: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useGameStore();
  const [clickCount, setClickCount] = useState(0);

  const handleDevClick = () => {
    if (!role) return; // Only active when role is selected

    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 20) {
      navigate('/developer');
      setClickCount(0);
    }
  };

  return (
    <div className="fixed bottom-2 right-4 z-50 text-right pointer-events-none select-none md:bottom-4 md:right-6">
      <div className="flex flex-col items-end gap-0.5 text-[10px] md:text-xs text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors pointer-events-auto">
        <p 
          onClick={handleDevClick} 
          className="cursor-default active:text-primary transition-colors"
        >
          开发者：鲨鱼剃须刀
        </p>
        <p>共创者：全体npc慕司</p>
        <button 
          onClick={() => navigate('/credits')}
          className="hover:text-primary hover:underline transition-all mt-0.5 cursor-pointer"
        >
          感谢名单
        </button>
      </div>
    </div>
  );
};
