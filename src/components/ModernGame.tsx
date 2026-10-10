import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Sun,
  MapPin,
  Sprout,
  Users,
  Backpack,
  ChevronRight,
  ArrowLeft,
  X,
  Settings,
  BookOpen,
  Coins,
  Heart,
  Moon,
  Briefcase,
  Shield,
  Utensils,
  Star,
  ScrollText,
  ShoppingBag,
  Package,
  Trophy,
  Compass,
} from "lucide-react";
import { useGameStore, getDateInfo } from "@/store/gameStore";
import { roles } from "@/data/roles";
import { tasks } from "@/data/tasks";
import { items } from "@/data/items";
import { npcs } from "@/data/npcs";
import { facilities } from "@/data/facilities";
import { CachedImage } from "@/utils/imageCache";
import { LogPanel } from "@/components/LogPanel";
import { DebuffPanel } from "@/components/DebuffPanel";
import { GameContentArea, useDesktopGameLayout } from "@/components/GameContentArea";
import "@/styles/modern-game.css";

interface Props {
  onWork: () => void;
  onRest: () => void;
  onSkill: () => void;
  onMerchantPatrol: () => void;
  onEscort: () => void;
  onOpen: (name: string) => void;
  renderFeature: (name: string, onClose: () => void) => React.ReactNode;
  stats: (onAction: () => void) => React.ReactNode;
  clock: React.ReactNode;
}

const tabs = [
  { name: "今日", icon: Sun },
  { name: "县城", icon: MapPin },
  { name: "经营", icon: Sprout },
  { name: "人物", icon: Users },
  { name: "行囊", icon: Backpack },
];
const districts: Record<string, string[]> = {
  市井: ["小吃街", "西市集", "游乐街", "珍宝阁", "公告栏"],
  游赏: ["韭菜园", "柳园", "建筑阁"],
  游乐: ["游乐坊", "赛鸽场"],
  城外: ["外出探险", "填洞", "善行义举"],
};
const weatherNames = {
  sunny: "晴",
  cloudy: "阴",
  rain_light: "小雨",
  rain_heavy: "大雨",
  snow_light: "小雪",
  snow_heavy: "大雪",
};

function Drawer({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`mg-drawer${wide ? " mg-feature-drawer" : ""}`}
      aria-labelledby="mg-drawer-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header>
        <h2 id="mg-drawer-title">{title}</h2>
        <button onClick={onClose} title="关闭" aria-label="关闭">
          <X size={22} />
        </button>
      </header>
      <div className="mg-drawer-body">{children}</div>
    </dialog>
  );
}

export function ModernGame({
  onWork,
  onRest,
  onSkill,
  onMerchantPatrol,
  onEscort,
  onOpen,
  renderFeature,
  stats: rawStats,
  clock,
}: Props) {
  const state = useGameStore();
  const desktop = useDesktopGameLayout();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab") || "今日";
  const tab = tabs.some((item) => item.name === requestedTab)
    ? requestedTab
    : "今日";
  const feature = params.get("place") || "";
  const [district, setDistrict] = useState("市井");
  const [drawer, setDrawer] = useState("");
  const [inventoryTab, setInventoryTab] = useState("物品");
  const [npcSearch, setNpcSearch] = useState("");
  const [notice, setNotice] = useState("");
  const previousLog = useRef(state.logs[0]);
  const scrollPositions = useRef<Record<string, number>>({});
  const positionKey = `${tab}/${feature}`;
  useEffect(() => {
    if (state.currentEvent || state.raidAlert) setDrawer("");
    if ((state.currentEvent || state.raidAlert) && desktop && feature) setParams({ tab });
  }, [state.currentEvent, state.raidAlert, desktop, feature, tab, setParams]);
  useEffect(() => {
    if (desktop) return;
    window.scrollTo(0, scrollPositions.current[positionKey] || 0);
    return () => {
      scrollPositions.current[positionKey] = window.scrollY;
    };
  }, [positionKey, desktop]);
  useEffect(() => {
    if (state.logs[0] && state.logs[0] !== previousLog.current)
      setNotice(state.logs[0]);
    previousLog.current = state.logs[0];
  }, [state.logs]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const role = roles.find((item) => item.id === state.role);
  const task = tasks.find((item) => item.id === state.currentTaskId);
  const date = getDateInfo(state.day);
  const blocked = Boolean(state.currentEvent);
  const snow = state.weather === "snow_heavy";
  const setTab = (name: string) => {
    setDrawer("");
    setParams({ tab: name });
  };
  const visit = (name: string) => {
    if (blocked) return;
    if (name === "填洞") {
      state.fillCave();
      return;
    }
    setParams({ tab, place: name });
  };
  const closeFeature = () => setParams({ tab });
  const stats = rawStats(() => setDrawer(""));
  const links = (
    entries: {
      name: string;
      detail: string;
      onClick: () => void;
      disabled?: boolean;
      guide?: string;
    }[],
  ) => (
    <div className="mg-list" tabIndex={desktop ? 0 : undefined} aria-label="功能列表">
      {entries.map((entry) => (
        <button
          key={entry.name}
          onClick={entry.onClick}
          disabled={blocked || entry.disabled}
          data-guide-id={entry.guide}
        >
          <div>
            <strong>{entry.name}</strong>
            <small>{entry.detail}</small>
          </div>
          <ChevronRight size={18} />
        </button>
      ))}
    </div>
  );
  const healthMax = 100 + (state.talents.fitness || 0) * 10;
  const inventory = Object.entries(state.inventory).filter(
    ([, count]) => count > 0,
  );
  const bagItems = inventory
    .map(([id, count]) => ({
      item: items.find((item) => item.id === id),
      count,
    }))
    .filter((entry) => entry.item);

  return (
    <div className="mg-shell mg-game-shell">
      <aside className="mg-rail">
        <div className="mg-brand">
          无宁县志<span>暮山入城 · 县中有你</span>
        </div>
        <nav aria-label="游戏主导航">
          {tabs.map(({ name, icon: Icon }) => (
            <button
              key={name}
              aria-current={tab === name ? "page" : undefined}
              className={tab === name ? "active" : ""}
              onClick={() => setTab(name)}
            >
              <Icon size={20} />
              <span>{name}</span>
            </button>
          ))}
        </nav>
        <button className="mg-settings" onClick={() => onOpen("设置")}>
          <Settings size={18} />
          设置
        </button>
      </aside>
      <main className="mg-main">
        <header className="mg-topbar">
          <span className="mg-mobile-brand">无宁县志</span>
          <span className="mg-date">
            <Sun size={17} />第 {date.year} 年 · {date.season}{" "}
            {date.dayOfSeason} 日 · {weatherNames[state.weather]}
          </span>
          <div className="mg-tools">
            <button
              data-guide-id="guide-task-btn"
              onClick={() => setDrawer("任务")}
              title="任务记录"
              aria-label="任务记录"
            >
              <ScrollText size={20} />
            </button>
            <button
              onClick={() => setDrawer("记录")}
              title="事件记录"
              aria-label="事件记录"
            >
              <BookOpen size={20} />
            </button>
            <button
              onClick={() => onOpen("设置")}
              title="设置"
              aria-label="设置"
            >
              <Settings size={20} />
            </button>
          </div>
        </header>
        <div className="mg-resources">
          <button onClick={() => setDrawer("人物状态")}>
            {state.playerProfile.name || role?.name} · {role?.name}
          </button>
          <button onClick={() => setDrawer("人物状态")}>
            <Heart size={16} />
            {state.playerStats.health}
            <small>/ {healthMax}</small>
          </button>
          <span>
            <Coins size={16} />
            <b>{state.playerStats.money.toLocaleString()}</b> 文
          </span>
          <button onClick={() => setDrawer("人物状态")}>
            <Star size={16} />
            声望 {state.playerStats.reputation}
            <ChevronRight size={14} />
          </button>
        </div>
        <div className="mg-clock-row">
          <span>
            第 {state.day} 日 · {weatherNames[state.weather]}
          </span>
          {clock}
        </div>
        <div className="mg-workspace">
          <div className="mg-heading">
            {feature && !desktop && (
              <button
                title="返回"
                aria-label="返回上一级"
                onClick={closeFeature}
              >
                <ArrowLeft size={22} />
              </button>
            )}
            <h1>{(!desktop && feature) || (tab === "今日" ? "无宁的一天" : tab)}</h1>
            <span>
              {feature && !desktop
                ? ""
                : tab === "今日"
                  ? `${date.season}日县中，诸事待兴`
                  : tab === "县城"
                    ? "街巷之间，自有故事"
                    : ""}
            </span>
          </div>
          <GameContentArea contentKey={`${positionKey}/${district}/${inventoryTab}/${npcSearch}`}>
          {blocked && (
            <div className="mg-alert">
              <ScrollText size={18} />
              当前事件待处理，完成抉择后继续行动。
            </div>
          )}
          {feature && !desktop ? (
            <div className="mg-feature">
              {renderFeature(feature, closeFeature)}
            </div>
          ) : (
            <>
              {tab === "今日" && (
                <div className="mg-today">
                  {task ? (
                    <section className="mg-story">
                      <div className="mg-section-title">
                        <span className="mg-eyebrow">{role?.name}主线</span>
                        <button onClick={() => setDrawer("任务")}>
                          全部任务
                          <ChevronRight size={16} />
                        </button>
                      </div>
                      <h2>{task.title}</h2>
                      <p>{task.description}</p>
                      <div className="mg-goal">{task.goalDescription}</div>
                      {task.specialAction && (
                        <button
                          className="mg-primary"
                          disabled={blocked}
                          onClick={state.handleTaskAction}
                        >
                          {task.specialAction.label}
                          <small>{task.specialAction.costText}</small>
                          <ChevronRight size={16} />
                        </button>
                      )}
                    </section>
                  ) : (
                    <section className="mg-story">
                      <h2>在无宁，继续你的故事</h2>
                      <p>完成日常行动，经营产业，或结识县中故人。</p>
                    </section>
                  )}
                  <div className="mg-today-actions" tabIndex={desktop ? 0 : undefined} aria-label="今日行动">
                  <div className="mg-section-title">
                    <h2>今日行动</h2>
                    <button onClick={() => setDrawer("县城治理")}>
                      县城治理
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="mg-action-list">
                    <button
                      disabled={
                        blocked ||
                        snow ||
                        state.dailyCounts.work >= 3 ||
                        state.playerStats.health < 10
                      }
                      onClick={onWork}
                    >
                      <Briefcase size={23} />
                      <div>
                        <strong>日常工作</strong>
                        <small>
                          {snow
                            ? "大雪停工"
                            : state.playerStats.health < 10
                              ? "体力不足，需要 10 体力"
                              : `剩余 ${Math.max(0, 3 - state.dailyCounts.work)} 次 · 消耗 10 体力`}
                        </small>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      disabled={blocked || state.dailyCounts.rest >= 1}
                      onClick={onRest}
                    >
                      <Heart size={23} />
                      <div>
                        <strong>休息整顿</strong>
                        <small>
                          {state.dailyCounts.rest >= 1
                            ? "今日已休息"
                            : `剩余 1 次 · 恢复 ${state.role === "hero" ? 30 : 20} 体力`}
                        </small>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      disabled={
                        blocked ||
                        (Boolean(state.flags.defense_maintained_daily) &&
                          state.dailyCounts.extraDefenseCount >= 2)
                      }
                      onClick={state.maintainCountyDefense}
                    >
                      <Shield size={23} />
                      <div>
                        <strong>巡防维护</strong>
                        <small>
                          {state.flags.defense_maintained_daily
                            ? `剩余 ${Math.max(0, 2 - state.dailyCounts.extraDefenseCount)} 次追加巡防`
                            : "今日首次巡防可用"}
                        </small>
                      </div>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="mg-role-action">
                    <button
                      className="mg-outline"
                      disabled={blocked}
                      onClick={onSkill}
                    >
                      <Star size={18} />
                      {role?.specialAbility.name}
                      <small>{role?.specialAbility.costText}</small>
                    </button>
                    <p>{role?.specialAbility.description}</p>
                    {state.role === "merchant" && (
                      <button
                        className="mg-outline"
                        disabled={
                          blocked ||
                          state.playerStats.money < 80 ||
                          state.playerStats.health < 10
                        }
                        onClick={onMerchantPatrol}
                      >
                        <Shield size={18} />
                        商会巡防 · 80 文 / 10 体力
                      </button>
                    )}
                    {state.role === "hero" && (
                      <button
                        className="mg-outline"
                        disabled={blocked || state.playerStats.health < 20}
                        onClick={onEscort}
                      >
                        <Shield size={18} />
                        护送商队 · 20 体力
                      </button>
                    )}
                  </div>
                  <div className="mg-section-title">
                    <h2>出门走走</h2>
                    <button onClick={() => setTab("县城")}>
                      全城地点
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="mg-outings">
                    {[
                      { name: "小吃街", icon: Utensils },
                      { name: "西市集", icon: ShoppingBag },
                      { name: "外出探险", icon: Compass },
                    ].map(({ name, icon: Icon }) => (
                      <button
                        key={name}
                        data-guide-id={
                          name === "西市集"
                            ? "guide-market-btn"
                            : name === "外出探险"
                              ? "guide-explore-btn"
                              : undefined
                        }
                        disabled={
                          blocked ||
                          (name === "外出探险" &&
                            (snow || (state.dailyCounts.explore || 0) >= 2))
                        }
                        onClick={() => visit(name)}
                      >
                        <Icon size={22} />
                        {name}
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                  </div>
                  <div className="mg-today-effects"><DebuffPanel /></div>
                  <div className="mg-day-end">
                    <button onClick={() => setDrawer("记录")}>
                      县中记事 · {state.logs.length} 条
                      <ChevronRight size={16} />
                    </button>
                    <button
                      className="mg-primary"
                      disabled={blocked}
                      onClick={() => setDrawer("日终小结")}
                    >
                      <Moon size={18} />
                      结束这一天
                    </button>
                  </div>
                </div>
              )}
              {tab === "县城" && (
                <>
                  <div className="mg-tabs" role="group" aria-label="县城区域">
                    {Object.keys(districts).map((name) => (
                      <button
                        key={name}
                        aria-pressed={district === name}
                        className={district === name ? "selected" : ""}
                        onClick={() => setDistrict(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  {links(
                    districts[district].map((name) => ({
                      name,
                      detail:
                        name === "外出探险"
                          ? snow
                            ? "大雪封路"
                            : `今日剩余 ${Math.max(0, 2 - (state.dailyCounts.explore || 0))} 次`
                          : name === "填洞"
                            ? state.dailyCounts.caveFilled
                              ? "今日已完成"
                              : "消耗 100 文"
                            : `${district} · 无宁县`,
                      onClick: () => visit(name),
                      disabled:
                        name === "外出探险"
                          ? snow || (state.dailyCounts.explore || 0) >= 2
                          : name === "填洞"
                            ? state.dailyCounts.caveFilled
                            : false,
                    })),
                  )}
                </>
              )}
              {tab === "经营" && (
                <>
                  <div className="mg-metrics">
                    <div>
                      <small>持有产业</small>
                      <b>
                        {Object.values(state.ownedFacilities).reduce(
                          (sum, count) => sum + count,
                          0,
                        )}
                        <em> 处</em>
                      </b>
                    </div>
                    <div>
                      <small>可收获地块</small>
                      <b>
                        {
                          (state.leekPlots || []).filter((plot) => plot.ready)
                            .length
                        }
                        <em> 块</em>
                      </b>
                    </div>
                    <div>
                      <small>县城经济</small>
                      <b>
                        {state.countyStats.economy}
                        <em> /100</em>
                      </b>
                    </div>
                  </div>
                  <div className="mg-section-title">
                    <h2>经营事务</h2>
                  </div>
                  {links([
                    {
                      name: "产业置办",
                      detail: "产业购置、资源设施与升级",
                      onClick: () => visit("产业置办"),
                    },
                    {
                      name: "韭菜园",
                      detail: "地块、加工、设施与合作社订单",
                      onClick: () => visit("韭菜园"),
                    },
                    {
                      name: "西市集",
                      detail: "商品库存与买卖",
                      onClick: () => visit("西市集"),
                    },
                  ])}
                  <div className="mg-section-title">
                    <h2>我的产业</h2>
                  </div>
                  {Object.keys(state.ownedFacilities).some(
                    (id) => state.ownedFacilities[id] > 0,
                  ) ? (
                    links(
                      facilities
                        .filter(
                          (item) => (state.ownedFacilities[item.id] || 0) > 0,
                        )
                        .map((item) => ({
                          name: item.name,
                          detail: `持有 ${state.ownedFacilities[item.id]} 处 · ${item.incomeDescription || item.description}`,
                          onClick: () => visit("产业置办"),
                        })),
                    )
                  ) : (
                    <p className="mg-empty">
                      还没有产业。可以从市场贸易或园地经营开始。
                    </p>
                  )}
                </>
              )}
              {tab === "人物" && (
                <>
                  <div className="mg-section-title">
                    <h2>我的养成</h2>
                  </div>
                  <div className="mg-outings">
                    <button onClick={() => onOpen("天赋")}>
                      <Star size={20} />
                      天赋
                    </button>
                    <button onClick={() => onOpen("成就")}>
                      <Trophy size={20} />
                      成就
                    </button>
                    <button onClick={() => visit("财富榜")}>
                      <Coins size={20} />
                      财富榜
                    </button>
                  </div>
                  <div className="mg-section-title">
                    <h2>县中故人</h2>
                    <button
                      disabled={blocked || snow}
                      onClick={() => visit("拜访 NPC")}
                    >
                      拜访与互动
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <input
                    className="mg-search"
                    type="search"
                    aria-label="搜索人物"
                    placeholder="搜索人物姓名"
                    value={npcSearch}
                    onChange={(event) => setNpcSearch(event.target.value)}
                  />
                  {snow && <p className="mg-empty">大雪封路，今日无法拜访。</p>}
                  {links(
                    npcs
                      .filter((npc) => npc.name.includes(npcSearch))
                      .map((npc) => ({
                        name: npc.name,
                        detail: `${npc.title} · 好感 ${state.npcRelations[npc.id] || 0}`,
                        disabled: snow,
                        onClick: () => navigate(`/npcs/${npc.id}`),
                      })),
                  )}
                </>
              )}
              {tab === "行囊" && (
                <>
                  <div className="mg-tabs" role="group" aria-label="行囊分类">
                    {["物品", "衣装", "收藏"].map((name) => (
                      <button
                        key={name}
                        aria-pressed={inventoryTab === name}
                        className={inventoryTab === name ? "selected" : ""}
                        onClick={() => setInventoryTab(name)}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  {inventoryTab === "物品" ? (
                    <>
                      <div className="mg-bag-intro">
                        <CachedImage
                          src="/images/bamboo_basket.webp"
                          alt="竹编行囊"
                          className="w-20 h-20 object-contain"
                          placeholder={<Package size={40} />}
                        />
                        <div>
                          <h2>随身行囊</h2>
                          <p>
                            {inventory.reduce(
                              (sum, [, count]) => sum + count,
                              0,
                            )}{" "}
                            件物品，伴你走过无宁。
                          </p>
                        </div>
                      </div>
                      <div className="mg-inventory" tabIndex={desktop ? 0 : undefined} aria-label="随身物品">
                        {bagItems.map(
                          ({ item, count }) =>
                            item && (
                              <article key={item.id}>
                                <CachedImage
                                  src={`/images/${item.id}.webp`}
                                  alt={item.name}
                                  className="w-14 h-14 object-contain"
                                  placeholder={<Package size={28} />}
                                />
                                <div>
                                  <h3>
                                    {item.name} <small>× {count}</small>
                                  </h3>
                                  <p>{item.description}</p>
                                </div>
                                {item.type === "consumable" && (
                                  <button
                                    className="mg-outline"
                                    disabled={blocked}
                                    onClick={() => state.useItem(item.id)}
                                  >
                                    使用
                                  </button>
                                )}
                              </article>
                            ),
                        )}
                      </div>
                      {!bagItems.length && (
                        <p className="mg-empty">
                          行囊尚空，去街上带些滋味回来。
                        </p>
                      )}
                    </>
                  ) : inventoryTab === "衣装" ? (
                    links([
                      {
                        name: "衣装与饰品",
                        detail: "衣装更换、发型与饰品搭配",
                        onClick: () => visit("游乐街"),
                      },
                    ])
                  ) : (
                    links([
                      {
                        name: "藏珍匣",
                        detail: "已收集卷轴与藏品",
                        onClick: () => visit("藏珍匣"),
                      },
                    ])
                  )}
                </>
              )}
            </>
          )}
          </GameContentArea>
        </div>
      </main>
      {feature && desktop && (
        <Drawer title={feature} onClose={closeFeature} wide>
          {notice && <div className="mg-feature-notice" role="status">{notice}</div>}
          <div className="mg-feature">{renderFeature(feature, closeFeature)}</div>
        </Drawer>
      )}
      {notice && !(feature && desktop) && (
        <div className="mg-toast" role="status">
          <span>{notice}</span>
          <button aria-label="关闭提示" onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {drawer && (
        <Drawer title={drawer} onClose={() => setDrawer("")}>
          {drawer === "记录" ? (
            <LogPanel logs={state.logs} />
          ) : drawer === "人物状态" ? (
            stats
          ) : drawer === "任务" ? (
            <>
              {task && (
                <section className="mg-story">
                  <h2>{task.title}</h2>
                  <p>{task.description}</p>
                  <div className="mg-goal">{task.goalDescription}</div>
                  <p>{task.rewardText}</p>
                  <button
                    className="mg-primary"
                    onClick={() => {
                      setTab("今日");
                      setDrawer("");
                    }}
                  >
                    前往办理
                    <ChevronRight size={16} />
                  </button>
                </section>
              )}
              {links([
                {
                  name: "任务记录",
                  detail: "当前主线、已完成任务与奖励",
                  onClick: () => {
                    setDrawer("");
                    visit("任务记录");
                  },
                },
              ])}
            </>
          ) : drawer === "日终小结" ? (
            <>
              <p>第 {state.day} 日 · 当前状态</p>
              <div className="mg-metrics">
                <div>
                  <small>今日工作</small>
                  <b>
                    {state.dailyCounts.work}
                    <em> 次</em>
                  </b>
                </div>
                <div>
                  <small>当前体力</small>
                  <b>{state.playerStats.health}</b>
                </div>
                <div>
                  <small>银两</small>
                  <b>{state.playerStats.money}</b>
                </div>
              </div>
              <p>进入下一日时，结算产业收益、园地成长、天气与事件。</p>
              <button
                className="mg-primary"
                disabled={blocked}
                onClick={() => {
                  setDrawer("");
                  state.nextDay();
                }}
              >
                进入下一日
                <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <>
              {stats}
              {links([
                {
                  name: "县衙办公室",
                  detail: "官邸、公务、发展路线与边防",
                  guide: "guide-office-btn",
                  onClick: () => {
                    setDrawer("");
                    visit("县衙办公室");
                  },
                },
                ...(state.role === "magistrate"
                  ? [
                      {
                        name: "施政方针",
                        detail: "颁布或调整当前政令",
                        onClick: () => {
                          setDrawer("");
                          onOpen("政令");
                        },
                      },
                    ]
                  : []),
              ])}
            </>
          )}
        </Drawer>
      )}
    </div>
  );
}
