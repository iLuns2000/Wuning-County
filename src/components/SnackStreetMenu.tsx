import { useEffect, useRef, useState } from 'react';
import { Coins, ShoppingBag, Utensils, X, Check } from 'lucide-react';
import { snacks } from '@/data/snacks';
import { CachedImage } from '@/utils/imageCache';

interface Props {
  money: number;
  getPrice: (id: string) => number;
  onTaste: (id: string, price: number) => void;
  onTakeout: (id: string, price: number) => void;
  onClose: () => void;
  embedded?: boolean;
}

export function SnackStreetMenu({ money, getPrice, onTaste, onTakeout, onClose, embedded = false }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (embedded) return;
    dialog.current?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [embedded]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  return (
    <dialog ref={dialog} open={embedded || undefined} aria-labelledby="snack-menu-title" className="snack-menu"
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
      }}>
      <div className="snack-menu-shell">
        <header className="snack-menu-header">
          <div className="flex min-w-0 items-center gap-3">
            <div className="snack-menu-mark"><Utensils size={23} /></div>
            <div className="min-w-0">
              <h2 id="snack-menu-title" className="text-xl font-display font-bold">无宁小吃街</h2>
              <p className="mt-1 text-xs text-muted-foreground">市井烟火，一味无宁</p>
            </div>
          </div>
          <button autoFocus onClick={onClose} aria-label="关闭小吃街" title="关闭" className="snack-menu-close"><X size={21} /></button>
        </header>
        <div className="snack-menu-wallet">
          <span className="text-sm text-muted-foreground">今日食单 <span className="ml-1 text-xs">· {snacks.length} 味</span></span>
          <span className="flex items-center gap-2 text-sm"><Coins size={17} /><strong className="font-mono">{money.toLocaleString()}</strong><span className="text-muted-foreground">文</span></span>
        </div>
        <div className="snack-menu-scroll">
          <div className="snack-menu-list">
            {snacks.map((snack, index) => {
              const price = getPrice(snack.id);
              const canBuy = money >= price;
              const effects = [
                ['体力', snack.effect?.health], ['文化', snack.effect?.culture],
                ['能力', snack.effect?.ability], ['声望', snack.effect?.reputation],
              ] as const;
              return (
                <article key={snack.id} className="snack-menu-item">
                  <div className="snack-menu-image">
                    <CachedImage src={`/images/${snack.id}.webp`} alt={snack.name}
                      className="h-full w-full object-contain [image-rendering:pixelated]"
                      placeholder={<Utensils size={28} className="text-muted-foreground" />} />
                  </div>
                  <div className="snack-menu-item-heading">
                    <div className="flex min-w-0 items-baseline gap-2"><span className="snack-menu-number">{String(index + 1).padStart(2, '0')}</span><h3 className="font-display font-bold break-words">{snack.name}</h3></div>
                    <span className="shrink-0 text-sm"><strong className="font-mono text-base">{price}</strong><span className="ml-1 text-xs text-muted-foreground">文</span></span>
                  </div>
                  <p className="snack-menu-description">{snack.description}</p>
                  <div className="snack-menu-effects">
                    {effects.map(([label, value]) => typeof value === 'number' && value !== 0 && (
                      <span key={label} className={value < 0 ? 'snack-effect-negative' : ''}>{label} {value > 0 ? '+' : ''}{value}</span>
                    ))}
                  </div>
                  <div className="snack-menu-item-actions">
                    <button className="snack-menu-action snack-menu-taste" disabled={!canBuy}
                      aria-label={`品尝${snack.name}，${price}文`}
                      onClick={() => { onTaste(snack.id, price); setNotice(`已品尝 · ${snack.name}`); }}><Utensils size={16} />品尝</button>
                    <button className="snack-menu-action snack-menu-takeout" disabled={!canBuy}
                      aria-label={`打包${snack.name}，${price}文`}
                      onClick={() => { onTakeout(snack.id, price); setNotice(`已放入行囊 · ${snack.name}`); }}><ShoppingBag size={16} />打包</button>
                  </div>
                  {!canBuy && <p className="mt-2 text-xs text-muted-foreground">银两不足</p>}
                </article>
              );
            })}
          </div>
        </div>
        <footer className="snack-menu-footer" role="status" aria-live="polite">
          {notice ? <><Check size={16} />{notice}</> : <><ShoppingBag size={15} />行囊里的滋味，留给下一段路</>}
        </footer>
      </div>
    </dialog>
  );
}
