/*
 * @Author: xyZhan
 * @Date: 2026-01-21 11:08:17
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-03-05 16:41:56
 * @FilePath: \Wuning-County\src\components\LogPanel.tsx
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import React, { useState } from 'react';

interface LogPanelProps {
  logs: string[];
}

type LogStyle = {
  bg: string;
  border: string;
  text: string;
  prefix?: string;
  prefixColor: string;
};

function getLogStyle(log: string): LogStyle {
  if (log.includes('【Debuff触发】')) {
    return {
      bg: 'bg-red-950/50',
      border: 'border-l-2 border-red-500',
      text: 'text-red-200',
      prefix: '⚠ Debuff',
      prefixColor: 'text-red-400 font-bold',
    };
  }
  if (log.includes('【Debuff生效】')) {
    return {
      bg: 'bg-red-950/30',
      border: 'border-l-2 border-red-700',
      text: 'text-red-300/80',
      prefix: '↓ 效果',
      prefixColor: 'text-red-500',
    };
  }
  if (log.includes('【Debuff解除】')) {
    return {
      bg: 'bg-emerald-950/30',
      border: 'border-l-2 border-emerald-600',
      text: 'text-emerald-300/80',
      prefix: '✓ 解除',
      prefixColor: 'text-emerald-400',
    };
  }
  return {
    bg: '',
    border: 'border-b border-border/50',
    text: 'text-muted-foreground',
    prefixColor: '',
  };
}

const LogEntry: React.FC<{ log: string; index: number }> = ({ log }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const style = getLogStyle(log);
  const isDebuffRelated = log.includes('【Debuff触发】') || log.includes('【Debuff生效】') || log.includes('【Debuff解除】');

  return (
    <div
      className={`relative pb-1 text-sm last:border-0 ${style.border} ${style.bg} ${isDebuffRelated ? 'px-2 py-1 rounded mb-0.5' : ''}`}
      onMouseEnter={() => isDebuffRelated && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className={style.text}>{log}</span>

      {/* Tooltip */}
      {isDebuffRelated && showTooltip && (
        <div
          className="absolute left-0 bottom-full z-50 px-3 py-2 mb-1 w-72 max-w-xs rounded-lg border shadow-2xl pointer-events-none border-red-700/60 bg-gray-900/95 shadow-red-900/40"
        >
          {/* 小三角 */}
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

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  return (
    <div className="flex overflow-hidden flex-col p-4 h-full rounded-lg border shadow-sm bg-card">
      <h3 className="mb-2 text-sm font-semibold shrink-0">事件记录</h3>
      <div className="overflow-y-auto flex-1 space-y-0.5 min-h-0">
        {logs.map((log, index) => (
          <LogEntry key={index} log={log} index={index} />
        ))}
        {logs.length === 0 && <div className="text-sm italic text-muted-foreground">暂无记录</div>}
      </div>
    </div>
  );
};
