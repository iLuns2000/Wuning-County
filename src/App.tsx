/*
 * @Author: xyZhan
 * @Date: 2026-01-19 15:02:38
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-01-20 13:55:30
 * @FilePath: \textgame\src\App.tsx
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Game } from '@/pages/Game';
import { NPCList } from '@/pages/NPCList';
import { NPCDetail } from '@/pages/NPCDetail';
import { TaskList } from '@/pages/TaskList';
import { Facilities } from '@/pages/Facilities';
import { Buildings } from '@/pages/Buildings';
import { Collection } from '@/pages/Collection';
import { Credits } from '@/pages/Credits';
import { Developer } from '@/pages/Developer';
import { SaveViewer } from '@/pages/SaveViewer';
import { PigeonRace } from '@/pages/PigeonRace';
import { GameManual } from '@/pages/GameManual';
import { Leaderboard } from '@/pages/Leaderboard';
import { BugReport } from '@/pages/BugReport';
import { Watermark } from '@/components/Watermark';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SplashScreen } from '@/components/SplashScreen';
import { ActivityModal, hashContent } from '@/components/ActivityModal';

import { MobileLogToast } from '@/components/MobileLogToast';
import { useTheme } from '@/hooks/useTheme';
import { NewYearCountdownBanner } from '@/components/NewYearCountdownBanner';
import { FireworksSplash } from '@/components/FireworksSplash';
import { useGameStore } from '@/store/gameStore';
import { useEffect } from 'react';

/* 古风字体类名工具 */
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

const Router = HashRouter;

/** 旧存档格式迁移提示弹窗（含进度条 + 完成自动关闭） */
const InventoryMigrationNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState(0);
  const [info, setInfo] = useState({ totalItems: 0, uniqueItems: 0 });

  useEffect(() => {
    const migData = (window as any).__inventoryMigrated;
    if (migData) {
      (window as any).__inventoryMigrated = null;
      setInfo(migData);
      setVisible(true);
      setProgress(0);
      setDone(false);

      // 模拟进度：0→95% 在 1.2s 内完成，之后跳到 100% 并显示完成态
      const start = Date.now();
      const duration = 1200;
      const tick = () => {
        const elapsed = Date.now() - start;
        const p = Math.min(95, Math.round((elapsed / duration) * 95));
        setProgress(p);
        if (elapsed < duration) {
          requestAnimationFrame(tick);
        } else {
          // 跳到 100%，延迟 300ms 显示完成
          setTimeout(() => {
            setProgress(100);
            setDone(true);
            // 完成后 2s 自动关闭
            setTimeout(() => setVisible(false), 2000);
          }, 300);
        }
      };
      requestAnimationFrame(tick);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-80 rounded-2xl border border-border bg-card shadow-2xl p-6 flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
        {/* 图标 */}
        <div className="text-3xl">{done ? '✅' : '📦'}</div>

        {/* 标题 */}
        <h2 className="text-lg font-bold text-foreground">
          {done ? '数据格式更新完成！' : '正在更新数据格式'}
        </h2>

        {/* 说明文字 */}
        {!done ? (
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            正在将行囊数据升级为压缩格式
            <br />
            <span className="font-semibold text-yellow-500">请勿退出，避免数据丢失</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground text-center leading-relaxed">
            共迁移 <span className="font-semibold text-foreground">{info.totalItems}</span> 条记录
            &nbsp;→&nbsp;
            <span className="font-semibold text-foreground">{info.uniqueItems}</span> 种物品
            <br />
            <span className="text-green-500 font-semibold">存储空间大幅减少 ✓</span>
          </p>
        )}

        {/* 进度条 */}
        <div className="w-full space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{done ? '迁移完成' : '迁移中...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-200 ${done ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 完成后提示 */}
        {done && (
          <p className="text-xs text-muted-foreground animate-in fade-in duration-500">
            窗口将自动关闭…
          </p>
        )}
      </div>
    </div>
  );
};

function App() {
  useTheme();

  // 启动画面状态
  const [showSplash, setShowSplash] = useState(true);

  // 活动弹窗状态
  const activityPopup = useGameStore((state) => state.activityPopup);
  const dismissedActivities = useGameStore((state) => state.dismissedActivities);
  const setActivityPopup = useGameStore((state) => state.setActivityPopup);
  const dismissActivityPopup = useGameStore((state) => state.dismissActivityPopup);

  // 检查是否应该显示活动弹窗
  const shouldShowActivityPopup = activityPopup && (
    !dismissedActivities[activityPopup.id] ||
    dismissedActivities[activityPopup.id] !== hashContent(activityPopup.id, activityPopup.imageUrl, activityPopup.title)
  );

  // 设置无宁书驿活动弹窗 (仅首次/内容变化时显示)
  useEffect(() => {
    const wuningActivity = {
      id: 'wuning_bookstore_2026',
      title: '无宁书驿等你来！',
      imageUrl: '/images/wuning.webp',
      imageAlt: '无宁书驿活动公告',
    };

    // 检查是否需要显示
    const dismissedHash = dismissedActivities[wuningActivity.id];
    const currentHash = hashContent(wuningActivity.id, wuningActivity.imageUrl, wuningActivity.title);

    if (!dismissedHash || dismissedHash !== currentHash) {
      // 延迟显示，等启动画面结束后
      const timer = setTimeout(() => {
        setActivityPopup(wuningActivity);
      }, showSplash ? 3000 : 500);

      return () => clearTimeout(timer);
    }
  }, [showSplash, dismissedActivities, setActivityPopup]);

  return (
    <>
      {showSplash && <SplashScreen onReady={() => setShowSplash(false)} />}
      <Router>
        <ScrollToTop />
        <InventoryMigrationNotice />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/npcs" element={<NPCList />} />
        <Route path="/npcs/:id" element={<NPCDetail />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/buildings" element={<Buildings />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/developer" element={<Developer />} />
        <Route path="/save-view" element={<SaveViewer />} />
        <Route path="/pigeon-race" element={<PigeonRace />} />
        <Route path="/manual" element={<GameManual />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/bug-report" element={<BugReport />} />
      </Routes>
      <NewYearCountdownBanner />
      <FireworksSplash />
      <MobileLogToast />
      <Watermark />
      {/* 活动弹窗 */}
      {shouldShowActivityPopup && activityPopup && (
        <ActivityModal
          isOpen={true}
          activityId={activityPopup.id}
          title={activityPopup.title}
          imageUrl={activityPopup.imageUrl}
          imageAlt={activityPopup.imageAlt}
          linkUrl={activityPopup.linkUrl}
          onClose={() => setActivityPopup(null)}
          onDismiss={(id, hash) => dismissActivityPopup(id, hash)}
        />
      )}
      <div className="fixed bottom-2 left-0 w-full text-center text-[10px] md:text-xs text-muted-foreground/40 pointer-events-none select-none">
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors pointer-events-auto hover:text-muted-foreground/80"
        >
          苏ICP备2026005123号
        </a>
      </div>
    </Router>
    </>
  );
}

export default App;
