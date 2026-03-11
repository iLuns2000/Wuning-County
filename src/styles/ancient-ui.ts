/**
 * 古风 UI 组件样式库
 * 按需引入需要的组件样式
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// 工具函数：合并类名
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ===== 按钮组件 =====
export const buttonVariants = {
  // 主要按钮 - 朱砂红
  default: cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg",
    "text-sm font-medium transition-all duration-300",
    "bg-gradient-to-b from-[#d95558] to-[#c94043]",
    "text-white shadow-lg shadow-red-900/20",
    "hover:shadow-xl hover:shadow-red-900/30 hover:-translate-y-0.5",
    "active:translate-y-0 active:shadow-md",
    "disabled:pointer-events-none disabled:opacity-50",
    "btn-glow" // 光晕效果
  ),
  
  // 次级按钮 - 黛蓝
  secondary: cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg",
    "text-sm font-medium transition-all duration-300",
    "bg-secondary text-secondary-foreground",
    "hover:bg-secondary/80 hover:border-primary/20",
    "border border-transparent",
    "disabled:pointer-events-none disabled:opacity-50"
  ),
  
  // 幽灵按钮 - 透明背景
  ghost: cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg",
    "text-sm font-medium transition-all duration-200",
    "hover:bg-secondary/50",
    "disabled:pointer-events-none disabled:opacity-50"
  ),
  
  // 边框按钮
  outline: cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg",
    "text-sm font-medium transition-all duration-300",
    "border border-border bg-transparent",
    "hover:bg-secondary/50 hover:border-primary/30",
    "disabled:pointer-events-none disabled:opacity-50"
  ),
  
  // 危险按钮
  destructive: cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg",
    "text-sm font-medium transition-all duration-300",
    "bg-gradient-to-b from-red-600 to-red-700",
    "text-white shadow-lg shadow-red-900/30",
    "hover:shadow-xl hover:-translate-y-0.5",
    "active:translate-y-0",
    "disabled:pointer-events-none disabled:opacity-50"
  ),
  
  // 金色按钮 - 用于特殊强调
  gold: cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg",
    "text-sm font-medium transition-all duration-300",
    "bg-gradient-to-b from-[#e5c06a] to-[#c4973d]",
    "text-gray-900 shadow-lg shadow-amber-900/30",
    "hover:shadow-xl hover:shadow-amber-900/40 hover:-translate-y-0.5",
    "active:translate-y-0",
    "btn-glow"
  ),
};

// 按钮尺寸
export const buttonSizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 py-2",
  lg: "h-12 px-6 text-base",
  xl: "h-14 px-8 text-lg",
};

// ===== 卡片组件 =====
export const cardStyles = {
  // 古风卡片
  ancient: cn(
    "relative rounded-xl border border-white/5",
    "bg-gradient-to-b from-[#1e2d2f] to-[#182628]",
    "shadow-lg shadow-black/30",
    "overflow-hidden"
  ),
  
  // 简洁卡片
  simple: cn(
    "rounded-lg border border-border",
    "bg-card",
    "shadow-sm"
  ),
  
  // 交互卡片
  interactive: cn(
    "rounded-xl border border-white/5",
    "bg-gradient-to-b from-[#1e2d2f] to-[#182628]",
    "shadow-lg shadow-black/30",
    "transition-all duration-300",
    "hover:border-primary/30 hover:shadow-xl hover:shadow-black/40",
    "cursor-pointer"
  ),
  
  // 弹窗卡片
  modal: cn(
    "relative max-w-lg w-full mx-4 p-6 rounded-2xl",
    "bg-gradient-to-b from-[#1e2d2f] to-[#182628]",
    "border border-white/10",
    "shadow-2xl shadow-black/50",
    "modal-enter"
  ),
};

// ===== 输入框组件 =====
export const inputStyles = {
  // 古风输入框
  ancient: cn(
    "flex h-10 w-full rounded-lg",
    "bg-secondary/50 border border-border",
    "px-3 py-2 text-sm",
    "placeholder:text-muted-foreground",
    "transition-all duration-300",
    "focus:outline-none focus:ring-2 focus:ring-primary/50",
    "focus:border-primary/50",
    "disabled:cursor-not-allowed disabled:opacity-50"
  ),
  
  // 搜索框
  search: cn(
    "flex h-10 w-full rounded-lg",
    "bg-secondary/50 border border-white/10",
    "px-4 py-2 pl-10 text-sm",
    "placeholder:text-muted-foreground",
    "transition-all duration-300",
    "focus:outline-none focus:ring-2 focus:ring-primary/50",
    "focus:bg-secondary/70 focus:border-primary/30",
    "hover:bg-secondary/60"
  ),
};

// ===== 进度条组件 =====
export const progressStyles = {
  // 基础进度条
  base: cn(
    "h-2 rounded-full bg-[#2d3f47] overflow-hidden"
  ),
  
  // 带流光效果
  glow: cn(
    "h-2 rounded-full bg-[#2d3f47] overflow-hidden",
    "progress-glow"
  ),
  
  // 迷你进度条
  mini: cn(
    "h-1 rounded-full bg-[#2d3f47] overflow-hidden"
  ),
};

// 进度条颜色变体
export const progressColors = {
  default: "bg-primary",
  gold: "bg-[#d4a84b]",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-cyan-500",
};

// ===== 徽章组件 =====
export const badgeVariants = {
  // 默认徽章
  default: cn(
    "inline-flex items-center rounded-full",
    "px-2.5 py-0.5 text-xs font-medium",
    "bg-primary/10 text-primary",
    "border border-primary/20"
  ),
  
  // 成功徽章
  success: cn(
    "inline-flex items-center rounded-full",
    "px-2.5 py-0.5 text-xs font-medium",
    "bg-emerald-500/10 text-emerald-400",
    "border border-emerald-500/20"
  ),
  
  // 警告徽章
  warning: cn(
    "inline-flex items-center rounded-full",
    "px-2.5 py-0.5 text-xs font-medium",
    "bg-amber-500/10 text-amber-400",
    "border border-amber-500/20"
  ),
  
  // 危险徽章
  destructive: cn(
    "inline-flex items-center rounded-full",
    "px-2.5 py-0.5 text-xs font-medium",
    "bg-red-500/10 text-red-400",
    "border border-red-500/20"
  ),
  
  // 金色徽章
  gold: cn(
    "inline-flex items-center rounded-full",
    "px-2.5 py-0.5 text-xs font-medium",
    "bg-amber-500/10 text-amber-300",
    "border border-amber-500/30"
  ),
  
  // 轮廓徽章
  outline: cn(
    "inline-flex items-center rounded-full",
    "px-2.5 py-0.5 text-xs font-medium",
    "border border-border text-foreground"
  ),
};

// ===== 动画类 =====
export const animations = {
  // 浮动入场
  floatIn: "animate-[floatIn_0.6s_ease-out_forwards]",
  
  // 淡入
  fadeIn: "animate-[fadeIn_0.3s_ease-out_forwards]",
  
  // 滑入
  slideIn: "animate-[slideIn_0.3s_ease-out_forwards]",
  
  // 弹跳
  bounce: "animate-[bounce_0.5s_ease-out]",
  
  // 脉冲
  pulse: "animate-pulse",
  
  // 旋转
  spin: "animate-spin",
};

// 动画关键帧（需要添加到全局 CSS）
export const animationKeyframes = `
  @keyframes floatIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes gentleFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
`;