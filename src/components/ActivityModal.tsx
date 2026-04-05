/**
 * 活动弹窗组件
 * - 展示一张图片
 * - 用户点击关闭后不再显示
 * - 只有下次内容变更后才会再次显示
 */
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';

interface ActivityModalProps {
  isOpen: boolean;
  activityId: string;        // 活动唯一标识符
  title?: string;           // 活动标题
  content?: string;         // 活动文字内容
  imageUrl: string;          // 图片URL
  imageAlt?: string;         // 图片描述
  linkUrl?: string;         // 可选的点击图片跳转链接
  onClose: () => void;      // 关闭回调
  onDismiss: (activityId: string, contentHash: string) => void; // 记录关闭的回调
}

/**
 * 格式化图片URL，如果缺少完整前缀则补齐
 */
const formatImageUrl = (url: string): string => {
  if (url && url.startsWith('/uploads/') && !url.startsWith('http')) {
    return `https://wuning.online${url}`;
  }
  return url;
};

/**
 * 计算内容的简单哈希值
 * 用于判断内容是否发生变化（不包含时间戳）
 */
const hashContent = (activityId: string, imageUrl: string, title?: string, content?: string): string => {
  return `${activityId}:${formatImageUrl(imageUrl)}:${title || ''}:${content || ''}`;
};

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  activityId,
  title,
  content,
  imageUrl,
  imageAlt = '活动图片',
  linkUrl,
  onClose,
  onDismiss,
}) => {
  const vibrate = useGameVibrate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 入场动画
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    setIsVisible(false);
    // 等待退场动画完成后调用关闭
    setTimeout(() => {
      onClose();
      // 记录已关闭的活动和内容哈希
      const contentHash = hashContent(activityId, imageUrl, title, content);
      onDismiss(activityId, contentHash);
    }, 300);
  };

  const handleImageClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4
        transition-all duration-300
        ${isVisible ? 'backdrop-blur-sm bg-black/60' : 'bg-transparent'}
      `}
      onClick={handleClose}
    >
      <div
        className={`
          relative max-w-lg w-full h-[80vh] rounded-2xl overflow-hidden bg-muted
          transition-all duration-300
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 可滚动的内部容器 */}
        <div className="overflow-y-auto overscroll-contain h-full">
          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-20 p-2 rounded-full transition-colors bg-black/50 hover:bg-black/70"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* 标题 */}
          {title && (
            <div className="sticky top-0 z-10 px-6 py-4 bg-gradient-to-r from-amber-600 to-orange-500">
              <h2 className="text-xl font-bold text-center text-white drop-shadow-lg">
                {title}
              </h2>
            </div>
          )}

          {/* 文字内容 */}
          {content && (
            <div className="px-6 py-4 leading-relaxed whitespace-pre-wrap text-foreground">
              {content}
            </div>
          )}

          {/* 图片内容 */}
          <div
            className={`
              relative cursor-pointer group
              ${linkUrl ? 'hover:ring-4 hover:ring-primary/50' : ''}`}
            onClick={handleImageClick}
          >
            <img
              src={formatImageUrl(imageUrl)}
              alt={imageAlt}
              className="object-contain w-full h-auto"
              loading="eager"
            />
            {/* 点击提示 */}
            {linkUrl && (
              <div className="flex absolute inset-0 justify-center items-center opacity-0 transition-opacity bg-black/40 group-hover:opacity-100">
                <span className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground">
                  点击查看详情
                </span>
              </div>
            )}
          </div>

          <p className="px-6 py-3 text-center text-xs text-muted-foreground border-t border-border/40">
            关闭后可在游戏内
            <a href="#/announcements" className="text-primary underline-offset-2 hover:underline mx-0.5">
              公告栏
            </a>
            随时查看
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * 活动弹窗管理组件
 * 根据存储的已关闭状态决定是否显示弹窗
 */
interface ActivityPopupManagerProps {
  activities: Array<{
    id: string;
    title?: string;
    content?: string;
    imageUrl: string;
    imageAlt?: string;
    linkUrl?: string;
  }>;
  dismissedActivities: Record<string, string>; // activityId -> contentHash
  onDismiss: (activityId: string, contentHash: string) => void;
  onClose: () => void;
}

export const ActivityPopupManager: React.FC<ActivityPopupManagerProps> = ({
  activities,
  dismissedActivities,
  onDismiss,
  onClose,
}) => {
  // 找到第一个需要显示的活动
  const activeActivity = activities.find((activity) => {
    const dismissedHash = dismissedActivities[activity.id];
    // 如果没有关闭过，或者内容哈希不匹配，则显示
    return !dismissedHash || dismissedHash !== hashContent(activity.id, activity.imageUrl, activity.title, activity.content);
  });

  if (!activeActivity) return null;

  return (
    <ActivityModal
      isOpen={true}
      activityId={activeActivity.id}
      title={activeActivity.title}
      content={activeActivity.content}
      imageUrl={activeActivity.imageUrl}
      imageAlt={activeActivity.imageAlt}
      linkUrl={activeActivity.linkUrl}
      onClose={onClose}
      onDismiss={onDismiss}
    />
  );
};

export { hashContent, formatImageUrl };
