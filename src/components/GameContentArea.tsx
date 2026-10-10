import React, { useLayoutEffect, useRef, useState } from "react";

export function useDesktopGameLayout() {
  const [desktop, setDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  useLayoutEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return desktop;
}

function sections(children: React.ReactNode): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child) =>
    React.isValidElement<{ children?: React.ReactNode }>(child) && child.type === React.Fragment
      ? sections(child.props.children)
      : [child],
  );
}

export function GameContentArea({
  children,
  contentKey,
}: {
  children: React.ReactNode;
  contentKey: string;
}) {
  const content = useRef<HTMLDivElement>(null);
  const desktop = useDesktopGameLayout();
  useLayoutEffect(() => {
    if (!desktop) return;
    content.current?.querySelectorAll<HTMLElement>(
      ".mg-list, .mg-inventory, .mg-today-actions, .mg-story, .mg-today-effects",
    ).forEach((list) => { list.scrollTop = 0; });
  }, [contentKey, desktop]);

  return (
    <div className="mg-content-area" ref={content}>
      {sections(children).map((section, index) =>
        React.isValidElement(section) ? React.cloneElement(section, { key: index }) : section,
      )}
    </div>
  );
}
