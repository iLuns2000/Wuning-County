import React, { useEffect, useState } from 'react';
import { Award, X } from 'lucide-react';
import { Achievement } from '@/types/game';

interface AchievementPopupProps {
  achievement: Achievement;
  onClose: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 4000); // Show for 4 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className={`fixed top-8 right-8 z-50 transition-all duration-500 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-card border-2 border-primary/20 rounded-lg shadow-lg p-4 max-w-sm flex items-start gap-4 overflow-hidden relative">
        {/* Shine effect background */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent -skew-x-12 animate-pulse pointer-events-none" />
        
        <div className="bg-primary/10 p-2 rounded-full shrink-0">
          <Award size={32} className="text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-lg text-primary mb-1">成就达成！</h4>
            <button 
              onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }}
              className="text-muted-foreground hover:text-foreground -mt-1 -mr-1"
            >
              <X size={16} />
            </button>
          </div>
          <h5 className="font-bold mb-1 truncate">{achievement.name}</h5>
          <p className="text-sm text-muted-foreground line-clamp-2">{achievement.description}</p>
          <div className="mt-2 text-xs font-medium text-primary/80 bg-primary/5 inline-block px-2 py-0.5 rounded">
            阅历 +{achievement.rewardExp}
          </div>
        </div>
      </div>
    </div>
  );
};
