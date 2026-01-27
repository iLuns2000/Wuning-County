import React, { useRef, useState } from 'react';
import { X, Download, Upload, Settings, Volume2, VolumeX, Vibrate, VibrateOff, Copy, ClipboardPaste } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
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
    addLog
  } = useGameStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClipboard, setShowClipboard] = useState(false);
  const [clipboardContent, setClipboardContent] = useState('');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border rounded-xl shadow-xl p-6 space-y-6 text-card-foreground">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">系统设置</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border">
            <h3 className="font-semibold mb-4">音效设置</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 bg-background border rounded-full hover:bg-muted transition-colors"
                title={soundEnabled ? "关闭音效" : "开启音效"}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              
              <div className="flex-1 flex flex-col gap-1">
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
                   className="w-full accent-primary h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                 />
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border">
            <h3 className="font-semibold mb-4">震动反馈</h3>
            <div className="flex items-center justify-between">
               <span className="text-sm text-muted-foreground">开启后，部分交互将伴随轻微震动反馈（仅移动端或支持设备生效）</span>
               <button 
                onClick={() => setVibrationEnabled(!vibrationEnabled)}
                className="p-2 bg-background border rounded-full hover:bg-muted transition-colors"
                title={vibrationEnabled ? "关闭震动" : "开启震动"}
              >
                {vibrationEnabled ? <Vibrate size={20} /> : <VibrateOff size={20} />}
              </button>
            </div>
          </div>

          <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-border">
            <h3 className="font-semibold mb-2">存档管理</h3>
            <p className="text-sm text-muted-foreground mb-4">
              您可以导出当前进度为文件，或从文件导入进度。请注意，导入存档将覆盖当前游戏进度。
            </p>
            
            {showClipboard ? (
                <div className="space-y-3">
                    <textarea 
                        className="w-full h-32 p-2 text-xs font-mono bg-background border rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="请在此粘贴存档代码..."
                        value={clipboardContent}
                        onChange={(e) => setClipboardContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                        <button 
                            onClick={handleManualImport}
                            className="flex-1 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                            确认导入
                        </button>
                        <button 
                            onClick={() => setShowClipboard(false)}
                            className="flex-1 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
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
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            <Download size={18} />
                            <span>导出文件</span>
                        </button>
                        
                        <button 
                            onClick={handleImportClick}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                        >
                            <Upload size={18} />
                            <span>导入文件</span>
                        </button>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleCopyExport}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                        >
                            <Copy size={18} />
                            <span>复制存档码</span>
                        </button>
                        
                        <button 
                            onClick={handlePasteImport}
                            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                            <ClipboardPaste size={18} />
                            <span>粘贴存档码</span>
                        </button>
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
        
        <div className="text-center text-xs text-muted-foreground">
            《无宁县志》 v1.0.0
        </div>
      </div>
    </div>
  );
};
