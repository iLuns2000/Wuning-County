/*
 * @Author: xyZhan
 * @Date: 2026-01-19 21:55:19
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-01-19 21:55:32
 * @FilePath: \textgame\src\components\PolicyModal.tsx
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import React from 'react';
import { policies } from '@/data/policies';
import { useGameStore } from '@/store/gameStore';
import { X, Check } from 'lucide-react';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface PolicyModalProps {
  activePolicyId?: string;
  onSelect: (policyId: string) => void;
  onCancel: () => void;
  onClose: () => void;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ 
  activePolicyId, 
  onSelect, 
  onCancel, 
  onClose 
}) => {
  const { playerStats } = useGameStore();
  const vibrate = useGameVibrate();

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
      <div className="w-full max-w-lg bg-card text-card-foreground rounded-xl shadow-xl border overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">施政方针</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            颁布政令可以持续影响县城的发展方向。同一时间只能施行一项政令。
            <br/>
            颁布新政令需要消耗声望。
          </p>

          <div className="space-y-3">
            {policies.map(policy => {
              const isActive = activePolicyId === policy.id;
              const canAfford = playerStats.reputation >= policy.cost;

              return (
                <div 
                  key={policy.id}
                  className={`relative p-4 rounded-lg border-2 transition-all ${
                    isActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold">{policy.name}</h3>
                    {isActive && (
                      <span className="flex gap-1 items-center px-2 py-1 text-xs rounded-full bg-primary text-primary-foreground">
                        <Check size={12} /> 生效中
                      </span>
                    )}
                  </div>
                  
                  <p className="mb-3 text-sm whitespace-pre-line text-muted-foreground">
                    {policy.description}
                  </p>

                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      消耗: {policy.cost} 声望
                    </span>
                    
                    {isActive ? (
                      <button
                        onClick={() => { 
                            vibrate(VIBRATION_PATTERNS.MEDIUM);
                            onCancel(); 
                            onClose(); 
                        }}
                        className="px-4 py-2 text-sm rounded-md transition-colors bg-destructive/10 text-destructive hover:bg-destructive/20"
                      >
                        废除政令
                      </button>
                    ) : (
                      <button
                        onClick={() => { 
                            vibrate(VIBRATION_PATTERNS.SUCCESS);
                            onSelect(policy.id); 
                            onClose(); 
                        }}
                        disabled={!canAfford}
                        className="px-4 py-2 text-sm rounded-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        {canAfford ? '颁布' : '声望不足'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
