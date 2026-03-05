import React from 'react';
import { X, Briefcase, BookOpen, User } from 'lucide-react';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface ChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  choices: Array<{
    id: string;
    label: string;
    description: string;
    icon?: React.ReactNode;
    effects: Array<string>;
    onClick: () => void;
  }>;
}

export const ChoiceModal: React.FC<ChoiceModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  choices
}) => {
  const vibrate = useGameVibrate();

  if (!isOpen) return null;

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
      <div className="relative p-6 w-full max-w-lg rounded-lg border shadow-lg duration-200 bg-card text-card-foreground border-border animate-in fade-in zoom-in">
        <button
          onClick={() => {
            vibrate(VIBRATION_PATTERNS.LIGHT);
            onClose();
          }}
          className="absolute top-4 right-4 p-1 rounded-md hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
        </div>

        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">{description}</p>

        <div className="space-y-3">
          {choices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.MEDIUM);
                choice.onClick();
              }}
              className="w-full p-4 text-left rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-200 group"
            >
              <div className="flex items-start gap-3">
                {choice.icon && (
                  <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                    {choice.icon}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-base group-hover:text-primary transition-colors">
                      {choice.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{choice.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {choice.effects.map((effect, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground"
                      >
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
