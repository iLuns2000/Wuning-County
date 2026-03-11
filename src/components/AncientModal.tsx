/**
 * 古风通用 Modal 弹窗组件
 * 包含墨韵边框效果和入场动画
 */
import React from 'react';
import { X } from 'lucide-react';

interface AncientModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

const modalSizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const AncientModal: React.FC<AncientModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  return (
    /* 遮罩层 */
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      /* 背景遮罩 - 毛玻璃效果 */
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        style={{
          animation: 'fadeIn 0.2s ease-out forwards'
        }}
      />
      
      /* 弹窗主体 */
      <div 
        className={`
          relative w-full ${modalSizeClasses[size]} p-6 rounded-2xl
          bg-gradient-to-b from-[#1e2d2f] to-[#182628]
          border border-white/10 shadow-2xl shadow-black/50
          animate-modalIn
          overflow-hidden
        `}
        onClick={e => e.stopPropagation()}
        style={{
          animation: 'modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
        }}
      >
        /* 墨韵边框效果 - 顶部 */
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        
        /* 墨韵边框效果 - 底部 */
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        
        /* 左侧装饰线 */
        <div className="absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-amber-500/30 to-transparent" />
        
        /* 标题栏 */
        {title && (
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <h2 className="text-lg font-bold font-display flex items-center gap-2">
              <span className="w-1 h-5 bg-amber-500 rounded-full" />
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            )}
          </div>
        )}
        
        /* 关闭按钮（无标题时） */
        {showCloseButton && !title && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 transition-colors z-10"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        )}
        
        /* 内容区 */
        <div className="relative">
          {children}
        </div>
        
        /* 底部装饰 */
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          <span className="w-1 h-1 rounded-full bg-amber-500/50" />
          <span className="w-1 h-1 rounded-full bg-amber-500/30" />
          <span className="w-1 h-1 rounded-full bg-amber-500/20" />
        </div>
      </div>
    </div>
  );
};

// ===== 古风按钮组件 =====
interface AncientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
}

const variantClasses = {
  default: `
    bg-gradient-to-b from-[#d95558] to-[#c94043]
    text-white shadow-lg shadow-red-900/20
    hover:shadow-xl hover:shadow-red-900/30 hover:-translate-y-0.5
    active:translate-y-0 active:shadow-md
  `,
  secondary: `
    bg-secondary text-secondary-foreground
    hover:bg-secondary/80 border border-transparent
    hover:border-primary/20
  `,
  ghost: `
    bg-transparent hover:bg-secondary/50
  `,
  outline: `
    border border-border bg-transparent
    hover:bg-secondary/50 hover:border-primary/30
  `,
  gold: `
    bg-gradient-to-b from-[#e5c06a] to-[#c4973d]
    text-gray-900 shadow-lg shadow-amber-900/30
    hover:shadow-xl hover:shadow-amber-900/40 hover:-translate-y-0.5
    active:translate-y-0
  `,
  danger: `
    bg-gradient-to-b from-red-600 to-red-700
    text-white shadow-lg shadow-red-900/30
    hover:shadow-xl hover:-translate-y-0.5
    active:translate-y-0
  `,
};

const sizeClasses = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 py-2 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export const AncientButton: React.FC<AncientButtonProps> = ({
  variant = 'default',
  size = 'md',
  children,
  icon,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-lg
        font-medium transition-all duration-300
        disabled:pointer-events-none disabled:opacity-50
        btn-glow
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};

// ===== 古风输入框 =====
interface AncientInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const AncientInput: React.FC<AncientInputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="text-xs text-muted-foreground">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          className={`
            flex h-10 w-full rounded-lg
            bg-secondary/50 border border-white/10
            px-3 py-2 text-sm
            placeholder:text-muted-foreground/60
            transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-primary/30
            focus:border-primary/50 hover:border-white/20
            disabled:cursor-not-allowed disabled:opacity-50
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
};

// ===== 古风徽章 =====
interface AncientBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gold' | 'outline';
  className?: string;
}

const badgeVariantClasses = {
  default: 'bg-primary/10 text-primary border-primary/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  gold: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  outline: 'border border-border text-foreground',
};

export const AncientBadge: React.FC<AncientBadgeProps> = ({
  children,
  variant = 'default',
  className = '',
}) => {
  return (
    <span className={`
      inline-flex items-center rounded-full
      px-2.5 py-0.5 text-xs font-medium
      border transition-colors
      ${badgeVariantClasses[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
};

// ===== 古风分割线 =====
export const AncientDivider: React.FC<{ label?: string }> = ({ label }) => {
  if (!label) {
    return (
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />
    );
  }
  
  return (
    <div className="flex items-center gap-4 my-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/10" />
    </div>
  );
};