import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, User } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName: string;
  initialAvatar: string;
  onSave: (name: string, avatar: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  initialName,
  initialAvatar,
  onSave,
}) => {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when prop changes
  useEffect(() => {
    if (isOpen) {
        setName(initialName);
        setAvatar(initialAvatar);
    }
  }, [isOpen, initialName, initialAvatar]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limit file size to 2MB to prevent localStorage issues
      if (file.size > 2 * 1024 * 1024) {
          alert('图片大小不能超过 2MB');
          return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
        alert('名称不能为空');
        return;
    }
    onSave(name, avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card rounded-lg shadow-xl border text-card-foreground animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">个人设置</h2>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div 
              className="relative w-24 h-24 rounded-full border-2 border-primary/20 overflow-hidden bg-secondary flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity group"
              onClick={() => fileInputRef.current?.click()}
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-muted-foreground" />
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload size={24} className="text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange} 
            />
            <span className="text-sm text-muted-foreground">点击头像上传图片 (最大 2MB)</span>
          </div>

          {/* Name Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="请输入名称"
              maxLength={10}
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary rounded-md"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-sm font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};
