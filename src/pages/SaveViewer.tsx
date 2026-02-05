import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Copy, Download, Share2, X } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export const SaveViewer: React.FC = () => {
  const navigate = useNavigate();
  const { exportSaveString, exportSave, saveToFile, shareSave, addLog } = useGameStore();
  const [downloadInfo, setDownloadInfo] = useState<{ url: string; filename: string } | null>(null);
  const data = useMemo(() => exportSaveString(), [exportSaveString]);

  useEffect(() => {
    return () => {
      if (downloadInfo?.url) {
        URL.revokeObjectURL(downloadInfo.url);
      }
    };
  }, [downloadInfo]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data);
      addLog('【系统】存档已复制到剪贴板！');
    } catch {
      addLog('【系统】复制失败，请手动选择文本复制。');
    }
  };

  const handleDownloadLink = () => {
    const info = exportSave();
    setDownloadInfo(info);
  };

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="space-y-6 w-full max-w-3xl">
        <header className="flex gap-4 items-center py-2 shrink-0">
          <button
            onClick={() => navigate('/game')}
            className="p-2 rounded-full transition-colors hover:bg-secondary"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex gap-2 items-center text-xl font-bold">
            <FileText className="text-primary" />
            存档 JSON
          </h1>
        </header>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex gap-2 justify-center items-center px-4 py-2 rounded-lg transition-colors bg-amber-600 text-white hover:bg-amber-700"
          >
            <Copy size={18} />
            <span>复制文本</span>
          </button>
          <button
            onClick={handleDownloadLink}
            className="flex gap-2 justify-center items-center px-4 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download size={18} />
            <span>生成下载链接</span>
          </button>
          <button
            onClick={async () => {
              const ok = await saveToFile();
              if (!ok) {
                addLog('【系统】保存失败或不支持，请使用下载链接或复制文本。');
              }
            }}
            className="flex gap-2 justify-center items-center px-4 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download size={18} />
            <span>保存到文件</span>
          </button>
          <button
            onClick={async () => {
              await shareSave();
            }}
            className="flex gap-2 justify-center items-center px-4 py-2 rounded-lg transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Share2 size={18} />
            <span>分享</span>
          </button>
        </div>

        {downloadInfo && (
          <div className="flex gap-2 items-center text-sm">
            <a
              href={downloadInfo.url}
              download={downloadInfo.filename}
              className="underline underline-offset-2 text-primary hover:text-primary/80"
            >
              点击此处下载（{downloadInfo.filename}）
            </a>
            <button
              onClick={() => {
                URL.revokeObjectURL(downloadInfo.url);
                setDownloadInfo(null);
              }}
              className="flex gap-1 items-center px-2 py-1 rounded-md bg-muted hover:bg-muted/70"
            >
              <X size={16} />
              清理链接
            </button>
          </div>
        )}

        <div className="rounded-lg border bg-card">
          <pre className="p-4 overflow-auto text-xs md:text-sm font-mono whitespace-pre-wrap break-words">
            {data}
          </pre>
        </div>
      </div>
    </div>
  );
};
