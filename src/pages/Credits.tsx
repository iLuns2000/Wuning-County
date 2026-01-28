import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Award } from 'lucide-react';

export const Credits: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="w-full max-w-2xl space-y-6">
        <header className="flex items-center gap-4 py-2 shrink-0">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Heart className="text-primary" />
            感谢名单
          </h1>
        </header>

        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="p-6 border rounded-lg bg-card shadow-sm text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Award size={32} className="text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">特别鸣谢</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">人物志平台提供者</h3>
                <p className="text-lg font-medium">云雀老师</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">人物志收集灵感提供</h3>
                <p className="text-lg font-medium">蘑菇🍄老师（户籍主任）</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">小吃街小吃名单贡献者</h3>
                <p className="text-lg font-medium">翟光老师</p>
              </div>

              {/* Add more sections here as needed */}
              <div className="pt-6 border-t border-border/50 text-sm text-muted-foreground">
                感谢所有为无宁县建设添砖加瓦的伙伴们！
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
