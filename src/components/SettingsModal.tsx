import React, { useRef, useState } from 'react';
import { X, Download, Upload, Settings, Volume2, VolumeX, Vibrate, VibrateOff, Copy, ClipboardPaste, Sun, Moon, Laptop, LogOut, AlertTriangle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { 
    exportSave, 
    exportSaveString,
    importSave, 
    soundEnabled, 
    volume, 
    vibrationEnabled,
    setSoundEnabled, 
    setVolume,
    setVibrationEnabled,
    addLog,
    resetGame
  } = useGameStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClipboard, setShowClipboard] = useState(false);
  const [clipboardContent, setClipboardContent] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  if (!isOpen) return null;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleCopyExport = async () => {
    const data = exportSaveString();
    try {
        await navigator.clipboard.writeText(data);
        addLog('【系统】存档已复制到剪贴板！');
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = data;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            addLog('【系统】存档已复制到剪贴板！');
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
            addLog('【系统】复制失败，请手动导出文件。');
        }
        document.body.removeChild(textArea);
    }
  };

  const handlePasteImport = async () => {
      try {
          const text = await navigator.clipboard.readText();
          if (text) {
              const success = importSave(text);
              if (success) onClose();
          } else {
              addLog('【系统】剪贴板为空或无法读取。');
          }
      } catch (err) {
          // If permission denied or not supported, show text area
          setShowClipboard(true);
      }
  };

  const handleManualImport = () => {
      if (clipboardContent) {
          const success = importSave(clipboardContent);
          if (success) {
              setShowClipboard(false);
              onClose();
          }
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importSave(content);
        if (success) {
          onClose();
        }
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 backdrop-blur-sm bg-black/50">
      <div className="p-6 space-y-6 w-full max-w-md rounded-xl border shadow-xl bg-card text-card-foreground">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">系统设置</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-dashed bg-muted/30 border-border">
            <h3 className="mb-4 font-semibold">外观设置</h3>
            <div className="flex p-1 rounded-lg border bg-background/50">
                <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    theme === 'light' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                >
                <Sun size={16} />
                <span>浅色</span>
                </button>
                <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    theme === 'dark' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                >
                <Moon size={16} />
                <span>深色</span>
                </button>
                <button
                onClick={() => setTheme('system')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                    theme === 'system' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                >
                <Laptop size={16} />
                <span>自动</span>
                </button>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-dashed bg-muted/30 border-border">
            <h3 className="mb-4 font-semibold">音效设置</h3>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-full border transition-colors bg-background hover:bg-muted"
                title={soundEnabled ? "关闭音效" : "开启音效"}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              
              <div className="flex flex-col flex-1 gap-1">
                 <div className="flex justify-between text-xs text-muted-foreground">
                   <span>音量</span>
                   <span>{Math.round(volume * 100)}%</span>
                 </div>
                 <input 
                   type="range" 
                   min="0" 
                   max="1" 
                   step="0.1" 
                   value={volume}
                   onChange={(e) => setVolume(parseFloat(e.target.value))}
                   disabled={!soundEnabled}
                   className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-primary bg-muted disabled:opacity-50"
                 />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-dashed bg-muted/30 border-border">
            <h3 className="mb-4 font-semibold">震动反馈</h3>
            <div className="flex justify-between items-center">
               <span className="text-sm text-muted-foreground">开启后，部分交互将伴随轻微震动反馈（仅移动端或支持设备生效）</span>
               <button 
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className="p-2 rounded-full border transition-colors bg-background hover:bg-muted"
                title={vibrationEnabled ? "关闭震动" : "开启震动"}
              >
                {vibrationEnabled ? <Vibrate size={20} /> : <VibrateOff size={20} />}
              </button>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-dashed bg-muted/30 border-border">
            <h3 className="mb-2 font-semibold">存档管理</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              您可以导出当前进度为文件，或从文件导入进度。请注意，导入存档将覆盖当前游戏进度。
            </p>
            
            {showClipboard ? (
                <div className="space-y-3">
                    <textarea 
                        className="p-2 w-full h-32 font-mono text-xs rounded-md border resize-none bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="请在此粘贴存档代码..."
                        value={clipboardContent}
                        onChange={(e) => setClipboardContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={handleManualImport}
                            className="flex-1 py-2 text-sm rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            确认导入
                        </button>
                        <button 
                            onClick={() => setShowClipboard(false)}
                            className="flex-1 py-2 text-sm rounded-lg transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        >
                            取消
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                        <button 
                            onClick={exportSave}
                            className="flex flex-1 gap-2 justify-center items-center px-4 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            <Download size={18} />
                            <span>导出文件</span>
                        </button>
                        
                        <button 
                            onClick={handleImportClick}
                            className="flex flex-1 gap-2 justify-center items-center px-4 py-2 rounded-lg transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        >
                            <Upload size={18} />
                            <span>导入文件</span>
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleCopyExport}
                            className="flex flex-1 gap-2 justify-center items-center px-4 py-2 text-white bg-amber-600 rounded-lg transition-colors hover:bg-amber-700"
                        >
                            <Copy size={18} />
                            <span>复制存档码</span>
                        </button>
                        
                        <button 
                            onClick={handlePasteImport}
                            className="flex flex-1 gap-2 justify-center items-center px-4 py-2 text-white bg-emerald-600 rounded-lg transition-colors hover:bg-emerald-700"
                        >
                            <ClipboardPaste size={18} />
                            <span>粘贴存档码</span>
                        </button>
                    </div>
                    
          <div className="p-4 rounded-lg border border-dashed bg-red-500/5 border-red-500/20">
            <h3 className="flex gap-2 items-center mb-2 font-semibold text-red-500">
              <AlertTriangle size={16} />
              <span>危险区域</span>
            </h3>
            
            {showExitConfirm ? (
              <div className="space-y-3 duration-200 animate-in fade-in zoom-in">
                <p className="text-sm font-medium text-red-500">
                  确定要退出游戏吗？这将清空所有当前进度并从头开始。
                </p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      resetGame();
                      onClose();
                      navigate('/');
                    }}
                    className="flex-1 py-2 text-sm font-bold text-white bg-red-500 rounded-lg transition-colors hover:bg-red-600"
                  >
                    确认退出
                  </button>
                  <button 
                    onClick={() => setShowExitConfirm(false)}
                    className="flex-1 py-2 text-sm rounded-lg transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowExitConfirm(true)}
                className="flex gap-2 justify-center items-center px-4 py-2 w-full text-red-600 bg-red-100 rounded-lg transition-colors hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <LogOut size={18} />
                <span>退出并重置游戏</span>
              </button>
            )}
          </div>
                </div>
                
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
          </div>
        </div>
        
        <div className="text-xs text-center text-muted-foreground">
            《无宁县志》 v1.0.0
        </div>
      </div>
    </div>
  );
};
