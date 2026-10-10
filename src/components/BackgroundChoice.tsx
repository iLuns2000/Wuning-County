import { useEffect, useRef } from "react";
import { Image, ImageOff } from "lucide-react";
import { useInterfaceStore } from "@/store/interfaceStore";
import { useGameStore } from "@/store/gameStore";

export function BackgroundChoice() {
  const dialog = useRef<HTMLDialogElement>(null);
  const dismiss = useInterfaceStore((state) => state.dismissBackgroundChoice);
  const setBackground = useGameStore((state) => state.setShowBackgroundImage);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    dialog.current?.showModal();
    return () => previousFocus?.focus();
  }, []);
  const choose = (enabled: boolean) => {
    setBackground(enabled);
    dismiss();
  };
  return (
    <dialog
      ref={dialog}
      onCancel={dismiss}
      aria-labelledby="background-choice-title"
      className="w-[calc(100%-2rem)] max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl backdrop:bg-black/60"
    >
      <h2
        id="background-choice-title"
        className="text-xl font-display font-bold"
      >
        让无宁的风景回来
      </h2>
      <p className="my-4 text-sm leading-relaxed text-muted-foreground">
        是否开启动态背景？县城风景会随昼夜与天气变化。之后也可以在设置中调整。
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          autoFocus
          onClick={() => choose(true)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Image size={18} />
          开启动态背景
        </button>
        <button
          onClick={() => choose(false)}
          className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-border px-4 py-3 text-sm hover:bg-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <ImageOff size={18} />
          暂不开启
        </button>
      </div>
    </dialog>
  );
}
