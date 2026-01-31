import React, { useState, useEffect } from 'react';
import { X, Heart, Package, Trees } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface WillowGardenModalProps {
  onClose: () => void;
}

export const WillowGardenModal: React.FC<WillowGardenModalProps> = ({ onClose }) => {
  const { 
    disasterState, 
    ownedGoods, 
    donateDisasterRelief
  } = useGameStore();
  const vibrate = useGameVibrate();
  
  const [donateType, setDonateType] = useState<'grain' | 'cloth'>('grain');
  const [amount, setAmount] = useState<number>(1);

  // Reset amount when type changes or max changes
  const maxAmount = ownedGoods[donateType] || 0;
  
  useEffect(() => {
    if (amount > maxAmount) {
        setAmount(Math.max(1, maxAmount));
    }
    if (maxAmount === 0) {
        setAmount(0);
    } else if (amount === 0) {
        setAmount(1);
    }
  }, [donateType, maxAmount]);

  const handleDonate = () => {
    if (amount <= 0) return;
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    donateDisasterRelief(donateType, amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-card border-2 border-primary/20 rounded-xl shadow-2xl overflow-hidden m-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-muted/50">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Trees className="w-5 h-5 text-green-600" /> 柳园
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
           <div className="mb-6 text-muted-foreground">
              <p>柳园景色宜人，是县中百姓游玩休憩的好去处。</p>
           </div>

           {disasterState.active && disasterState.type === 'flood' ? (
             <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h3 className="font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                   <Heart className="w-4 h-4" /> 柳园南 - 赈灾募捐处
                </h3>
                <p className="text-sm mb-4 text-muted-foreground">
                   洪水肆虐，百姓流离失所。县衙在此设立募捐处，接收粮草与布匹，以解燃眉之急。
                </p>
                
                <div className="flex gap-2 mb-4">
                   <button 
                     onClick={() => setDonateType('grain')}
                     className={`flex-1 py-2 px-1 rounded border text-sm transition-colors ${donateType === 'grain' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent'}`}
                   >
                     粮草 (拥有: {ownedGoods['grain'] || 0})
                   </button>
                   <button 
                     onClick={() => setDonateType('cloth')}
                     className={`flex-1 py-2 px-1 rounded border text-sm transition-colors ${donateType === 'cloth' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card hover:bg-accent'}`}
                   >
                     布匹 (拥有: {ownedGoods['cloth'] || 0})
                   </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                   <input 
                     type="range" 
                     min="1" 
                     max={Math.max(1, maxAmount)} 
                     value={amount || 1}
                     onChange={(e) => setAmount(parseInt(e.target.value))}
                     className="flex-1 accent-red-600"
                     disabled={maxAmount < 1}
                   />
                   <span className="w-12 text-center font-mono">{amount}</span>
                </div>
                
                <button
                  onClick={handleDonate}
                  disabled={maxAmount < 1}
                  className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Package className="w-4 h-4" /> 确认捐赠
                </button>
             </div>
           ) : (
             <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                <p>园中风平浪静，游人如织。</p>
                <p className="text-xs mt-2">(暂无特殊事件)</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
