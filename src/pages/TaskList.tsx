import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Lock } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { tasks } from '@/data/tasks';
import { LogPanel } from '@/components/LogPanel';

export const TaskList: React.FC = () => {
  const navigate = useNavigate();
  const { role, currentTaskId, completedTaskIds, logs } = useGameStore();

  const roleTasks = tasks.filter(t => t.role === role);

  const getTaskStatus = (taskId: string) => {
    if (completedTaskIds.includes(taskId)) return 'completed';
    if (currentTaskId === taskId) return 'current';
    return 'locked';
  };

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="grid grid-cols-1 gap-6 w-full max-w-5xl md:grid-cols-2 md:h-[calc(100vh-2rem)]">
        
        {/* Left: Task List */}
        <div className="flex overflow-hidden flex-col gap-4 w-full max-w-md h-full md:max-w-none">
          <header className="flex gap-4 items-center py-2 shrink-0">
            <button 
              onClick={() => navigate('/game')}
              className="p-2 rounded-full hover:bg-secondary"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">任务记录</h1>
          </header>

          <div className="overflow-y-auto flex-1 pr-2 space-y-4 min-h-0">
            {roleTasks.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                暂无任务记录
              </div>
            ) : (
              roleTasks.map(task => {
                const status = getTaskStatus(task.id);
                return (
                  <div 
                    key={task.id} 
                    className={`p-4 rounded-lg border transition-all ${
                      status === 'current' 
                        ? 'bg-card border-primary shadow-sm' 
                        : status === 'completed'
                        ? 'bg-secondary/50 border-transparent opacity-80'
                        : 'bg-secondary/20 border-transparent opacity-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`flex gap-2 items-center text-lg font-bold ${
                        status === 'current' ? 'text-primary' : ''
                      }`}>
                        {status === 'completed' && <CheckCircle size={18} className="text-green-500" />}
                        {status === 'current' && <Circle size={18} className="text-primary animate-pulse" />}
                        {status === 'locked' && <Lock size={18} />}
                        {task.title}
                      </h3>
                      {status === 'current' && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                          进行中
                        </span>
                      )}
                      {status === 'completed' && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-500/10 text-green-600">
                          已完成
                        </span>
                      )}
                    </div>
                    
                    {status !== 'locked' ? (
                      <>
                        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between p-2 rounded bg-background/50">
                            <span className="font-medium text-muted-foreground">目标</span>
                            <span>{task.goalDescription}</span>
                          </div>
                          <div className="flex justify-between p-2 rounded bg-background/50">
                            <span className="font-medium text-muted-foreground">奖励</span>
                            <span>{task.rewardText}</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        完成前置任务后解锁...
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        
        {/* Right: Log Panel */}
        <div className="w-full max-w-md mx-auto h-64 md:h-full md:max-w-none">
          <LogPanel logs={logs} />
        </div>
      </div>
    </div>
  );
};
