import { MotionPresence } from '@/components/MotionPresence';
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sun,
  MapPin,
  Sprout,
  Users,
  Backpack,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { useInterfaceStore } from "@/store/interfaceStore";
import { SettingsModal } from "@/components/SettingsModal";
import "@/styles/modern-game.css";

export function ModernRouteFrame({ children }: { children: React.ReactNode }) {
  const modern = useInterfaceStore((state) => state.version === "modern");
  const location = useLocation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(false);
  if (!modern || location.pathname === "/" || location.pathname === "/game")
    return <>{children}</>;
  const origin = location.state?.returnTo;
  const backTo = location.pathname.startsWith('/npcs/') && typeof origin === 'string' &&
    (origin.startsWith('/game?') || origin === '/npcs') ? origin : null;
  const active = location.pathname.startsWith("/npcs")
    ? "人物"
    : location.pathname === "/tasks"
      ? "今日"
      : location.pathname === "/collection"
      ? "行囊"
      : "县城";
  return (
    <div className="mg-shell mg-route-shell">
      <aside className="mg-rail">
        <div className="mg-brand">
          无宁县志<span>暮山入城 · 县中有你</span>
        </div>
        <nav aria-label="游戏主导航">
          {[
            { name: "今日", icon: Sun },
            { name: "县城", icon: MapPin },
            { name: "经营", icon: Sprout },
            { name: "人物", icon: Users },
            { name: "行囊", icon: Backpack },
          ].map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={active === name ? "active" : ""}
              onClick={() => navigate(`/game?tab=${encodeURIComponent(name)}`)}
            >
              <Icon size={20} />
              {name}
            </button>
          ))}
        </nav>
        <button className="mg-settings" onClick={() => setSettings(true)}>
          <Settings size={18} />
          设置
        </button>
      </aside>
      <main className="mg-main">
        <header className="mg-topbar">
          <button
            onClick={() => navigate(backTo || `/game?tab=${encodeURIComponent(active)}`)}
          >
            <ArrowLeft size={18} />
            返回{active}
          </button>
          <button
            aria-label="设置"
            title="设置"
            onClick={() => setSettings(true)}
          >
            <Settings size={20} />
          </button>
        </header>
        <div className="mg-route-content">{children}</div>
      </main>
      <MotionPresence show={settings}><SettingsModal isOpen={true} onClose={() => setSettings(false)} /></MotionPresence>
    </div>
  );
}
