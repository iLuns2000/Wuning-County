import { useEffect, useRef } from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { useInterfaceStore } from '@/store/interfaceStore';

export function InterfaceChoice() {
  const selectVersion = useInterfaceStore(state => state.selectVersion);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialog.current?.showModal();
  }, []);

  return (
    <dialog ref={dialog} onCancel={event => event.preventDefault()}
      aria-labelledby="interface-choice-title"
      className="w-[calc(100%-2rem)] max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl backdrop:bg-black/60">
      <h2 id="interface-choice-title" className="mb-3 text-xl font-display">重返无宁</h2>
      <p className="mb-6 text-sm text-muted-foreground">已找到你的存档。选择界面，继续这段旅程。</p>
      <div className="grid grid-cols-2 gap-3">
        <button autoFocus onClick={() => selectVersion('classic')}
          className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-border px-3 py-3 text-sm hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
          <BookOpen size={18} />经典界面
        </button>
        <button onClick={() => selectVersion('modern')}
          className="flex min-h-12 items-center justify-center gap-2 rounded-md px-3 py-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{ backgroundColor: '#A4ABD6', color: '#292D36' }}>
          <Sparkles size={18} />暮山紫新版
        </button>
      </div>
    </dialog>
  );
}
