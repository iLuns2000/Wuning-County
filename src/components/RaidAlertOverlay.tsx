import React, { useEffect, useState } from 'react';

interface RaidAlertOverlayProps {
  moneyLoss?: number;
  orderLoss?: number;
  livelihoodLoss?: number;
  onDismiss: () => void;
}

export const RaidAlertOverlay: React.FC<RaidAlertOverlayProps> = ({
  moneyLoss,
  orderLoss,
  livelihoodLoss,
  onDismiss,
}) => {
  const [phase, setPhase] = useState<'flash' | 'main' | 'out'>('flash');

  useEffect(() => {
    // 短暂红色闪烁后进入主界面
    const t1 = setTimeout(() => setPhase('main'), 400);
    // 5 秒后自动消失
    const t2 = setTimeout(() => setPhase('out'), 5400);
    const t3 = setTimeout(() => onDismiss(), 5900);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDismiss]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{ pointerEvents: phase === 'flash' ? 'none' : 'auto' }}
      onClick={phase === 'main' ? onDismiss : undefined}
    >
      {/* 背景：深红渐变 + 动态噪点纹理 */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(ellipse at center, #3d0000 0%, #1a0000 60%, #000 100%)',
          opacity: phase === 'flash' ? 1 : phase === 'main' ? 0.93 : 0,
        }}
      />

      {/* 红色脉冲扫光 */}
      {phase === 'main' && (
        <>
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              background: 'radial-gradient(ellipse at 50% 50%, rgba(220,0,0,0.18) 0%, transparent 70%)',
            }}
          />
          {/* 左上角扫光线 */}
          <div
            className="absolute top-0 left-0 w-full h-1 opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent, #ff2200, transparent)',
              animation: 'scanline 2s linear infinite',
            }}
          />
        </>
      )}

      {/* 火焰粒子（纯 CSS） */}
      {phase === 'main' && (
        <div className="absolute inset-x-0 bottom-0 h-40 overflow-hidden pointer-events-none">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 rounded-full"
              style={{
                left: `${(i / 17) * 100}%`,
                width: `${10 + Math.sin(i * 1.3) * 8}px`,
                height: `${30 + Math.sin(i * 0.9) * 20}px`,
                background: `linear-gradient(to top, #ff6600, #ff2200, #ffcc00)`,
                opacity: 0.7 + Math.sin(i) * 0.2,
                animation: `flame ${0.8 + (i % 5) * 0.15}s ease-in-out ${(i % 7) * 0.1}s infinite alternate`,
                transform: `translateX(-50%)`,
                filter: 'blur(2px)',
              }}
            />
          ))}
        </div>
      )}

      {/* 主内容 */}
      <div
        className="relative z-10 flex flex-col items-center gap-6 px-8 py-10 text-center transition-all duration-500 select-none"
        style={{
          opacity: phase === 'main' ? 1 : 0,
          transform: phase === 'main' ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
        }}
      >
        {/* 警报标题 */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="text-6xl font-black tracking-widest animate-pulse"
            style={{
              color: '#ff2200',
              textShadow: '0 0 20px #ff4400, 0 0 40px #ff0000, 0 0 80px #880000',
              fontFamily: 'serif',
            }}
          >
            ！战火警报！
          </div>
          <div
            className="text-2xl font-bold tracking-[0.3em]"
            style={{
              color: '#ffcc44',
              textShadow: '0 0 12px #ff8800',
            }}
          >
            山贼夜袭县境
          </div>
        </div>

        {/* 分割线 */}
        <div className="w-64 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff4400, transparent)' }} />

        {/* 损失明细 */}
        <div
          className="flex flex-col gap-3 px-8 py-5 rounded-lg border"
          style={{
            background: 'rgba(80, 0, 0, 0.7)',
            borderColor: 'rgba(255, 50, 0, 0.4)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <p className="text-sm font-semibold tracking-widest" style={{ color: '#ff9966' }}>
            — 本次损失 —
          </p>
          {moneyLoss !== undefined && moneyLoss > 0 && (
            <div className="flex items-center gap-3 text-lg font-bold" style={{ color: '#ffdd88' }}>
              <span style={{ color: '#ff6644' }}>💰</span>
              <span>银两损失</span>
              <span style={{ color: '#ff4422' }}>-{moneyLoss} 文</span>
            </div>
          )}
          {orderLoss !== undefined && orderLoss > 0 && (
            <div className="flex items-center gap-3 text-lg font-bold" style={{ color: '#ffdd88' }}>
              <span>⚔️</span>
              <span>治安下降</span>
              <span style={{ color: '#ff4422' }}>-{orderLoss}</span>
            </div>
          )}
          {livelihoodLoss !== undefined && livelihoodLoss > 0 && (
            <div className="flex items-center gap-3 text-lg font-bold" style={{ color: '#ffdd88' }}>
              <span>🏚️</span>
              <span>民生受损</span>
              <span style={{ color: '#ff4422' }}>-{livelihoodLoss}</span>
            </div>
          )}
        </div>

        {/* 提示 */}
        <p
          className="text-xs tracking-widest animate-pulse"
          style={{ color: 'rgba(255,180,100,0.7)' }}
        >
          点击任意处关闭 · 加强巡防可降低战火风险
        </p>
      </div>

      {/* 初始全屏红闪 */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: '#cc0000',
          opacity: phase === 'flash' ? 0.85 : 0,
        }}
      />

      <style>{`
        @keyframes flame {
          0%   { transform: translateX(-50%) scaleY(1)   scaleX(1); }
          100% { transform: translateX(-50%) scaleY(1.35) scaleX(0.85); }
        }
        @keyframes scanline {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100vw); }
        }
      `}</style>
    </div>
  );
};
