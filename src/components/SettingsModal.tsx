import React, { useEffect, useRef, useState } from 'react';
import { X, Download, Upload, Settings, Volume2, VolumeX, Vibrate, VibrateOff, Copy, ClipboardPaste, Sun, Moon, Laptop, LogOut, AlertTriangle, Share2, Image, ImageOff, Sparkles, Layers, Cloud, CloudOff } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useTheme } from '@/hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { uploadCloudSave, downloadCloudSave, listCloudSaves, deleteCloudSave, getDeviceId, registerUser, addMoney } from '@/utils/cloudApi';
import { CloudSave } from '@/utils/cloudApi';

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
    showBackgroundImage,
    glassEffectEnabled,
    setSoundEnabled, 
    setVolume,
    setVibrationEnabled,
    setShowBackgroundImage,
    setGlassEffectEnabled,
    addLog,
    resetGame,
    saveToFile,
    shareSave
  } = useGameStore();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showClipboard, setShowClipboard] = useState(false);
  const [clipboardContent, setClipboardContent] = useState('');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [downloadInfo, setDownloadInfo] = useState<{ url: string; filename: string } | null>(null);
  const hasSavePicker = typeof (window as any).showSaveFilePicker === 'function';
  
  // 云存档相关状态
  const [showCloudSaves, setShowCloudSaves] = useState(false);
  const [cloudSaves, setCloudSaves] = useState<CloudSave[]>([]);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const deviceId = getDeviceId();
  const playerStats = useGameStore((state) => state.playerStats);
  const playerName = useGameStore((state) => state.playerProfile)?.name || '';
  const money = playerStats?.money || 0;

  // 加载云存档列表
  const loadCloudSaves = async () => {
    setCloudLoading(true);
    try {
      const result = await listCloudSaves(deviceId);
      if (result.success) {
        setCloudSaves(result.saves);
      }
    } catch (e) {
      console.error('加载云存档失败:', e);
    } finally {
      setCloudLoading(false);
    }
  };

  // 上传云存档
  const handleCloudUpload = async () => {
    setSyncing(true);
    try {
      // 先确保用户注册
      await registerUser(deviceId, playerName || '玩家');
      // 同步财富
      await addMoney(deviceId, money);
      // 上传存档
      const gameState = useGameStore.getState();
      const saveData = JSON.stringify({
        playerStats: gameState.playerStats,
        inventory: gameState.inventory,
        day: gameState.day,
        playerProfile: gameState.playerProfile,
        role: gameState.role,
      });
      const result = await uploadCloudSave(deviceId, saveData);
      if (result.success) {
        addLog(`【系统】云存档上传成功！存档ID: ${result.save_id?.slice(0,8)}..., sync_id: ${result.sync_id?.slice(0,8)}...（一次性，请妥善保管，24小时后失效）`);
        loadCloudSaves();
      } else {
        addLog(`【系统】云存档上传失败: ${result.error}`);
      }
    } catch (e) {
      console.error('上传失败:', e);
      addLog('【系统】云存档上传失败');
    } finally {
      setSyncing(false);
    }
  };

  // 下载云存档
  const handleCloudDownload = async (saveId: string) => {
    try {
      const result = await downloadCloudSave(saveId);
      if (result.success && result.save_data) {
        const saveData = JSON.parse(result.save_data);
        importSave(saveData);
        addLog('【系统】云存档下载并导入成功！');
        onClose();
      } else {
        addLog(`【系统】云存档下载失败: ${result.error}`);
      }
    } catch (e) {
      console.error('下载失败:', e);
      addLog('【系统】云存档下载失败');
    }
  };

  // 使用sync_id下载（一次性）
  const handleSyncIdDownload = async (syncId: string) => {
    try {
      const result = await downloadCloudSave(undefined, syncId);
      if (result.success && result.save_data) {
        const saveData = JSON.parse(result.save_data);
        importSave(saveData);
        addLog('【系统】云存档下载并导入成功！（已使用一次性sync_id）');
        onClose();
      } else {
        addLog(`【系统】云存档下载失败: ${result.error}`);
      }
    } catch (e) {
      console.error('下载失败:', e);
      addLog('【系统】云存档下载失败');
    }
  };

  // 删除云存档
  const handleDeleteCloudSave = async (saveId: string) => {
    if (!confirm('确定要删除这个云存档吗？')) return;
    try {
      const result = await deleteCloudSave(saveId, deviceId);
      if (result.success) {
        addLog('【系统】云存档已删除');
        loadCloudSaves();
      }
    } catch (e) {
      console.error('删除失败:', e);
    }
  };

  useEffect(() => {
    return () => {
      if (downloadInfo?.url) {
        URL.revokeObjectURL(downloadInfo.url);
      }
    };
  }, [downloadInfo]);

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
      <div className="overflow-y-auto p-6 space-y-6 w-full max-w-md max-h-full rounded-xl border shadow-xl bg-card text-card-foreground">
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
            <h3 className="mb-4 font-semibold">视觉效果</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <div className="flex flex-col flex-1">
                   <span className="text-sm font-medium">动态背景图</span>
                   <span className="text-xs text-muted-foreground">根据时间和天气显示不同的背景图片</span>
                 </div>
                 <button 
                  onClick={() => setShowBackgroundImage(!showBackgroundImage)}
                  className="p-2 rounded-full border transition-colors bg-background hover:bg-muted"
                  title={showBackgroundImage ? "关闭背景图" : "开启背景图"}
                >
                  {showBackgroundImage ? <Image size={20} /> : <ImageOff size={20} />}
                </button>
              </div>
              
              <div className="flex justify-between items-center">
                 <div className="flex flex-col flex-1">
                   <span className="text-sm font-medium">毛玻璃效果</span>
                   <span className="text-xs text-muted-foreground">为面板和按钮添加半透明模糊效果（深色模式）</span>
                 </div>
                 <button 
                  onClick={() => setGlassEffectEnabled(!glassEffectEnabled)}
                  className="p-2 rounded-full border transition-colors bg-background hover:bg-muted"
                  title={glassEffectEnabled ? "关闭毛玻璃效果" : "开启毛玻璃效果"}
                >
                  {glassEffectEnabled ? <Sparkles size={20} /> : <Layers size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border border-dashed bg-muted/30 border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">存档管理</h3>
              <button 
                onClick={() => {
                  if (!showCloudSaves) loadCloudSaves();
                  setShowCloudSaves(!showCloudSaves);
                }}
                className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
              >
                <Cloud size={16} />
                云存档 ({cloudSaves.length})
              </button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              您可以导出当前进度为本地文件，或从本地/云端导入进度。请注意，导入存档将覆盖当前游戏进度。
            </p>
            
            {/* 云存档列表 */}
            {showCloudSaves && (
              <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2 text-amber-800">
                  <Cloud size={16} />
                  <span className="font-medium">云端存档</span>
                  <span className="text-xs text-amber-600">(保留48小时)</span>
                </div>
                {cloudLoading ? (
                  <div className="text-sm text-amber-600">加载中...</div>
                ) : cloudSaves.length === 0 ? (
                  <div className="text-sm text-amber-600 mb-2">暂无云存档</div>
                ) : (
                  <div className="space-y-2 mb-2 max-h-32 overflow-y-auto">
                    {cloudSaves.map((save) => (
                      <div key={save.save_id} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="truncate text-amber-900">ID: {save.save_id.slice(0, 12)}...</div>
                          <div className="text-xs text-amber-600">过期: {new Date(save.expires_at).toLocaleString('zh-CN')}</div>
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button 
                            onClick={() => handleCloudDownload(save.save_id)}
                            className="px-2 py-1 text-xs bg-amber-600 text-white rounded hover:bg-amber-700"
                          >
                            下载
                          </button>
                          <button 
                            onClick={() => handleDeleteCloudSave(save.save_id)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <button 
                    onClick={handleCloudUpload}
                    disabled={syncing}
                    className="flex-1 py-2 text-sm rounded-lg transition-colors bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Cloud size={14} />
                    {syncing ? '上传中...' : '上传到云端'}
                  </button>
                </div>
                <p className="mt-2 text-xs text-amber-600">
                  ⚠️ 云存档保留48小时，sync_id只能使用一次，请及时下载
                </p>
              </div>
            )}
            
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
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={() => {
                              const info = exportSave();
                              setDownloadInfo(info);
                            }}
                            className="flex-1 min-w-[140px] gap-1 justify-center items-center px-3 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                        >
                            <Download size={16} />
                            <span className="whitespace-nowrap">导出文件</span>
                        </button>
                        <button 
                            onClick={async () => {
                              const ok = await saveToFile();
                              if (!ok && !hasSavePicker) {
                                addLog('【系统】当前浏览器不支持保存对话框，请使用下载链接或复制存档码。');
                              }
                            }}
                            disabled={!hasSavePicker}
                            title={hasSavePicker ? '' : '当前浏览器不支持保存对话框（建议使用 Chrome/Edge）'}
                            className={`flex-1 min-w-[140px] gap-1 justify-center items-center px-3 py-2 rounded-lg transition-colors text-sm ${hasSavePicker ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-muted text-muted-foreground'}`}
                        >
                            <Download size={16} />
                            <span className="whitespace-nowrap">保存到指定位置</span>
                        </button>
                        <button 
                            onClick={() => {
                              onClose();
                              navigate('/save-view');
                            }}
                            className="flex-1 min-w-[140px] gap-1 justify-center items-center px-3 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                        >
                            <Share2 size={16} />
                            <span className="whitespace-nowrap">查看存档</span>
                        </button>
                        <button 
                            onClick={async () => {
                              await shareSave();
                            }}
                            className="flex-1 min-w-[140px] gap-1 justify-center items-center px-3 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90 text-sm"
                        >
                            <Share2 size={16} />
                            <span className="whitespace-nowrap">分享存档</span>
                        </button>
                        
                        <button 
                            onClick={handleImportClick}
                            className="flex-1 min-w-[140px] gap-1 justify-center items-center px-3 py-2 rounded-lg transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm"
                        >
                            <Upload size={16} />
                            <span className="whitespace-nowrap">导入文件</span>
                        </button>
                    </div>
                    {downloadInfo && (
                      <div className="flex gap-2 items-center text-sm">
                        <a
                          href={downloadInfo.url}
                          download={downloadInfo.filename}
                          className="underline underline-offset-2 text-primary hover:text-primary/80"
                        >
                          点击此处下载存档（{downloadInfo.filename}）
                        </a>
                        <button
                          onClick={() => {
                            URL.revokeObjectURL(downloadInfo.url);
                            setDownloadInfo(null);
                          }}
                          className="px-2 py-1 rounded-md bg-muted hover:bg-muted/70"
                        >
                          清理链接
                        </button>
                      </div>
                    )}
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
        
        <div className="space-y-1 text-xs text-center text-muted-foreground">
          <div>《无宁县志》 v1.0.0</div>
          <a
            href="https://pan.quark.cn/s/b86b920b6063"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            APK 下载
          </a>
        </div>
      </div>
    </div>
  );
};
