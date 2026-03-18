import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, AlertCircle } from 'lucide-react';

const BUG_REPORT_URL = 'https://v.wjx.cn/vm/YrZHJNW.aspx#';

export const BugReport: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <header className="flex items-center gap-3 py-4 shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            title="返回"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold">反馈建议</h1>
        </header>

        {/* Content */}
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* QR Code Card */}
          <div className="p-6 border rounded-lg bg-card shadow-sm text-center space-y-4">
            <h2 className="text-lg font-bold">扫码填写问卷</h2>
            
            <div className="flex justify-center">
              <div className="p-2 bg-white rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(BUG_REPORT_URL)}&bgcolor=ffffff&color=333333`}
                  alt="问卷二维码"
                  className="w-48 h-48"
                />
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              扫描上方二维码，或点击下方链接
            </p>

            {/* Link Button */}
            <a
              href={BUG_REPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 w-full font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span>打开问卷链接</span>
              <ExternalLink size={16} />
            </a>
          </div>

          {/* Disclaimer */}
          <div className="p-4 border border-amber-200 dark:border-amber-800 rounded-lg bg-amber-50 dark:bg-amber-950/30">
            <div className="flex gap-3">
              <AlertCircle className="shrink-0 w-5 h-5 text-amber-500" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  声明
                </p>
                <p className="text-amber-600 dark:text-amber-500/80 leading-relaxed">
                  此问卷抽奖活动与<strong>无宁县志</strong>游戏平台无关，活动由问卷网提供，
                  抽奖结果及奖品与本游戏没有任何关系。请谨慎参与，理性对待。
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>您的反馈对我们非常重要</p>
            <p>同时欢迎您通过游戏内渠道提交bug</p>
          </div>
        </div>
      </div>
    </div>
  );
};
