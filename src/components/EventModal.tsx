import React from 'react';
import { GameEvent } from '@/types/game';

interface EventModalProps {
  event: GameEvent;
  onOptionSelect: (optionIndex: number) => void;
}

export const EventModal: React.FC<EventModalProps> = ({ event, onOptionSelect }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6 border animate-in fade-in zoom-in duration-200">
        <div className="mb-4">
          <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary uppercase">
            {event.type === 'daily' ? '日常' : event.type === 'opportunity' ? '机遇' : event.type === 'challenge' ? '挑战' : 'NPC'}
          </span>
        </div>
        <h2 className="text-2xl font-bold mb-2">{event.title}</h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {event.description}
        </p>
        
        <div className="space-y-3">
          {event.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onOptionSelect(index)}
              className="w-full p-3 text-left bg-secondary hover:bg-secondary/80 rounded-md transition-colors border border-transparent hover:border-primary/20"
            >
              <div className="font-medium">{option.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
