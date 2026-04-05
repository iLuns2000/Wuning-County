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
import React, { useState, lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Watermark } from '@/components/Watermark';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SplashScreen } from '@/components/SplashScreen';
import { ActivityModal, hashContent } from '@/components/ActivityModal';

import { MobileLogToast } from '@/components/MobileLogToast';
import { useTheme } from '@/hooks/useTheme';
import { NewYearCountdownBanner } from '@/components/NewYearCountdownBanner';
import { FireworksSplash } from '@/components/FireworksSplash';
import { useGameStore } from '@/store/gameStore';
import { getActiveAnnouncements, type Announcement } from '@/utils/cloudApi';
import { useEffect } from 'react';

// 路由懒加载
const Home = lazy(() => import('@/pages/Home').then(m => ({ default: m.Home })));
const Game = lazy(() => import('@/pages/Game').then(m => ({ default: m.Game })));
const NPCList = lazy(() => import('@/pages/NPCList').then(m => ({ default: m.NPCList })));
const NPCDetail = lazy(() => import('@/pages/NPCDetail').then(m => ({ default: m.NPCDetail })));
const TaskList = lazy(() => import('@/pages/TaskList').then(m => ({ default: m.TaskList })));
const Facilities = lazy(() => import('@/pages/Facilities').then(m => ({ default: m.Facilities })));
const Buildings = lazy(() => import('@/pages/Buildings').then(m => ({ default: m.Buildings })));
const Collection = lazy(() => import('@/pages/Collection').then(m => ({ default: m.Collection })));
const Credits = lazy(() => import('@/pages/Credits').then(m => ({ default: m.Credits })));
const Developer = lazy(() => import('@/pages/Developer').then(m => ({ default: m.Developer })));
const SaveViewer = lazy(() => import('@/pages/SaveViewer').then(m => ({ default: m.SaveViewer })));
const PigeonRace = lazy(() => import('@/pages/PigeonRace').then(m => ({ default: m.PigeonRace })));
const GameManual = lazy(() => import('@/pages/GameManual').then(m => ({ default: m.GameManual })));
const Leaderboard = lazy(() => import('@/pages/Leaderboard').then(m => ({ default: m.Leaderboard })));
const BugReport = lazy(() => import('@/pages/BugReport').then(m => ({ default: m.BugReport })));
const Announcements = lazy(() => import('@/pages/Announcements').then(m => ({ default: m.Announcements })));

// 加载中组件
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="w-12 h-12 rounded-full border-t-2 border-b-2 animate-spin border-primary"></div>
  </div>
);

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
      <div className="flex flex-col gap-4 items-center p-6 w-80 rounded-2xl border shadow-2xl duration-200 border-border bg-card animate-in zoom-in-95">
        {/* 图标 */}
        <div className="text-3xl">{done ? '✅' : '📦'}</div>

        {/* 标题 */}
        <h2 className="text-lg font-bold text-foreground">
          {done ? '数据格式更新完成！' : '正在更新数据格式'}
        </h2>

        {/* 说明文字 */}
        {!done ? (
          <p className="text-sm leading-relaxed text-center text-muted-foreground">
            正在将行囊数据升级为压缩格式
            <br />
            <span className="font-semibold text-yellow-500">请勿退出，避免数据丢失</span>
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-center text-muted-foreground">
            共迁移 <span className="font-semibold text-foreground">{info.totalItems}</span> 条记录
            &nbsp;→&nbsp;
            <span className="font-semibold text-foreground">{info.uniqueItems}</span> 种物品
            <br />
            <span className="font-semibold text-green-500">存储空间大幅减少 ✓</span>
          </p>
        )}

        {/* 进度条 */}
        <div className="space-y-1 w-full">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{done ? '迁移完成' : '迁移中...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="overflow-hidden w-full h-2 rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-200 ${done ? 'bg-green-500' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 完成后提示 */}
        {done && (
          <p className="text-xs duration-500 text-muted-foreground animate-in fade-in">
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
    dismissedActivities[activityPopup.id] !== hashContent(activityPopup.id, activityPopup.imageUrl, activityPopup.title, activityPopup.content)
  );

  // 设置活动弹窗 (从API获取，仅首次/内容变化时显示)
  useEffect(() => {
    // 从API获取公告
    const fetchAnnouncement = async () => {
      try {
        const res = await getActiveAnnouncements();
        if (res.success && res.data && res.data.length > 0) {
          // 取优先级最高的活动弹窗类型的公告
          const activityAnnouncement = res.data.find(a => a.display_position === 'activity');
          if (activityAnnouncement) {
            const announcement: Announcement = activityAnnouncement;
            const apiActivity = {
              id: `announcement_${announcement.id}`,
              title: announcement.title,
              content: announcement.content,
              imageUrl: announcement.image_url,
              imageAlt: '公告',
              linkUrl: announcement.link_url,
            };

            // 检查是否需要显示
            const dismissedHash = dismissedActivities[apiActivity.id];
            const currentHash = hashContent(apiActivity.id, apiActivity.imageUrl, apiActivity.title, apiActivity.content);

            if (!dismissedHash || dismissedHash !== currentHash) {
              // 延迟显示，等启动画面结束后
              const timer = setTimeout(() => {
                setActivityPopup(apiActivity);
              }, showSplash ? 3000 : 500);

              return () => clearTimeout(timer);
            }
          }
        }
      } catch (error) {
        console.error('获取公告失败:', error);
      }
    };

    fetchAnnouncement();
  }, [showSplash, dismissedActivities, setActivityPopup]);

  return (
    <>
      {showSplash && <SplashScreen onReady={() => setShowSplash(false)} />}
      <Router>
        <ScrollToTop />
        <InventoryMigrationNotice />
      <Routes>
        <Route path="/" element={<Suspense fallback={<PageLoader />}><Home /></Suspense>} />
        <Route path="/game" element={<Suspense fallback={<PageLoader />}><Game /></Suspense>} />
        <Route path="/npcs" element={<Suspense fallback={<PageLoader />}><NPCList /></Suspense>} />
        <Route path="/npcs/:id" element={<Suspense fallback={<PageLoader />}><NPCDetail /></Suspense>} />
        <Route path="/tasks" element={<Suspense fallback={<PageLoader />}><TaskList /></Suspense>} />
        <Route path="/facilities" element={<Suspense fallback={<PageLoader />}><Facilities /></Suspense>} />
        <Route path="/buildings" element={<Suspense fallback={<PageLoader />}><Buildings /></Suspense>} />
        <Route path="/collection" element={<Suspense fallback={<PageLoader />}><Collection /></Suspense>} />
        <Route path="/credits" element={<Suspense fallback={<PageLoader />}><Credits /></Suspense>} />
        <Route path="/developer" element={<Suspense fallback={<PageLoader />}><Developer /></Suspense>} />
        <Route path="/save-view" element={<Suspense fallback={<PageLoader />}><SaveViewer /></Suspense>} />
        <Route path="/pigeon-race" element={<Suspense fallback={<PageLoader />}><PigeonRace /></Suspense>} />
        <Route path="/manual" element={<Suspense fallback={<PageLoader />}><GameManual /></Suspense>} />
        <Route path="/leaderboard" element={<Suspense fallback={<PageLoader />}><Leaderboard /></Suspense>} />
        <Route path="/bug-report" element={<Suspense fallback={<PageLoader />}><BugReport /></Suspense>} />
        <Route path="/announcements/:announcementId" element={<Suspense fallback={<PageLoader />}><Announcements /></Suspense>} />
        <Route path="/announcements" element={<Suspense fallback={<PageLoader />}><Announcements /></Suspense>} />
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
          content={activityPopup.content}
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
