import React from 'react';
import { X, Sprout, Hammer, Utensils, ClipboardList, AlertTriangle } from 'lucide-react';

interface LeekGardenHelpModalProps {
  onClose: () => void;
}

export const LeekGardenHelpModal: React.FC<LeekGardenHelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-card rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200 border border-border">
        <div className="p-4 border-b flex justify-between items-center bg-muted/30">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="text-2xl">📖</span>
            韭菜园经营指南
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-8 bg-muted/10">
          
          <section>
            <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
              <Sprout className="w-5 h-5" /> 品种与种植
            </h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="p-3 bg-card rounded border border-border shadow-sm">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">常规韭菜</span>
                <p>成熟需 3 天，基础产量 3 把，基础品质 60。适合追求高品质订单与稳定高产。</p>
              </div>
              <div className="p-3 bg-card rounded border border-border shadow-sm">
                <span className="font-bold text-emerald-700 dark:text-emerald-400">快熟韭菜</span>
                <p>成熟需 2 天，基础产量 2 把，基础品质 55。适合快速回笼资金与应对短期急单。</p>
              </div>
              <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2 rounded text-xs mt-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>注意：种植会消耗地块肥力。当肥力低于 30 时，产量将减半。空置地块每日可自然恢复肥力。</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
              <Hammer className="w-5 h-5" /> 设施与管理
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground pl-2">
              <li><span className="font-bold text-foreground">滴灌系统</span>：每晚自动浇水，无需手动操作，稳定提升次日品质。</li>
              <li><span className="font-bold text-foreground">杀虫灯</span>：将虫害爆发率从 30% 降低至 5%，大幅保护收成。</li>
              <li><span className="font-bold text-foreground">手动操作</span>：未安装设施时，每日手动浇水可提升品质；手动施肥可加速生长（进度+1）。</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
              <Utensils className="w-5 h-5" /> 加工与增值
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              当鲜韭市场价格低迷时，通过加工坊制作<span className="font-bold text-amber-600 dark:text-amber-400">韭菜盒子</span>是明智之选。
            </p>
            <div className="flex items-center gap-2 text-sm bg-muted/50 p-2 rounded justify-center">
              <span>鲜韭 x2</span>
              <span>+</span>
              <span>2 文钱</span>
              <span>➜</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">韭菜盒子 x1 (售价约 10 文)</span>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-lg text-emerald-800 dark:text-emerald-300 mb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5" /> 合作社订单
            </h3>
            <p className="text-sm text-muted-foreground">
              每日有概率刷新合作社收购订单。虽然要求特定的<span className="font-bold">品质</span>与<span className="font-bold">数量</span>，但报酬通常是市场价的 1.5 倍以上。请留意订单的剩余天数！
            </p>
          </section>

        </div>
        
        <div className="p-4 border-t bg-muted/30 text-center border-border">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-emerald-600 text-white font-bold rounded hover:bg-emerald-700 transition-colors"
          >
            明白了，开始赚钱！
          </button>
        </div>
      </div>
    </div>
  );
};
