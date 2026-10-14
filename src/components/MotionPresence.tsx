import React, { useLayoutEffect, useRef, useState } from 'react';

/** Keep the last visible subtree mounted until its exit motion finishes. */
export function MotionPresence({ show, children, kind = 'modal' }: {
  show: boolean;
  children: React.ReactNode;
  kind?: 'modal' | 'drawer';
}) {
  const [retained, setRetained] = useState(show);
  const previous = useRef(children);
  const root = useRef<HTMLDivElement>(null);
  if (show) previous.current = children;

  useLayoutEffect(() => {
    if (show) {
      setRetained(true);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setRetained(false);
      return;
    }
    const timer = window.setTimeout(() => setRetained(false), 180);
    return () => window.clearTimeout(timer);
  }, [show]);

  useLayoutEffect(() => {
    // A native dialog is in the top layer, so also disable its own controls.
    root.current?.querySelectorAll<HTMLElement>(':scope > *, dialog').forEach(element => {
      element.inert = !show;
    });
  }, [show, retained]);

  if (!show && !retained) return null;
  return <div ref={root} className={`motion-presence motion-${kind}`} data-state={show ? 'open' : 'closing'}>
    {show ? children : previous.current}
  </div>;
}
