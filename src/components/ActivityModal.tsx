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
  imageUrl: string;          // 图片URL
  imageAlt?: string;         // 图片描述
  linkUrl?: string;         // 可选的点击图片跳转链接
  onClose: () => void;      // 关闭回调
  onDismiss: (activityId: string, contentHash: string) => void; // 记录关闭的回调
}

/**
 * 计算内容的简单哈希值
 * 用于判断内容是否发生变化（不包含时间戳）
 */
const hashContent = (activityId: string, imageUrl: string, title?: string): string => {
  return `${activityId}:${imageUrl}:${title || ''}`;
};

export const ActivityModal: React.FC<ActivityModalProps> = ({
  isOpen,
  activityId,
  title,
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
      const contentHash = hashContent(activityId, imageUrl, title);
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
        ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-transparent'}
      `}
      onClick={handleClose}
    >
      <div
        className={`
          relative max-w-lg w-full h-[80vh] rounded-2xl overflow-hidden
          transition-all duration-300
          ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 可滚动的内部容器 */}
        <div className="h-full overflow-y-auto overscroll-contain">
          {/* 关闭按钮 */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* 标题 */}
          {title && (
            <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-4 sticky top-0 z-10">
              <h2 className="text-xl font-bold text-white text-center drop-shadow-lg">
                {title}
              </h2>
            </div>
          )}

          {/* 图片内容 */}
          <div
            className={`
              relative cursor-pointer group
              ${linkUrl ? 'hover:ring-4 hover:ring-primary/50' : ''}
            `}
            onClick={handleImageClick}
          >
            <img
              src={imageUrl}
              alt={imageAlt}
              className="w-full h-auto object-contain"
              loading="eager"
            />
            {/* 点击提示 */}
            {linkUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">
                  点击查看详情
                </span>
              </div>
            )}
          </div>
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
    return !dismissedHash || dismissedHash !== hashContent(activity.id, activity.imageUrl);
  });

  if (!activeActivity) return null;

  return (
    <ActivityModal
      isOpen={true}
      activityId={activeActivity.id}
      imageUrl={activeActivity.imageUrl}
      imageAlt={activeActivity.imageAlt}
      linkUrl={activeActivity.linkUrl}
      onClose={onClose}
      onDismiss={onDismiss}
    />
  );
};

export { hashContent };
