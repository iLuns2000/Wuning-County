/**
 * 古风日志面板 - LogPanel 优化版
 * 包含新日志滑入动画和古风样式
 */
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useGameStore } from '@/store/gameStore';

interface LogPanelProps {
  logs: string[];
}

type LogStyle = {
  bg: string;
  border: string;
  text: string;
  prefix?: string;
  prefixColor: string;
  icon?: string;
};

// 获取日志样式
function getLogStyle(log: string): LogStyle {
  // 正面效果
  if (log.includes('获得') || log.includes('+') || log.includes('收益') || log.includes('奖励')) {
    return {
      bg: 'bg-emerald-950/30',
      border: 'border-l-2 border-emerald-500/60',
      text: 'text-emerald-200/90',
      prefixColor: 'text-emerald-400',
      icon: '✨',
    };
  }
  // 负面效果
  if (log.includes('损失') || log.includes('-') || log.includes('扣除') || log.includes('减少')) {
    return {
      bg: 'bg-red-950/30',
      border: 'border-l-2 border-red-500/60',
      text: 'text-red-200/90',
      prefixColor: 'text-red-400',
      icon: '💔',
    };
  }
  // 金钱相关
  if (log.includes('文') || log.includes('银两') || log.includes('金钱')) {
    return {
      bg: 'bg-amber-950/20',
      border: 'border-l-2 border-amber-500/40',
      text: 'text-amber-200/80',
      prefixColor: 'text-amber-400',
      icon: '💰',
    };
  }
  // 声望相关
  if (log.includes('声望') || log.includes('名望')) {
    return {
      bg: 'bg-purple-950/20',
      border: 'border-l-2 border-purple-500/40',
      text: 'text-purple-200/80',
      prefixColor: 'text-purple-400',
      icon: '⭐',
    };
  }
  // Debuff 触发
  if (log.includes('【Debuff触发】')) {
    return {
      bg: 'bg-red-950/50',
      border: 'border-l-2 border-red-500',
      text: 'text-red-200',
      prefix: '⚠ Debuff',
      prefixColor: 'text-red-400 font-bold',
      icon: '⛔',
    };
  }
  // Debuff 生效
  if (log.includes('【Debuff生效】')) {
    return {
      bg: 'bg-red-950/30',
      border: 'border-l-2 border-red-700',
      text: 'text-red-300/80',
      prefix: '↓ 效果',
      prefixColor: 'text-red-500',
      icon: '⏳',
    };
  }
  // Debuff 解除
  if (log.includes('【Debuff解除】')) {
    return {
      bg: 'bg-emerald-950/30',
      border: 'border-l-2 border-emerald-600',
      text: 'text-emerald-300/80',
      prefix: '✓ 解除',
      prefixColor: 'text-emerald-400',
      icon: '✅',
    };
  }
  // 系统提示
  if (log.includes('【') && log.includes('】')) {
    const match = log.match(/【(.+?)】/);
    return {
      bg: 'bg-blue-950/20',
      border: 'border-l-2 border-blue-500/40',
      text: 'text-blue-200/80',
      prefix: match ? `【${match[1]}】` : undefined,
      prefixColor: 'text-blue-400',
      icon: '📜',
    };
  }
  // 默认样式
  return {
    bg: '',
    border: 'border-b border-white/5',
    text: 'text-muted-foreground',
    prefixColor: '',
    icon: '▸',
  };
}

// 日志条目组件
const LogEntry: React.FC<{ log: string; index: number; isNew?: boolean }> = ({ log, index, isNew }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const style = getLogStyle(log);
  const isDebuffRelated = log.includes('【Debuff触发】') || log.includes('【Debuff生效】') || log.includes('【Debuff解除】');
  
  // 提取前缀和内容
  const prefixMatch = log.match(/^(【.+?】)/);
  const prefix = style.prefix || (prefixMatch ? prefixMatch[1] : null);
  const content = prefix ? log.replace(prefix, '') : log;

  return (
    <div
      className={`
        relative pb-1 text-sm transition-all duration-300
        ${style.border} ${style.bg}
        ${isDebuffRelated ? 'px-2 py-1 rounded mb-0.5' : ''}
        ${isNew ? 'log-entry opacity-0 translate-x-[-10px]' : ''}
        hover:bg-white/5 hover:px-1 rounded
      `}
      onMouseEnter={() => isDebuffRelated && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ animationDelay: isNew ? `${index * 0.05}s` : '0s' }}
    >
      {/* 图标 */}
      {style.icon && (
        <span className="mr-1.5 text-xs opacity-70">{style.icon}</span>
      )}
      
      {/* 日志前缀 */}
      {prefix && (
        <span className={style.prefixColor + " font-medium mr-1"}>
          {prefix}
        </span>
      )}
      
      {/* 日志内容 */}
      <span className={style.text}>{content}</span>

      {/* 底部装饰线（非最后一项） */}
      {!isDebuffRelated && style.border.includes('border-b') && (
        <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent to-transparent via-white/5" />
      )}

      {/* Tooltip */}
      {isDebuffRelated && showTooltip && (
        <div
          className="absolute left-0 bottom-full z-50 px-3 py-2 mb-1 w-72 max-w-xs rounded-lg border shadow-2xl pointer-events-none border-red-700/60 bg-gray-900/95 shadow-red-900/40"
        >
          <div className="absolute left-4 top-full w-0 h-0 border-t-4 border-r-4 border-l-4 border-l-transparent border-r-transparent border-t-red-700/60" />
          <div className="text-[11px] text-white/90 leading-relaxed whitespace-pre-wrap break-all">
            {log}
          </div>
          {log.includes('【Debuff触发】') && (
            <div className="mt-1.5 pt-1.5 border-t border-white/10 text-[10px] text-red-300/70">
              负面状态已附加，查看左侧"当前负面效果"面板了解详情与解除方式。
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// 日志面板
export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const { theme } = useTheme();
  const { glassEffectEnabled } = useGameStore();
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [newLogCount, setNewLogCount] = useState(0);
  const prevLogsLength = useRef(logs.length);
  
  // 判断是否为浅色模式
  const isLightMode = theme === 'light' || (theme === 'system' && typeof window !== 'undefined' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  // 古风背景样式
  const shouldUseGlass = glassEffectEnabled && !isLightMode;
  const bgClass = shouldUseGlass
    ? 'bg-black/30 backdrop-blur-md border-white/10'
    : 'card-ancient';

  // 检测新日志
  useEffect(() => {
    if (logs.length > prevLogsLength.current) {
      const newCount = logs.length - prevLogsLength.current;
      setNewLogCount(newCount);
      // 滚动到底部
      setTimeout(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      // 重置新日志计数
      setTimeout(() => setNewLogCount(0), 2000);
    }
    prevLogsLength.current = logs.length;
  }, [logs.length]);

  return (
    <div className={`flex overflow-hidden flex-col p-4 h-full rounded-xl border ${bgClass}`}>
      {/* 标题栏 */}
      <div className="flex justify-between items-center mb-3 shrink-0">
        <h3 className="flex gap-2 items-center text-sm font-semibold">
          <span className="w-1 h-4 bg-amber-500 rounded-full" />
          事件记录
        </h3>
        {newLogCount > 0 && (
          <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full animate-pulse">
            +{newLogCount} 新
          </span>
        )}
      </div>
      
      {/* 日志内容区 */}
      <div className="overflow-y-auto flex-1 space-y-0.5 min-h-0 pr-1">
        {logs.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center text-muted-foreground/50">
            <span className="mb-2 text-2xl">📜</span>
            <span className="text-sm">暂无记录</span>
            <span className="mt-1 text-xs">开始你的县城之旅...</span>
          </div>
        ) : (
          logs.map((log, index) => (
            <LogEntry 
              key={index} 
              log={log} 
              index={index}
              isNew={index >= logs.length - newLogCount}
            />
          ))
        )}
        <div ref={logsEndRef} />
      </div>
      
      {/* 底部装饰 */}
      <div className="pt-2 mt-2 border-t border-white/5">
        <div className="flex justify-between items-center text-[10px] text-muted-foreground/50">
          <span>共 {logs.length} 条记录</span>
          <span className="flex gap-1 items-center">
            <span className="w-1 h-1 rounded-full bg-amber-500/50" />
            滚动查看历史
          </span>
        </div>
      </div>
    </div>
  );
};