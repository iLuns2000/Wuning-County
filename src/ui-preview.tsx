import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sun, MapPin, Sprout, Users, Backpack, ChevronRight, ArrowLeft, X, Settings, BookOpen, Coins, Heart, Moon, Briefcase, Shield, Utensils, ShoppingBag, Check, ScrollText, Landmark, Trophy, Compass, Star } from 'lucide-react';
import { snacks } from './data/snacks';
import { npcs } from './data/npcs';
import './ui-preview.css';

const navigation = [{ name: '今日', icon: Sun }, { name: '县城', icon: MapPin }, { name: '经营', icon: Sprout }, { name: '人物', icon: Users }, { name: '行囊', icon: Backpack }];
const districts: Record<string, string[]> = {
  '市井': ['小吃街', '西市集', '游乐街', '珍宝阁', '公告栏'],
  '游赏': ['韭菜园', '柳园', '灵茸园', '小言酒馆', '曦梦楼', '星月酒楼', '云吞吞小铺'],
  '游乐': ['游乐坊', '赛鸽场', '无宁箭馆', '长生丹房', '九宫馆', '小司赌坊', '算命小摊'],
  '城外': ['外出探险', '填洞', '善行义举'],
};

function Preview() {
  const [view, setView] = useState('今日');
  const [place, setPlace] = useState('');
  const [district, setDistrict] = useState('市井');
  const [panel, setPanel] = useState('');
  const [day, setDay] = useState(1);
  const [money, setMoney] = useState(100);
  const [health, setHealth] = useState(100);
  const [work, setWork] = useState(0);
  const [rested, setRested] = useState(false);
  const [defended, setDefended] = useState(false);
  const [logs, setLogs] = useState(['初入无宁，今日起担任县丞。']);
  const [notice, setNotice] = useState('');
  const [bag, setBag] = useState<string[]>([]);
  const [selectedNpc, setSelectedNpc] = useState('');
  const record = (message: string) => { setLogs(previous => [message, ...previous]); setNotice(message); };
  const changeView = (name: string) => { setView(name); setPlace(''); setSelectedNpc(''); setNotice(''); };
  const price = (snack: typeof snacks[number]) => 10 + Math.abs(snack.effect?.health || 0) * 2 + (snack.effect?.culture || 0) * 5 + (snack.effect?.ability || 0) * 10 + Math.abs(snack.effect?.reputation || 0) * 5;
  const eat = (snack: typeof snacks[number], takeout: boolean) => {
    setMoney(value => value - price(snack));
    if (takeout) setBag(value => [...value, snack.name]);
    else setHealth(value => Math.min(100, value + (snack.effect?.health || 0)));
    record(takeout ? `${snack.name}已放入行囊` : `品尝${snack.name}，体力 +${snack.effect?.health || 0}`);
  };
  const sectionTitle = place || selectedNpc || view;
  return <div className="preview-app">
    <aside className="rail"><div className="brand">无宁县志<span>暮山入城 · 县中有你</span></div><nav>{navigation.map(({ name, icon: Icon }) => <button key={name} className={view === name ? 'active' : ''} onClick={() => changeView(name)}><Icon size={20}/><span>{name}</span></button>)}</nav><button className="rail-settings" onClick={() => setPanel('设置')}><Settings size={18}/>设置</button></aside>
    <main>
      <header className="topbar"><span className="mobile-brand">无宁县志</span><span className="date"><Sun size={17}/>第 {day} 日 · 春 · 晴</span><div className="top-tools"><button onClick={() => setPanel('任务')} title="任务"><ScrollText size={20}/></button><button onClick={() => setPanel('记录')} title="事件记录"><BookOpen size={20}/></button><button onClick={() => setPanel('设置')} title="设置"><Settings size={20}/></button></div></header>
      <div className="resource-strip"><span>县丞 · 无名客</span><button onClick={() => setPanel('人物状态')}><Heart size={16}/>{health}<small>/100</small></button><span><Coins size={16}/><b>{money}</b> 文</span><button onClick={() => setPanel('人物状态')}><Star size={16}/>声望 200<ChevronRight size={14}/></button></div>
      <div className="workspace">
        <div className="page-heading">{(place || selectedNpc) && <button title="返回" onClick={() => { setPlace(''); setSelectedNpc(''); }}><ArrowLeft size={22}/></button>}<h1>{view === '今日' ? '无宁的一天' : sectionTitle}</h1><span>{view === '今日' ? '春日初始，诸事待兴' : view === '县城' ? '街巷之间，自有故事' : ''}</span></div>
        {view === '今日' && <>
          <section className="story-band"><div className="story-title"><span className="eyebrow">县丞主线 · 第一章</span><button onClick={() => setPanel('任务')}>全部任务<ChevronRight size={16}/></button></div><h2>整治乱象</h2><p>新官上任，县城治安混乱。先整顿吏治，恢复秩序。</p><div className="goal"><span>治安 50 / 60</span><div className="progress"><i/></div></div><button className="primary" disabled={health < 20} onClick={() => { setHealth(value => value - 20); record('整顿吏治：体力 -20，治安提升'); }}>严厉执法 <span>消耗 20 体力</span><ChevronRight size={17}/></button></section>
          <section className="daily"><div className="section-line"><h2>今日行动</h2><button onClick={() => setPanel('县城治理')}>县城治理<ChevronRight size={16}/></button></div><div className="action-list">
            <button disabled={work >= 3 || health < 10} onClick={() => { setWork(value => value + 1); setHealth(value => value - 10); setMoney(value => value + 20); record('日常工作：银两 +20，体力 -10'); }}><Briefcase/><div><strong>日常工作</strong><small>剩余 {3 - work} 次 · 获取银两</small></div><ChevronRight/></button>
            <button disabled={rested} onClick={() => { setRested(true); setHealth(value => Math.min(100, value + 30)); record('休息整顿：体力 +30'); }}><Heart/><div><strong>休息整顿</strong><small>{rested ? '今日已休息' : '剩余 1 次 · 恢复体力'}</small></div><ChevronRight/></button>
            <button disabled={defended} onClick={() => { setDefended(true); record('巡防完成，县城边防更加稳固'); }}><Shield/><div><strong>巡防维护</strong><small>{defended ? '今日已巡防' : '今日免费巡防可用'}</small></div><ChevronRight/></button>
          </div></section>
          <section className="outings"><div className="section-line"><h2>出门走走</h2><button onClick={() => changeView('县城')}>全城地点<ChevronRight size={16}/></button></div><div className="outing-links">{['小吃街','韭菜园','外出探险'].map((name, index) => <button key={name} onClick={() => { changeView('县城'); setPlace(name); }}>{React.createElement([Utensils,Sprout,Compass][index], { size: 22 })}<strong>{name}</strong><ChevronRight size={16}/></button>)}</div></section>
          <div className="day-end"><span>今日记事 <b>{logs.length}</b><button onClick={() => setPanel('记录')}>展开记录</button></span><button className="primary" onClick={() => setPanel('结束这一天')}><Moon size={18}/>结束这一天</button></div>
        </>}
        {view === '县城' && !place && <><div className="tabs">{Object.keys(districts).map(name => <button className={district === name ? 'selected' : ''} onClick={() => setDistrict(name)} key={name}>{name}</button>)}</div><div className="place-list">{districts[district].map((name,index) => <button key={name} onClick={() => setPlace(name)}><span className="place-index">{String(index+1).padStart(2,'0')}</span><div><strong>{name}</strong><small>{district} · 无宁县</small></div><ChevronRight size={20}/></button>)}</div></>}
        {view === '县城' && place === '小吃街' && <><div className="section-line"><p>一碗热汤，一段市井人情。</p><span>{snacks.length} 味</span></div><div className="food-list">{snacks.map(snack => <article key={snack.id}><div className="food-heading"><h2>{snack.name}</h2><span>{price(snack)} 文</span></div><p>{snack.description}</p><small className="green">体力 +{snack.effect?.health || 0}{snack.effect?.culture ? ` · 文化 +${snack.effect.culture}` : ''}</small><div className="food-actions"><button className="primary" disabled={money < price(snack)} onClick={() => eat(snack,false)}><Utensils size={16}/>品尝</button><button className="outline" disabled={money < price(snack)} onClick={() => eat(snack,true)}><ShoppingBag size={16}/>打包</button></div></article>)}</div></>}
        {view === '县城' && place && place !== '小吃街' && <section className="detail"><Landmark size={36}/><h2>{place}</h2><p>进入地点后，在这里查看状态和可执行行动。</p><button className="outline" onClick={() => setPanel(place)}>查看地点详情<ChevronRight size={16}/></button></section>}
        {view === '经营' && <><div className="metrics"><div><small>产业日收入</small><b>0 <em>文</em></b></div><div><small>持有产业</small><b>0 <em>处</em></b></div><div><small>县城经济</small><b>50 <em>/100</em></b></div></div><section><div className="section-line"><h2>经营事务</h2></div><div className="place-list">{['产业置办','韭菜园 · 地块与订单','市场贸易 · 西市集','资源设施 · 采石场 / 林场'].map(name => <button key={name} onClick={() => setPanel(name)}><Sprout size={22}/><div><strong>{name}</strong><small>资产与收益集中管理</small></div><ChevronRight size={20}/></button>)}</div></section></>}
        {view === '人物' && !selectedNpc && <><div className="tabs"><button className="selected">县中故人</button><button onClick={() => setPanel('人物养成')}>我的养成</button></div><div className="place-list">{npcs.slice(0,10).map(npc => <button key={npc.id} onClick={() => setSelectedNpc(npc.name)}><Users size={22}/><div><strong>{npc.name}</strong><small>{npc.title} · 初识</small></div><ChevronRight size={20}/></button>)}</div></>}
        {view === '人物' && selectedNpc && <section className="detail"><Users size={40}/><h2>{selectedNpc}</h2><p>{npcs.find(npc => npc.name === selectedNpc)?.description}</p><div className="food-actions">{['闲聊','送礼','专属互动'].map(name => <button key={name} className="outline" onClick={() => setPanel(`${selectedNpc} · ${name}`)}>{name}</button>)}</div></section>}
        {view === '行囊' && <><div className="tabs"><button className="selected">物品</button><button onClick={() => setPanel('衣装与饰品')}>衣装</button><button onClick={() => setPanel('藏珍匣')}>收藏</button></div><div className="bag-banner"><img src="/images/bamboo_basket.webp" alt="竹编行囊"/><div><h2>随身行囊</h2><p>{bag.length ? `装着 ${bag.length} 份小吃` : '行囊尚空，去街上带些滋味回来。'}</p></div></div><div className="place-list">{bag.map((name,index) => <button key={index} onClick={() => { setBag(previous => previous.filter((_,i) => i !== index)); const snack = snacks.find(item => item.name === name); setHealth(value => Math.min(100,value + (snack?.effect?.health || 0))); record(`使用了${name}`); }}><ShoppingBag size={22}/><div><strong>{name}</strong><small>消耗品</small></div><span>使用</span></button>)}</div></>}
      </div>
    </main>
    {notice && <div className="toast" role="status"><Check size={17}/>{notice}<button title="关闭提示" onClick={() => setNotice('')}><X size={16}/></button></div>}
    {panel && <div className="sheet-backdrop" onClick={() => setPanel('')}><section className="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={event => event.stopPropagation()}><header><h2 id="sheet-title">{panel}</h2><button title="关闭" onClick={() => setPanel('')}><X size={22}/></button></header><div className="sheet-body">
      {panel === '结束这一天' ? <><p>第 {day} 日 · 今日小结</p><div className="metrics"><div><small>工作</small><b>{work}<em> 次</em></b></div><div><small>体力</small><b>{health}</b></div></div><p>产业收益、成长与事件将在进入下一日时结算。</p><button className="primary" onClick={() => { setDay(value => value + 1); setWork(0); setRested(false); setDefended(false); setPanel(''); record('新的一天开始了'); }}>进入下一日<ChevronRight size={18}/></button></> : panel === '记录' ? <ol className="journal">{logs.map((log,index) => <li key={index}>{log}</li>)}</ol> : panel === '设置' ? <div className="place-list">{['游戏界面 · 暮山紫新版','外观 · 跟随系统','音效与震动','本地与云端存档','游戏说明 / 问题反馈'].map(name => <button key={name} onClick={() => setNotice('设计预览：设置不会写入正式游戏')}><span>{name}</span><ChevronRight size={18}/></button>)}</div> : panel === '任务' ? <><span className="eyebrow">当前主线</span><h3>整治乱象</h3><p>目标：治安达到 60。</p><button className="primary" onClick={() => { changeView('今日'); setPanel(''); }}>前往办理<ChevronRight size={18}/></button></> : panel === '县城治理' ? <div className="place-list">{['民生 / 治安 / 经济 / 文化','施政方针','官邸升级','发展路线','边防 / 匪患 / 战火'].map(name => <button key={name} onClick={() => setPanel(name)}><Shield size={18}/>{name}<ChevronRight size={16}/></button>)}</div> : <><p>这里预留独立的详情与操作区，完成后返回原来的位置。</p><button className="outline" onClick={() => setPanel('')}>返回</button></>}
    </div></section></div>}
  </div>;
}
createRoot(document.getElementById('root')!).render(<Preview/>);
