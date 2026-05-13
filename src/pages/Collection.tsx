import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scroll, Sparkles, BookOpen, ShoppingCart, Shuffle, ChevronLeft, ChevronRight, CopyCheck, Check, Trash2 } from 'lucide-react';
import { Swiper, SwiperSlide, SwiperClass } from 'swiper/react';
import { Keyboard, Mousewheel, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useGameStore } from '@/store/gameStore';
import { npcs } from '@/data/npcs';
import { Scroll as ScrollType } from '@/types/game';
import { CHRONICLE_BOOK_ID, SCROLL_PRICE } from '@/data/treasures';

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const Collection: React.FC = () => {
  const navigate = useNavigate();
  const { collectedScrolls, openScroll, openAllScrolls, openScrollsBatch, removeScrollsByIds, inventory, playerStats, buyScroll, grantFreeScrollsIfNeeded } = useGameStore();
  const hasChronicleBook = (inventory[CHRONICLE_BOOK_ID] || 0) > 0;
  const [revealingScroll, setRevealingScroll] = useState<ScrollType | null>(null);
  const [showContent, setShowContent] = useState(false);

  // 进入藏珍匣时检查并赠送初始卷轴
  useEffect(() => {
    grantFreeScrollsIfNeeded();
  }, [grantFreeScrollsIfNeeded]);

  // --- 随机回顾状态 ---
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewList, setReviewList] = useState<ScrollType[]>([]);
  const [reviewIndex, setReviewIndex] = useState(0);
  const swiperRef = useRef<SwiperClass | null>(null);

  // --- 查重状态 ---
  interface DedupGroup {
    content: string;
    keep: ScrollType; // 保留的那条
    toRemove: ScrollType[]; // 待去重的
    checked: boolean; // true = 确认销毁
  }
  const [dedupGroups, setDedupGroups] = useState<DedupGroup[]>([]);
  const [showDedupModal, setShowDedupModal] = useState(false);

  const analyzeDuplicates = () => {
    const contentMap = new Map<string, ScrollType[]>();
    for (const scroll of openedScrolls) {
      const key = scroll.openedContent || '';
      if (!key) continue;
      const arr = contentMap.get(key) || [];
      arr.push(scroll);
      contentMap.set(key, arr);
    }
    const groups: DedupGroup[] = [];
    contentMap.forEach(scrolls => {
      if (scrolls.length > 1) {
        groups.push({
          content: scrolls[0].openedContent || '',
          keep: scrolls[0],
          toRemove: scrolls.slice(1),
          checked: true,
        });
      }
    });
    if (groups.length === 0) {
      alert('没有发现重复的卷轴内容');
      return;
    }
    setDedupGroups(groups);
    setShowDedupModal(true);
  };

  const toggleDedupGroup = (index: number) => {
    setDedupGroups(prev => prev.map((g, i) => i === index ? { ...g, checked: !g.checked } : g));
  };

  const confirmDedup = () => {
    const idsToRemove = dedupGroups
      .filter(g => g.checked)
      .flatMap(g => g.toRemove.map(s => s.id));
    if (idsToRemove.length > 0) {
      removeScrollsByIds(idsToRemove);
    }
    setShowDedupModal(false);
    setDedupGroups([]);
  };

  const cancelDedup = () => {
    setShowDedupModal(false);
    setDedupGroups([]);
  };

  const openedScrolls = collectedScrolls.filter(s => s.opened);
  const unopenedScrolls = collectedScrolls.filter(s => !s.opened);

  const startReview = () => {
    if (openedScrolls.length === 0) return;
    setReviewList(shuffleArray(openedScrolls));
    setReviewIndex(0);
    setReviewMode(true);
  };

  const exitReview = () => {
    setReviewMode(false);
  };

  // 键盘 Esc 退出
  useEffect(() => {
    if (!reviewMode && !showDedupModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (reviewMode) exitReview();
        if (showDedupModal) cancelDedup();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [reviewMode, showDedupModal]);

  const handleOpen = (scroll: ScrollType) => {
    if (scroll.opened) {
      // Already opened, just show content
      setRevealingScroll(scroll);
      setShowContent(true);
      return;
    }
    // Open the scroll first
    openScroll(scroll.id);
    setRevealingScroll(scroll);
    setShowContent(false);
    // Trigger reveal animation
    setTimeout(() => setShowContent(true), 300);
  };

  const closeModal = () => {
    setRevealingScroll(null);
    setShowContent(false);
  };

  // Get the latest data from store after openScroll updates it
  const getUpdatedScroll = (id: string) => collectedScrolls.find(s => s.id === id);

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="space-y-6 w-full max-w-2xl">
        <header className="flex gap-4 items-center py-2 shrink-0">
          <button
            onClick={() => navigate('/game')}
            className="p-2 rounded-full transition-colors hover:bg-secondary"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex gap-2 items-center text-xl font-bold">
            <Scroll className="text-primary" />
            藏珍匣
          </h1>
          <div className="flex gap-2 ml-auto">
            {unopenedScrolls.length >= 10 && (
              <button
                onClick={() => openScrollsBatch(10)}
                className="flex gap-1.5 items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Sparkles size={14} />
                十连展
              </button>
            )}
            {unopenedScrolls.length > 1 && unopenedScrolls.length < 10 && (
              <button
                onClick={openAllScrolls}
                className="flex gap-1.5 items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Sparkles size={14} />
                全部展开
              </button>
            )}
            {unopenedScrolls.length >= 10 && (
              <button
                onClick={openAllScrolls}
                className="flex gap-1.5 items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                <Sparkles size={14} />
                全部
              </button>
            )}
            {openedScrolls.length > 1 && (
              <button
                onClick={analyzeDuplicates}
                className="flex gap-1.5 items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                <CopyCheck size={14} />
                查重
              </button>
            )}
            {openedScrolls.length > 0 && (
              <button
                onClick={startReview}
                className="flex gap-1.5 items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                <Shuffle size={14} />
                随机回顾
              </button>
            )}
          </div>
        </header>

        {hasChronicleBook && (
          <div className="p-4 rounded-lg border bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3 items-center">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <BookOpen size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">岁月书已就绪</p>
                  <p className="text-xs text-muted-foreground">卷轴单价 {SCROLL_PRICE.toLocaleString()} 文</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 10, 50].map(n => {
                  const total = SCROLL_PRICE * n;
                  const canAfford = playerStats.money >= total;
                  return (
                    <button
                      key={n}
                      onClick={() => buyScroll(n)}
                      disabled={!canAfford}
                      className={`flex gap-1 items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                        canAfford
                          ? 'bg-amber-600 text-white hover:bg-amber-700'
                          : 'bg-muted text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      <ShoppingCart size={12} />
                      ×{n}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {collectedScrolls.length === 0 ? (
            <div className="col-span-full py-12 text-center rounded-lg border-2 border-dashed text-muted-foreground">
              <p>暂无收藏</p>
              <p className="mt-2 text-xs">
                {hasChronicleBook
                  ? '点击上方「购买卷轴」或与 NPC 建立深厚羁绊获取卷轴'
                  : '与 NPC 建立深厚羁绊或许能获得意外之喜...'}
              </p>
            </div>
          ) : (
            collectedScrolls.map((scroll) => {
              const npcName = scroll.npcId ? npcs.find(n => n.id === scroll.npcId)?.name : '未知';

              return (
                <div key={scroll.id} className="p-4 rounded-lg border shadow-sm transition-shadow bg-card hover:shadow-md">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-primary">{scroll.name}</h3>
                    <span className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground">
                      第 {scroll.obtainedAt} 天获得
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground">{scroll.description}</p>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      赠予者: {npcName}
                    </span>
                    <button
                      onClick={() => handleOpen(scroll)}
                      className="flex gap-1 items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {scroll.opened ? (
                        <>查看卷轴</>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          展开卷轴
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Scroll Content Modal */}
      {revealingScroll && (() => {
        const latest = getUpdatedScroll(revealingScroll.id) || revealingScroll;
        return (
          <div
            className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/60"
            onClick={closeModal}
          >
            <div
              className={`relative w-full max-w-md p-6 rounded-xl border-2 shadow-2xl bg-card transition-all duration-500 ${showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="flex gap-2 items-center text-lg font-bold text-primary">
                  <Scroll size={20} />
                  卷轴内容
                </h2>
                <span className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground">
                  第 {latest.obtainedAt} 天获得
                </span>
              </div>

              <div className="p-4 mb-4 rounded-lg border-2 border-dashed bg-secondary/50 border-primary/30">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {latest.openedContent || '卷轴上的文字模糊不清，无法辨认...'}
                </p>
              </div>

              <div className="flex justify-between items-center mb-3 text-xs text-muted-foreground">
                <div className="flex gap-3">
                  {latest.phoneModel && (
                    <span className="flex gap-1 items-center">
                      <span className="opacity-60">设备:</span> {latest.phoneModel}
                    </span>
                  )}
                  {latest.publishDate && (
                    <span className="flex gap-1 items-center">
                      <span className="opacity-60">发布:</span> {latest.publishDate}
                    </span>
                  )}
                </div>
                <span>
                  赠予者: {latest.npcId ? npcs.find(n => n.id === latest.npcId)?.name : '未知'}
                </span>
              </div>

              <button
                onClick={closeModal}
                className="px-4 py-2 mt-4 w-full text-sm font-medium rounded-md transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                收好卷轴
              </button>
            </div>
          </div>
        );
      })()}

      {/* 随机回顾模式 */}
      {reviewMode && reviewList.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm select-none"
          onClick={exitReview}
        >
          {/* 关闭 */}
          <button
            onClick={e => { e.stopPropagation(); exitReview(); }}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
          >
            ✕
          </button>

          {/* Swiper 轮播 */}
          <div className="relative flex items-center justify-center w-full h-full px-12 sm:px-16" onClick={e => e.stopPropagation()}>
            {/* 上一张按钮 */}
            <button className="swiper-prev absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronLeft size={24} />
            </button>

            <Swiper
              modules={[Keyboard, Mousewheel, Navigation]}
              keyboard
              mousewheel={{ forceToAxis: true }}
              navigation={{ prevEl: '.swiper-prev', nextEl: '.swiper-next' }}
              spaceBetween={0}
              slidesPerView={1}
              centeredSlides
              loop={reviewList.length > 1}
              initialSlide={0}
              onSwiper={s => { swiperRef.current = s; }}
              onSlideChange={s => setReviewIndex(s.realIndex)}
              className="w-full h-full"
            >
              {reviewList.map((scroll, idx) => {
                const npcName = scroll.npcId ? npcs.find(n => n.id === scroll.npcId)?.name : '未知';
                return (
                  <SwiperSlide key={scroll.id + '-' + idx}>
                    <div className="flex items-center justify-center w-full h-full px-4 py-14 overflow-hidden">
                      <div className="w-full max-w-md max-h-[calc(100vh-7rem)] flex flex-col rounded-xl border-2 shadow-2xl bg-card border-primary/30">
                        {/* 固定头部 */}
                        <div className="shrink-0 px-6 pt-5 pb-3">
                          <div className="flex justify-center mb-3">
                            <span className="px-3 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-mono">
                              {idx + 1} / {reviewList.length}
                            </span>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Shuffle size={18} className="text-primary" />
                            <h2 className="text-lg font-bold text-primary">随机回顾</h2>
                            <span className="ml-auto px-2 py-0.5 text-xs rounded bg-secondary text-muted-foreground">
                              第 {scroll.obtainedAt} 天获得
                            </span>
                          </div>
                        </div>

                        {/* 可滚动内容区 */}
                        <div
                          className="flex-1 overflow-y-auto px-6 py-2 min-h-0"
                          style={{ touchAction: 'pan-y' }}
                        >
                          <div className="p-4 rounded-lg border-2 border-dashed bg-secondary/50 border-primary/30">
                            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                              {scroll.openedContent || '卷轴上的文字模糊不清，无法辨认...'}
                            </p>
                          </div>
                        </div>

                        {/* 固定底部 */}
                        <div className="shrink-0 px-6 pb-5 pt-3">
                          <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex gap-3">
                              {scroll.phoneModel && (
                                <span><span className="opacity-60">设备:</span> {scroll.phoneModel}</span>
                              )}
                              {scroll.publishDate && (
                                <span><span className="opacity-60">发布:</span> {scroll.publishDate}</span>
                              )}
                            </div>
                            <span>赠予者: {npcName}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* 下一张按钮 */}
            <button className="swiper-next absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
              <ChevronRight size={24} />
            </button>
          </div>

          {/* 底部提示 */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/30 z-30">
            滑动 / 滚轮 / 方向键切换 · Esc 退出
          </p>
        </div>
      )}

      {/* 查重结果弹窗 */}
      {showDedupModal && dedupGroups.length > 0 && (
        <div
          className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/60"
          onClick={cancelDedup}
        >
          <div
            className="relative w-full max-w-lg max-h-[80vh] flex flex-col rounded-xl border-2 shadow-2xl bg-card"
            onClick={e => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="shrink-0 px-6 pt-5 pb-3 border-b">
              <div className="flex gap-2 items-center">
                <CopyCheck size={18} className="text-primary" />
                <h2 className="text-lg font-bold text-primary">查重结果</h2>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                发现 {dedupGroups.length} 组重复内容，共 {dedupGroups.reduce((s, g) => s + g.toRemove.length, 0)} 条待去重
              </p>
            </div>

            {/* 重复列表 */}
            <div className="flex-1 overflow-y-auto px-6 py-3 space-y-3 min-h-0">
              {dedupGroups.map((group, idx) => (
                <div key={idx} className="p-3 rounded-lg border bg-secondary/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      第 {group.keep.obtainedAt} 天 ×{group.toRemove.length + 1}
                    </span>
                    <button
                      onClick={() => toggleDedupGroup(idx)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                        group.checked
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-secondary text-muted-foreground border border-transparent'
                      }`}
                    >
                      {group.checked ? <Check size={12} /> : <Trash2 size={12} />}
                      {group.checked ? '去重' : '保留全部'}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap line-clamp-3">
                    {group.content}
                  </p>
                  {group.checked && (
                    <p className="mt-1.5 text-xs text-red-400/80">
                      将销毁 {group.toRemove.length} 条重复卷轴，保留 1 条
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* 底部按钮 */}
            <div className="shrink-0 flex gap-3 px-6 py-4 border-t">
              <button
                onClick={cancelDedup}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors bg-secondary text-secondary-foreground hover:bg-secondary/80"
              >
                取消
              </button>
              <button
                onClick={confirmDedup}
                disabled={!dedupGroups.some(g => g.checked)}
                className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  dedupGroups.some(g => g.checked)
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                <Trash2 size={14} />
                确认去重 ({dedupGroups.filter(g => g.checked).reduce((s, g) => s + g.toRemove.length, 0)})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
