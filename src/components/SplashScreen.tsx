import React, { useState, useEffect } from 'react';

// 启动画面组件 - 显示加载动画直到游戏准备好
export const SplashScreen: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('初始化中...');

  useEffect(() => {
    // 模拟加载过程
    const steps = [
      { progress: 20, text: '加载资源...' },
      { progress: 40, text: '构建县城...' },
      { progress: 60, text: '初始化NPC...' },
      { progress: 80, text: '配置事件...' },
      { progress: 100, text: '准备就绪!' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setTimeout(onReady, 300);
        return;
      }

      setProgress(steps[currentStep].progress);
      setLoadingText(steps[currentStep].text);
      currentStep++;
    }, 200);

    return () => clearInterval(interval);
  }, [onReady]);

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-amber-900 to-amber-950">
      {/* 标题 */}
      <h1 
        className="text-5xl md:text-6xl font-bold text-amber-100 mb-8 font-display"
        style={{
          textShadow: '0 4px 20px rgba(0,0,0,0.5)',
          animation: 'pulse 2s ease-in-out infinite'
        }}
      >
        无宁县志
      </h1>

      {/* 加载动画 */}
      <div className="relative w-32 h-32 mb-8">
        {/* 外圈 */}
        <div className="absolute inset-0 border-4 border-amber-700/30 rounded-full" />
        {/* 旋转的光圈 */}
        <div 
          className="absolute inset-0 border-4 border-transparent border-t-amber-400 rounded-full animate-spin"
          style={{ animationDuration: '1.5s' }}
        />
        {/* 内圈 */}
        <div className="absolute inset-4 border-2 border-amber-600/50 rounded-full" />
        {/* 中心点 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse" />
        </div>
      </div>

      {/* 进度条 */}
      <div className="w-64 h-2 bg-amber-900/50 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 加载文字 */}
      <p className="text-amber-300/80 text-sm animate-pulse">
        {loadingText}
      </p>

      {/* 装饰文字 */}
      <p className="absolute bottom-8 text-amber-500/40 text-xs">
        一段属于你的文字江湖
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;