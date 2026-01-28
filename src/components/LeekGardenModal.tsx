import React from 'react';
import { X, Leaf, Droplets, FlaskConical, Scissors, Coins, Hammer, Utensils, ClipboardList, Lightbulb, HelpCircle, Snowflake } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { LeekGardenHelpModal } from './LeekGardenHelpModal';

interface LeekGardenModalProps {
  onClose: () => void;
}

const VARIETIES = [
  { id: 'regular', name: '常规韭菜', growthTicks: 3, baseYield: 3, baseQuality: 60 },
  { id: 'fast', name: '快熟韭菜', growthTicks: 2, baseYield: 2, baseQuality: 55 },
  { id: 'fragrant', name: '高香韭菜', growthTicks: 2, baseYield: 5, baseQuality: 75, toughness: 55 },
  { id: 'cold_resistant', name: '耐寒韭菜', growthTicks: 2, baseYield: 6, baseQuality: 60, toughness: 80 },
];

const FACILITIES = [
  { id: 'drip_irrigation', name: '滴灌系统', cost: 200, desc: '自动浇水，稳定提升品质', icon: Droplets },
  { id: 'pest_lamp', name: '杀虫灯', cost: 300, desc: '大幅降低虫害发生率', icon: Lightbulb },
  { id: 'mower', name: '自动收割机', cost: 300, desc: '成熟即自动收割入库', icon: Scissors },
  { id: 'cold_storage', name: '冷库', cost: 800, desc: '显著降低库存腐损率', icon: Snowflake },
  { id: 'breeding_shed', name: '育种棚', cost: 1000, desc: '提升每日品质增幅', icon: FlaskConical },
  { id: 'processing_table', name: '精加工台', cost: 600, desc: '降低成品腐损，提高效率', icon: Utensils },
];

export const LeekGardenModal: React.FC<LeekGardenModalProps> = ({ onClose }) => {
  const vibrate = useGameVibrate();
  const { 
    leekPlots, ownedGoods, playerStats, leekFacilities, leekOrders,
    plantLeek, waterLeek, fertilizeLeek, harvestLeek, sellGood, 
    buyLeekFacility, processLeek, submitLeekOrder
  } = useGameStore();

  const owned = ownedGoods['leek'] || 0;
  const ownedBox = ownedGoods['leek_box'] || 0;

  const [activeTab, setActiveTab] = React.useState<'plots' | 'process' | 'orders'>('plots');
  const [showHelp, setShowHelp] = React.useState(false);

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black/50">
      {showHelp && <LeekGardenHelpModal onClose={() => setShowHelp(false)} />}
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex justify-between items-center p-4 bg-emerald-50 border-b shrink-0">
          <h2 className="flex gap-2 items-center text-xl font-bold text-emerald-900">
            <Leaf className="w-5 h-5" />
            韭菜园
          </h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowHelp(true)} 
              className="p-1 text-emerald-800 rounded-full transition-colors hover:bg-emerald-100"
              title="玩法说明"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-1 rounded-full transition-colors hover:bg-emerald-100">
              <X className="w-5 h-5 text-emerald-900" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 bg-emerald-50 border-b shrink-0">
          <div className="flex gap-4">
             <div className="flex gap-2 items-center text-emerald-800">
                <Coins className="w-4 h-4" />
                <span className="font-bold">资金: {playerStats.money}</span>
             </div>
             <div className="text-sm text-emerald-700">鲜韭: {owned} | 盒子: {ownedBox}</div>
          </div>
          <div className="flex gap-2 text-sm">
             <button 
               onClick={() => setActiveTab('plots')}
               className={`px-3 py-1 rounded-full ${activeTab === 'plots' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800'}`}
             >
                地块
             </button>
             <button 
               onClick={() => setActiveTab('process')}
               className={`px-3 py-1 rounded-full ${activeTab === 'process' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800'}`}
             >
                加工
             </button>
             <button 
               onClick={() => setActiveTab('orders')}
               className={`px-3 py-1 rounded-full ${activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800'}`}
             >
                订单
             </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-6 bg-stone-50">
          {activeTab === 'plots' && (
            <>
               {/* Facilities Shop */}
               <div className="p-4 bg-white rounded-lg border border-emerald-100">
                  <h3 className="flex gap-2 items-center mb-2 font-bold text-emerald-900">
                    <Hammer className="w-4 h-4" /> 设施升级
                  </h3>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {FACILITIES.map(f => {
                       const isOwned = leekFacilities?.[f.id];
                       const Icon = f.icon;
                       return (
                         <div key={f.id} className="flex justify-between items-center p-3 rounded border bg-stone-50 border-stone-200">
                            <div className="flex gap-3 items-center">
                               <div className={`p-2 rounded-full ${isOwned ? 'text-emerald-600 bg-emerald-100' : 'bg-stone-200 text-stone-500'}`}>
                                  <Icon className="w-5 h-5" />
                               </div>
                               <div>
                                  <div className="text-sm font-bold">{f.name}</div>
                                  <div className="text-xs text-stone-500">{f.desc}</div>
                               </div>
                            </div>
                            {isOwned ? (
                                <span className="px-2 py-1 text-xs font-bold text-emerald-600 bg-emerald-50 rounded">已拥有</span>
                            ) : (
                                <button
                                   onClick={() => { vibrate(VIBRATION_PATTERNS.MEDIUM); buyLeekFacility(f.id, f.cost); }}
                                   className="px-3 py-1 text-xs text-white bg-emerald-600 rounded hover:bg-emerald-700 disabled:opacity-50"
                                   disabled={playerStats.money < f.cost}
                                >
                                   购买 ({f.cost})
                                </button>
                            )}
                         </div>
                       );
                    })}
                  </div>
               </div>

               {/* Plots */}
               <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {(leekPlots || []).map(plot => {
                  const ready = plot.ready;
                  const planted = !!plot.varietyId;
                  const quality = plot.quality || 0;
                  const pest = plot.pest || 0;
                  const gp = plot.growthProgress || 0;
                  const gt = plot.growthTarget || 3;
                  const fertility = plot.fertility || 0;
                  
                  return (
                    <div key={plot.id} className="overflow-hidden relative p-4 bg-white rounded-lg border border-emerald-200 shadow-sm">
                      {/* Fertility Bar Background */}
                      <div className="absolute right-0 bottom-0 left-0 h-1 bg-stone-200">
                         <div 
                           className={`h-full ${fertility < 30 ? 'bg-red-400' : 'bg-amber-400'}`} 
                           style={{ width: `${fertility}%` }} 
                         />
                      </div>

                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-stone-800">地块 {plot.id}</h3>
                          <p className="text-sm text-stone-500">{planted ? '生长中' : '空置'}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-stone-400">肥力 {fertility}</div>
                          <div className="text-xs text-stone-400">虫害 {pest}</div>
                          {planted && <div className="text-xs font-bold text-emerald-600">品质 {quality}</div>}
                        </div>
                      </div>

                      {!planted && (
                        <div className="flex flex-col gap-2">
                          <div className="mb-1 text-xs text-stone-400">选择品种种植:</div>
                          <div className="flex gap-2">
                              {VARIETIES.map(v => (
                                <button
                                  key={v.id}
                                  onClick={() => { vibrate(VIBRATION_PATTERNS.LIGHT); plantLeek(plot.id, v); }}
                                  disabled={fertility <= 0}
                                  className="flex-1 px-2 py-2 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  {v.name}
                                </button>
                              ))}
                          </div>
                          {fertility < 100 && (
                             <div className="mt-1 text-xs text-center text-amber-600">休耕中... (每日恢复)</div>
                          )}
                        </div>
                      )}

                      {planted && (
                        <>
                           <div className="mt-1 mb-3 w-full h-2 rounded-full bg-stone-100">
                              <div className="h-2 bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (gp/gt)*100)}%` }}></div>
                           </div>
                           
                           {!ready ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => { vibrate(VIBRATION_PATTERNS.LIGHT); waterLeek(plot.id); }}
                                    className="flex flex-1 gap-1 justify-center items-center px-2 py-2 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                                  >
                                    <Droplets className="w-3 h-3" /> 浇水
                                  </button>
                                  <button
                                    onClick={() => { vibrate(VIBRATION_PATTERNS.LIGHT); fertilizeLeek(plot.id); }}
                                    className="flex flex-1 gap-1 justify-center items-center px-2 py-2 text-xs font-medium text-amber-600 bg-amber-50 rounded hover:bg-amber-100"
                                  >
                                    <FlaskConical className="w-3 h-3" /> 施肥
                                  </button>
                                </div>
                           ) : (
                                <button
                                  onClick={() => { vibrate(VIBRATION_PATTERNS.MEDIUM); harvestLeek(plot.id); }}
                                  className="flex gap-1 justify-center items-center px-3 py-2 w-full text-sm font-bold text-white bg-emerald-600 rounded animate-pulse hover:bg-emerald-700"
                                >
                                  <Scissors className="w-4 h-4" /> 收割
                                </button>
                           )}
                        </>
                      )}
                    </div>
                  );
                })}
               </div>
            </>
          )}

          {activeTab === 'process' && (
             <div className="p-6 text-center bg-white rounded-lg border border-emerald-100">
                 <Utensils className="mx-auto mb-4 w-12 h-12 text-emerald-200" />
                 <h3 className="mb-2 text-xl font-bold text-emerald-900">韭菜加工坊</h3>
                 <p className="mb-6 text-stone-500">将新鲜韭菜加工成美味的韭菜盒子，提升售价。</p>
                 
                 <div className="flex gap-4 justify-center items-center mb-6">
                    <div className="p-4 rounded border bg-stone-50 border-stone-200">
                        <div className="font-bold text-stone-700">原料</div>
                        <div className="text-sm text-stone-500">鲜韭 x 2</div>
                        <div className="text-sm text-stone-500">成本 2 文</div>
                    </div>
                    <div className="text-stone-300">➜</div>
                    <div className="p-4 bg-emerald-50 rounded border border-emerald-200">
                        <div className="font-bold text-emerald-700">产物</div>
                        <div className="text-sm text-emerald-600">韭菜盒子 x 1</div>
                        <div className="text-sm text-emerald-600">售价 ~10 文</div>
                    </div>
                 </div>

                 <button
                    onClick={() => { vibrate(VIBRATION_PATTERNS.MEDIUM); processLeek(); }}
                    disabled={owned < 2 || playerStats.money < 2}
                    className="px-8 py-3 font-bold text-white bg-amber-500 rounded-lg shadow-sm transition-transform hover:bg-amber-600 disabled:opacity-50 active:scale-95"
                 >
                    制作韭菜盒子
                 </button>
                 
                 <div className="pt-4 mt-8 text-left border-t border-stone-100">
                    <h4 className="mb-2 font-bold text-stone-700">成品出售</h4>
                    <div className="flex justify-between items-center">
                        <span>持有韭菜盒子: {ownedBox}</span>
                        <button 
                           onClick={() => { if(ownedBox > 0) { vibrate(VIBRATION_PATTERNS.LIGHT); sellGood('leek_box', 1); } }}
                           disabled={ownedBox < 1}
                           className="px-4 py-2 text-sm font-bold text-emerald-800 bg-emerald-100 rounded hover:bg-emerald-200 disabled:opacity-50"
                        >
                           卖出 (10文)
                        </button>
                    </div>
                 </div>
             </div>
          )}

          {activeTab === 'orders' && (
             <div className="space-y-4">
                {(leekOrders || []).length === 0 ? (
                    <div className="py-10 text-center text-stone-400">
                        <ClipboardList className="mx-auto mb-2 w-12 h-12 opacity-20" />
                        <p>暂无合作社订单，请明日再来。</p>
                    </div>
                ) : (
                    (leekOrders || []).map(order => (
                        <div key={order.id} className="flex flex-col gap-4 justify-between items-center p-4 bg-white rounded-lg border border-emerald-200 shadow-sm md:flex-row">
                             <div className="flex-1">
                                <div className="flex gap-2 items-center mb-1">
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded">收购</span>
                                    <h4 className="font-bold text-stone-800">{order.description}</h4>
                                </div>
                                <div className="flex gap-4 text-sm text-stone-500">
                                    <span>需求: {order.quantity} 把</span>
                                    <span>品质: ≥{order.minQuality}</span>
                                    <span className="text-red-400">限时: {order.expiresIn} 天</span>
                                </div>
                             </div>
                             
                             <div className="flex flex-col gap-2 items-end text-right">
                                <div className="text-lg font-bold text-emerald-600">
                                    报酬: {Math.floor(3 * order.quantity * order.priceMultiplier)} 文
                                </div>
                                <button
                                    onClick={() => { vibrate(VIBRATION_PATTERNS.SUCCESS); submitLeekOrder(order.id); }}
                                    className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded shadow-sm hover:bg-emerald-700"
                                >
                                    交付订单
                                </button>
                             </div>
                        </div>
                    ))
                )}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
