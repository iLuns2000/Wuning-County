import React, { useRef } from 'react';
import { X, Download, Upload, Settings } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { exportSave, importSave } = useGameStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImportClick = () => {
    fileInputRef.current?.click();
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
            <h3 className="font-semibold mb-2">存档管理</h3>
            <p className="text-sm text-muted-foreground mb-4">
              您可以导出当前进度为文件，或从文件导入进度。请注意，导入存档将覆盖当前游戏进度。
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={exportSave}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Download size={18} />
                <span>导出存档</span>
              </button>
              
              <button 
                onClick={handleImportClick}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Upload size={18} />
                <span>导入存档</span>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".json" 
                className="hidden" 
              />
            </div>
          </div>
        </div>
        
        <div className="text-center text-xs text-muted-foreground">
            《无宁县志》 v1.0.0
        </div>
      </div>
    </div>
  );
};
