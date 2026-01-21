import React from 'react';

interface LogPanelProps {
  logs: string[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  return (
    <div className="flex overflow-hidden flex-col p-4 h-full rounded-lg border shadow-sm bg-card">
      <h3 className="mb-2 text-sm font-semibold shrink-0">事件记录</h3>
      <div className="overflow-y-auto flex-1 space-y-1 min-h-0">
        {logs.map((log, index) => (
          <div key={index} className="pb-1 text-sm border-b text-muted-foreground border-border/50 last:border-0">
            {log}
          </div>
        ))}
        {logs.length === 0 && <div className="text-sm italic text-muted-foreground">暂无记录</div>}
      </div>
    </div>
  );
};
