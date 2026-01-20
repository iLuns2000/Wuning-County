import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Terminal, Plus } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

export const Developer: React.FC = () => {
  const navigate = useNavigate();
  const { playerStats, countyStats, updateStats, day, role, fortuneLevel, inventory, handleEventOption } = useGameStore();

  const [formData, setFormData] = useState({
    money: playerStats.money,
    reputation: playerStats.reputation,
    ability: playerStats.ability,
    health: playerStats.health,
    experience: playerStats.experience,
    economy: countyStats.economy,
    order: countyStats.order,
    culture: countyStats.culture,
    livelihood: countyStats.livelihood,
    day: day,
    fortuneLevel: fortuneLevel || 'normal',
  });
  
  const [itemIdInput, setItemIdInput] = useState('');

  if (!role) {
    return (
        <div className="flex flex-col justify-center items-center p-4 min-h-screen text-center">
            <h1 className="mb-4 text-xl font-bold">开发者模式</h1>
            <p className="mb-6 text-muted-foreground">请先开始游戏选择角色后再进入此模式。</p>
            <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
            >
                返回主页
            </button>
        </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'fortuneLevel' ? value : (parseInt(value) || 0)
    }));
  };

  const handleSave = () => {
    updateStats({
      day: formData.day,
      fortuneLevel: formData.fortuneLevel as any,
      playerStats: {
        money: formData.money,
        reputation: formData.reputation,
        ability: formData.ability,
        health: formData.health,
        experience: formData.experience,
      },
      countyStats: {
        economy: formData.economy,
        order: formData.order,
        culture: formData.culture,
        livelihood: formData.livelihood,
      }
    });
    alert('数据修改成功！');
  };

  const handleAddItem = () => {
    if (!itemIdInput.trim()) return;
    handleEventOption({
        itemsAdd: [itemIdInput.trim()]
    }, `[开发者指令] 添加物品: ${itemIdInput.trim()}`);
    setItemIdInput('');
    alert(`尝试添加物品: ${itemIdInput.trim()} (请确认ID是否正确)`);
  };

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="space-y-6 w-full max-w-2xl">
        <header className="flex gap-4 items-center py-2 shrink-0">
          <button 
            onClick={() => navigate('/game')}
            className="p-2 rounded-full transition-colors hover:bg-secondary"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex gap-2 items-center text-xl font-bold">
            <Terminal className="text-primary" />
            开发者控制台
          </h1>
        </header>

        <div className="p-6 space-y-6 rounded-lg border shadow-sm bg-card">
          <div className="space-y-4">
            <h2 className="pb-2 text-lg font-bold border-b">基础信息</h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">当前天数</label>
                 <input
                   type="number"
                   name="day"
                   value={formData.day}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">今日运势</label>
                 <select
                   name="fortuneLevel"
                   value={formData.fortuneLevel}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 >
                    <option value="great_blessing">大吉</option>
                    <option value="blessing">中吉/小吉</option>
                    <option value="normal">平</option>
                    <option value="bad_luck">末吉/小凶</option>
                    <option value="terrible_luck">大凶</option>
                 </select>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="pb-2 text-lg font-bold border-b">角色属性</h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">金钱</label>
                 <input
                   type="number"
                   name="money"
                   value={formData.money}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">声望</label>
                 <input
                   type="number"
                   name="reputation"
                   value={formData.reputation}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">能力/武学</label>
                 <input
                   type="number"
                   name="ability"
                   value={formData.ability}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">体力/健康</label>
                 <input
                   type="number"
                   name="health"
                   value={formData.health}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">阅历/经验</label>
                 <input
                   type="number"
                   name="experience"
                   value={formData.experience}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="pb-2 text-lg font-bold border-b">县城状况</h2>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">经济</label>
                 <input
                   type="number"
                   name="economy"
                   value={formData.economy}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">治安</label>
                 <input
                   type="number"
                   name="order"
                   value={formData.order}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">文化</label>
                 <input
                   type="number"
                   name="culture"
                   value={formData.culture}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">民生</label>
                 <input
                   type="number"
                   name="livelihood"
                   value={formData.livelihood}
                   onChange={handleChange}
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="pb-2 text-lg font-bold border-b">物品管理</h2>
            <div className="flex gap-4 items-end">
               <div className="flex-1 space-y-2">
                 <label className="text-sm font-medium">物品 ID</label>
                 <input
                   type="text"
                   value={itemIdInput}
                   onChange={(e) => setItemIdInput(e.target.value)}
                   placeholder="输入物品ID (如: oil_paper_umbrella)"
                   className="flex px-3 py-2 w-full h-10 text-sm rounded-md border border-input bg-background"
                 />
               </div>
               <button 
                 onClick={handleAddItem}
                 disabled={!itemIdInput.trim()}
                 className="flex gap-2 justify-center items-center px-4 h-10 font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
               >
                 <Plus size={16} />
                 添加物品
               </button>
            </div>
            <div className="text-xs text-muted-foreground">
                当前持有物品数: {inventory.length}
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="flex gap-2 justify-center items-center py-3 w-full font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save size={20} />
            保存修改
          </button>
        </div>
      </div>
    </div>
  );
};
