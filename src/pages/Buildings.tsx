import React, { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Hammer, Sword, Utensils, Clock, UserX, BookOpen, Beer, Bed, Mountain, HelpCircle, Scroll, Wine, FlaskConical, Sprout } from 'lucide-react';
import { LogPanel } from '@/components/LogPanel';
import { useGameVibrate, VIBRATION_PATTERNS } from '@/hooks/useGameVibrate';
import { questions, Question } from '@/data/questions';
import { MobileStall } from '@/components/MobileStall';
import { BarberShop } from '@/components/BarberShop';
import { ArcheryHall } from '@/components/ArcheryHall';

// Lingrong Garden Component
const LingrongGarden: React.FC = () => {
  const { playerStats, handleEventOption, npcRelations, inventory } = useGameStore();
  const vibrate = useGameVibrate();
  const npcId = 'mo_gu';
  const relation = npcRelations[npcId] || 0;

  const handlePickMushrooms = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    if (playerStats.money < 1) {
      handleEventOption(undefined, '【灵茸园】入园采摘需缴纳1文钱，你囊中羞涩。');
      return;
    }

    const roll = Math.random();
    let item = 'wild_mushroom';
    let itemName = '野生菌';
    
    // 20% chance to get Bamboo Fungus
    if (roll < 0.2) {
        item = 'bamboo_fungus';
        itemName = '竹荪';
    }

    handleEventOption({
      money: -1,
      itemsAdd: [item]
    }, `【灵茸园】你在园中仔细搜寻，采摘到了一些【${itemName}】。`);
  };

  const handleTendGarden = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (playerStats.health < 5) {
      handleEventOption(undefined, '【灵茸园】体力不足，干不动农活。');
      return;
    }

    const roll = Math.random();
    const updates: any = {
      health: -5,
    };
    let msg = '';

    // 50% chance for money, 50% for favor
    if (roll < 0.5) {
        updates.money = 5; // Work reward
        msg = '【灵茸园】你帮墨骨除草浇水，墨骨给了你5文钱作为报酬。';
    } else {
        updates.relationChange = { [npcId]: 1 };
        msg = '【灵茸园】你细心照料菌种，墨骨看在眼里，对你点了点头。（好感度 +1）';
    }

    // Check for gift threshold (e.g., 20 favor)
    // Note: relation is current relation BEFORE this update. 
    // If current is 19 and we add 1, it becomes 20.
    // Or we check if (relation + (updates.relationChange?.[npcId] || 0) >= 20)
    
    const potentialRelation = relation + (updates.relationChange?.[npcId] || 0);
    
    if (potentialRelation >= 20 && !inventory.includes('mogu_gift')) {
        updates.itemsAdd = ['mogu_gift'];
        msg += ' 墨骨被你的诚心打动，送了你一份谢礼！';
    }

    handleEventOption(updates, msg);
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Sprout className="text-green-600" />
        <h2 className="text-xl font-bold">灵茸园</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        城外幽静的园子，种满了各种奇珍异草。
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handlePickMushrooms}
          disabled={playerStats.money < 1}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Sprout className="mb-2" />
          <span className="font-bold">采菌子</span>
          <span className="text-xs text-muted-foreground">1文 / 获得食材</span>
        </button>

        <button
          onClick={handleTendGarden}
          disabled={playerStats.health < 5}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Hammer className="mb-2" />
          <span className="font-bold">打理园子</span>
          <span className="text-xs text-muted-foreground">5体力 / 报酬或好感</span>
          <span className="text-[10px] text-muted-foreground">
             墨骨好感: {relation}
          </span>
        </button>
      </div>
    </div>
  );
};

// Xiaoyan Tavern Component
const XiaoyanTavern: React.FC = () => {
  const { playerStats, handleEventOption, flags } = useGameStore();
  const vibrate = useGameVibrate();
  const learnBrewingCount = flags['learn_brewing_count'] || 0;
  const canBrew = !!flags['can_brew_wine'];
  const MAX_LEARN_COUNT = 10; // Threshold for learning brewing

  const handleDrink = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    if (playerStats.money < 1) {
      handleEventOption(undefined, '【小言酒馆】囊中羞涩，喝不起酒。');
      return;
    }

    const updates: any = {
      money: -1,
      health: 5,
      // "Spirit decrease" -> mapping to ability slightly decreasing or just flavor
      // "Satiety increase" -> using flag to track
      flagsSet: {
         satiety: (flags['satiety'] || 0) + 5,
         is_drunk: true // Add drunk status flag
      }
    };
    
    // Decrease spirit (ability) slightly? Maybe not punish stats too much.
    // Let's just say it in text for now, unless "spirit" becomes a real stat.
    // Or maybe decrease ability temporarily? Let's just do flavor for now.
    
    handleEventOption(updates, '【小言酒馆】你痛饮一杯，只觉天旋地转，飘飘欲仙。（体力恢复，获得醉酒状态，精神恍惚，饱腹度增加）');
  };

  const handleLearnBrewing = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (playerStats.money < 10) {
      handleEventOption(undefined, '【小言酒馆】学费不足，老板娘不肯教你。');
      return;
    }

    const newCount = learnBrewingCount + 1;
    const updates: any = {
      money: -10,
      experience: 10,
      flagsSet: { learn_brewing_count: newCount }
    };

    let msg = `【小言酒馆】你跟随老板娘学习酿酒技艺，颇有心得。（阅历 +10，进度 ${newCount}/${MAX_LEARN_COUNT}）`;

    if (newCount >= MAX_LEARN_COUNT && !canBrew) {
      updates.flagsSet.can_brew_wine = true;
      msg = `【小言酒馆】恭喜！你已掌握酿酒精髓，成为了一名酿酒师！（解锁【酿酒】功能，获得成就【酿酒师】）`;
      // Achievement trigger handled by gameStore via condition checking usually, 
      // but if we want instant feedback we might need to rely on store update cycle.
    }

    handleEventOption(updates, msg);
  };

  const handleSelfBrew = () => {
      vibrate(VIBRATION_PATTERNS.HEAVY);
      // Simple brewing action for now
      handleEventOption({
          health: -5,
          itemsAdd: ['old_wine'] // Produce Old Wine for now
      }, '【小言酒馆】你亲手酿制了一坛好酒。（获得陈年老酒）');
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Wine className="text-rose-500" />
        <h2 className="text-xl font-bold">小言酒馆</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        小巷深处的酒馆，酒香不怕巷子深。
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDrink}
          disabled={playerStats.money < 1}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Wine className="mb-2" />
          <span className="font-bold">饮酒</span>
          <span className="text-xs text-muted-foreground">1文 / 恢复体力</span>
          <span className="text-[10px] text-muted-foreground">获得醉酒状态</span>
        </button>

        <button
          onClick={handleLearnBrewing}
          disabled={canBrew || playerStats.money < 10}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <BookOpen className="mb-2" />
          <span className="font-bold">学习酿酒</span>
          <span className="text-xs text-muted-foreground">10文 / 增加阅历</span>
          <span className="text-[10px] text-muted-foreground">
             进度: {canBrew ? '已掌握' : `${learnBrewingCount}/${MAX_LEARN_COUNT}`}
          </span>
        </button>

        {canBrew && (
            <button
            onClick={handleSelfBrew}
            className="flex flex-col justify-center items-center p-4 col-span-2 rounded-lg border transition-all hover:bg-secondary"
            >
            <FlaskConical className="mb-2" />
            <span className="font-bold">自行酿酒</span>
            <span className="text-xs text-muted-foreground">消耗体力 / 获得酒品</span>
            </button>
        )}
      </div>
    </div>
  );
};

// Ximeng Tower Component
const XimengTower: React.FC = () => {
  const { playerStats, handleEventOption, inventory, flags } = useGameStore();
  const vibrate = useGameVibrate();
  const [quizState, setQuizState] = useState<{
    active: boolean;
    question?: Question;
  }>({ active: false });

  const handleReading = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    if (playerStats.health < 10) {
      handleEventOption(undefined, '【曦梦楼】体力不支，难以集中精神读书。');
      return;
    }

    const newReadCount = (flags['ximeng_read_count'] || 0) + 1;
    const isMilestone = newReadCount % 10 === 0;

    const updates: any = {
      health: -10,
      flagsSet: { ximeng_read_count: newReadCount }
    };

    let msg = '【曦梦楼】你沉浸在书海中，颇有感悟。';

    if (isMilestone) {
      updates.ability = 2; // Increase comprehension
      updates.itemsAdd = ['ximeng_invitation'];
      msg = '【曦梦楼】你读破万卷，豁然开朗！悟性提升，并收到了一张曦梦楼的邀请函。';
    } else {
      updates.experience = 5;
    }

    handleEventOption(updates, msg);
  };

  const handleChallenge = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (!inventory.includes('ximeng_invitation')) {
      handleEventOption(undefined, '【曦梦楼】你需要一张邀请函才能参与问答挑战。');
      return;
    }

    const q = questions[Math.floor(Math.random() * questions.length)];
    setQuizState({ active: true, question: q });
  };

  const handleAnswer = (option: string) => {
    if (!quizState.question) return;

    const isCorrect = option === quizState.question.answer;
    setQuizState({ active: false });

    if (isCorrect) {
      const newChallengeCount = (flags['ximeng_challenge_count'] || 0) + 1;
      const updates: any = {
        itemsRemove: ['ximeng_invitation'],
        flagsSet: { ximeng_challenge_count: newChallengeCount }
      };

      let msg = `【曦梦楼】你回答：“${option}”。云曦微笑着点了点头：“正是此理。”`;

      if (newChallengeCount === 10) {
        if (!inventory.includes('sword_edge_method')) {
            updates.itemsAdd = ['sword_edge_method'];
            updates.ability = 10; // Speed/Ability boost
            msg += ' 完成10次挑战，云曦赠予你《剑走偏锋》心法！你的速度大幅提升了。';
        }
      }
      handleEventOption(updates, msg);
    } else {
      handleEventOption({
        itemsRemove: ['ximeng_invitation']
      }, `【曦梦楼】你回答：“${option}”。云曦遗憾地摇了摇头：“差之毫厘，谬以千里。”（挑战失败，消耗邀请函）`);
    }
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Scroll className="text-indigo-600" />
        <h2 className="text-xl font-bold">曦梦楼</h2>
      </div>
      
      {!quizState.active ? (
        <>
          <p className="text-sm text-muted-foreground">
            文人雅士聚集之地，书香四溢，常有智者在此论道。
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleReading}
              disabled={playerStats.health < 10}
              className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
            >
              <BookOpen className="mb-2" />
              <span className="font-bold">读书</span>
              <span className="text-xs text-muted-foreground">消耗10体力 / 提升悟性</span>
              <span className="text-[10px] text-muted-foreground">
                 进度: {(flags['ximeng_read_count'] || 0) % 10}/10
              </span>
            </button>

            <button
              onClick={handleChallenge}
              disabled={!inventory.includes('ximeng_invitation')}
              className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
            >
              <HelpCircle className="mb-2" />
              <span className="font-bold">问答挑战</span>
              <span className="text-xs text-muted-foreground">消耗邀请函 / 赢取心法</span>
              <span className="text-[10px] text-muted-foreground">
                 挑战: {(flags['ximeng_challenge_count'] || 0)}/10
              </span>
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-4 animate-in fade-in zoom-in">
           <p className="text-sm font-medium text-center text-primary">
             云曦问道：{quizState.question?.q}
           </p>
           <div className="grid grid-cols-1 gap-2">
             {quizState.question?.options.map((opt, idx) => (
               <button
                 key={idx}
                 onClick={() => handleAnswer(opt)}
                 className="p-3 text-sm text-left rounded-md border hover:bg-secondary"
               >
                 {String.fromCharCode(65 + idx)}. {opt}
               </button>
             ))}
           </div>
           <button 
             onClick={() => setQuizState({ active: false })}
             className="w-full text-xs text-muted-foreground hover:underline"
           >
             放弃挑战
           </button>
        </div>
      )}
    </div>
  );
};

// Xingyue Restaurant Component
const XingyueRestaurant: React.FC = () => {
  const { playerStats, handleEventOption, achievements, flags, day } = useGameStore();
  const vibrate = useGameVibrate();
  const npcId = 'jin_cheng';

  // Reset daily flags if new day (handled in gameStore ideally, but for now we can check 'last_wine_day' flag)
  // Actually, gameStore resets flags manually or we can use specific daily flags.
  // The user requirement says "Daily one kind of wine drink 5 times".
  // I'll check `flags['last_wine_day']` vs `day`. If different, reset counts.
  // BUT: Updating state inside render or effect is better. For simplicity, I'll assume game logic handles reset OR I use a check here.
  // To avoid complexity, I'll rely on a 'check' before action.

  const checkDailyReset = () => {
     if ((flags['last_wine_day'] || 0) !== day) {
         handleEventOption({
             flagsSet: {
                 last_wine_day: day,
                 daily_wine_1_count: 0,
                 daily_wine_2_count: 0,
                 daily_wine_3_count: 0,
                 daily_wine_4_count: 0,
                 daily_pinjiu_total: 0
             }
         });
         return true; // Just reset
     }
     return false;
  };

  const handleDajian = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    if (playerStats.money < 1) {
      handleEventOption(undefined, '【行月酒楼】囊中羞涩，吃不起饭。');
      return;
    }
    handleEventOption({
      money: -1,
      health: 10, // Restore health
      relationChange: { [npcId]: 1 }
    }, '【行月酒楼】你美美地吃了一顿，饱食度增加了，体力恢复了。');
  };

  const handleZhuDian = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (playerStats.money < 5) {
      handleEventOption(undefined, '【行月酒楼】钱不够，住不起店。');
      return;
    }
    
    // Calculate heal amount to max (assuming max health ~100 base + talent)
    // We don't have maxHealth in stats, but store clamps it. So we can just add a large amount.
    handleEventOption({
      money: -5,
      health: 999, 
    }, '【行月酒楼】你在舒适的客房睡了一觉，体力完全恢复了！（饱食度略微下降）');
  };

  const handleDengDing = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (playerStats.health < 20) {
      handleEventOption(undefined, '【行月酒楼】体力不足，爬不动楼。');
      return;
    }
    handleEventOption({
      health: -20,
      experience: 15,
      // "Spirit max increase" -> Mapping to ability for now, or maybe a flag that increases 'mental cap' if we had one.
      // Let's give a small permanent ability boost or reputation.
      ability: 1
    }, '【行月酒楼】你登顶行月酒楼，俯瞰无宁县全景，顿觉心胸开阔！阅历增加，精神振奋。');
  };

  const handlePinJiu = () => {
    checkDailyReset();
    vibrate(VIBRATION_PATTERNS.HEAVY);

    const isFree = achievements.includes('wine_master');
    const cost = isFree ? 0 : 1;

    if (!isFree && playerStats.money < cost) {
      handleEventOption(undefined, '【行月酒楼】没钱喝酒。');
      return;
    }
    if (playerStats.health < 5) {
        handleEventOption(undefined, '【行月酒楼】体力不支，喝不动了。');
        return;
    }

    const currentTotal = (flags['daily_pinjiu_total'] || 0);
    // If it's a new day (checked above asyncly, might be race condition if clicked fast, but ok for now)
    // Wait, checkDailyReset triggers an update. We should probably do the check inside the logic or assume it's done.
    // Let's use current day from store. If flags['last_wine_day'] != day, treat counts as 0.
    
    const isNewDay = (flags['last_wine_day'] || 0) !== day;
    const effectiveTotal = isNewDay ? 0 : currentTotal;

    if (effectiveTotal >= 10) {
        handleEventOption(undefined, '【行月酒楼】今日酒量已达上限，改日再战吧。');
        return;
    }

    const wines = [
        { id: 1, name: '女儿红' },
        { id: 2, name: '竹叶青' },
        { id: 3, name: '状元红' },
        { id: 4, name: '剑南春' }
    ];
    const randomWine = wines[Math.floor(Math.random() * wines.length)];
    
    // Construct updates
    const newFlags: any = {
        last_wine_day: day,
        daily_pinjiu_total: effectiveTotal + 1,
    };
    
    // Reset individual counts if new day
    if (isNewDay) {
        newFlags['daily_wine_1_count'] = 0;
        newFlags['daily_wine_2_count'] = 0;
        newFlags['daily_wine_3_count'] = 0;
        newFlags['daily_wine_4_count'] = 0;
    } else {
        // Copy existing to be safe, though merge handles it
    }

    // Increment specific wine
    const currentWineCount = isNewDay ? 0 : (flags[`daily_wine_${randomWine.id}_count`] || 0);
    newFlags[`daily_wine_${randomWine.id}_count`] = currentWineCount + 1;

    handleEventOption({
        money: -cost,
        health: -5,
        flagsSet: newFlags
    }, `【行月酒楼】你与锦城痛饮，喝到了【${randomWine.name}】！酒量似乎见长。`);
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Beer className="text-purple-600" />
        <h2 className="text-xl font-bold">行月酒楼</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        无宁县最负盛名的酒楼，登高望远，把酒言欢。
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleDajian}
          disabled={playerStats.money < 1}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Utensils className="mb-2" />
          <span className="font-bold">打尖</span>
          <span className="text-xs text-muted-foreground">1文 / 恢复体力</span>
        </button>

        <button
          onClick={handleZhuDian}
          disabled={playerStats.money < 5}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Bed className="mb-2" />
          <span className="font-bold">住店</span>
          <span className="text-xs text-muted-foreground">5文 / 体力全满</span>
        </button>

         <button
          onClick={handleDengDing}
          disabled={playerStats.health < 20}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Mountain className="mb-2" />
          <span className="font-bold">登顶</span>
          <span className="text-xs text-muted-foreground">消耗20体力 / 提升阅历</span>
        </button>

        <button
          onClick={handlePinJiu}
          disabled={!achievements.includes('wine_master') && playerStats.money < 1}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Beer className="mb-2" />
          <span className="font-bold">拼酒</span>
          <span className="text-xs text-muted-foreground">
            {achievements.includes('wine_master') ? '免费' : '1文'} / 赢取成就
          </span>
          <span className="text-[10px] text-muted-foreground">
             今日: {((flags['last_wine_day'] || 0) === day ? (flags['daily_pinjiu_total'] || 0) : 0)}/10
          </span>
        </button>
      </div>
    </div>
  );
};

// Yuntuntun's Shop Component
const YuntuntunShop: React.FC = () => {
  const { playerStats, handleEventOption, inventory } = useGameStore();
  const vibrate = useGameVibrate();
  const npcId = 'yun_tuntun';

  const handleEat = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    if (playerStats.money < 20) {
      handleEventOption(undefined, '【猫猫百味轩】囊中羞涩，吃不起馄饨。');
      return;
    }
    handleEventOption({
      money: -20,
      health: 5,
      relationChange: { [npcId]: 1 }
    }, '【猫猫百味轩】你点了一碗招牌馄饨，鲜美多汁，体力恢复了。');
  };

  const handleWait = () => {
    vibrate(VIBRATION_PATTERNS.LIGHT);
    if (playerStats.money < 5) {
      handleEventOption(undefined, '【猫猫百味轩】连茶钱都付不起。');
      return;
    }
    handleEventOption({
      money: -5,
      health: 1
    }, '【猫猫百味轩】你点了一壶茶，边喝边等人，看着窗外人来人往，心情平复了一些。');
  };

  const handleOccupy = () => {
    vibrate(VIBRATION_PATTERNS.HEAVY);
    handleEventOption({
      relationChange: { [npcId]: -2 }
    }, '【猫猫百味轩】你占着位置不点餐，云老板向你投来不悦的目光。');
  };

  const handleStealSkill = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (playerStats.health < 15) {
      handleEventOption(undefined, '【猫猫百味轩】体力不足，无法偷师。');
      return;
    }

    const isSuccess = Math.random() < 0.3; // 30% success rate

    if (isSuccess) {
      if (inventory.includes('wonton_72_transformations')) {
           handleEventOption({
            health: -15,
            ability: 5
          }, '【猫猫百味轩】你再次偷师，对馄饨制作有了更深的感悟。（能力 +5）');
      } else {
          handleEventOption({
            health: -15,
            ability: 10,
            itemsAdd: ['wonton_72_transformations']
          }, '【猫猫百味轩】你趁云老板不注意，偷学到了馄饨制作的精髓！获得了《馄饨的七十二变》。（能力 +10）');
      }
    } else {
      handleEventOption({
        health: -15,
        relationChange: { [npcId]: -5 }
      }, '【猫猫百味轩】你鬼鬼祟祟地探头探脑，被云老板发现了！云老板很生气。（好感度 -5）');
    }
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Utensils className="text-orange-500" />
        <h2 className="text-xl font-bold">猫猫百味轩</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        这里不仅有美味的馄饨，还藏着云老板的独门秘籍。
      </p>

      <div className="space-y-2">
          <h3 className="text-sm font-semibold">进店吃饭</h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleEat}
              disabled={playerStats.money < 20}
              className="flex flex-col justify-center items-center p-3 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
            >
              <Utensils size={16} className="mb-1" />
              <span className="text-sm font-bold">吃饭</span>
              <span className="text-xs text-muted-foreground">-20铜钱</span>
            </button>
            <button
              onClick={handleWait}
              disabled={playerStats.money < 5}
              className="flex flex-col justify-center items-center p-3 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
            >
              <Clock size={16} className="mb-1" />
              <span className="text-sm font-bold">等人</span>
              <span className="text-xs text-muted-foreground">-5铜钱</span>
            </button>
            <button
              onClick={handleOccupy}
              className="flex flex-col justify-center items-center p-3 rounded-lg border transition-all hover:bg-secondary"
            >
              <UserX size={16} className="mb-1" />
              <span className="text-sm font-bold">霸座</span>
              <span className="text-xs text-muted-foreground">免费</span>
            </button>
          </div>
      </div>

      <div className="pt-2 space-y-2 border-t">
          <h3 className="text-sm font-semibold">后厨偷师</h3>
          <button
            onClick={handleStealSkill}
            disabled={playerStats.health < 15}
            className="flex gap-2 justify-center items-center p-3 w-full rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
          >
            <BookOpen size={16} />
            <span className="font-bold">潜入后厨偷师</span>
            <span className="text-xs text-muted-foreground">消耗 15 体力</span>
          </button>
      </div>
    </div>
  );
};

// Blacksmith Shop Component
const BlacksmithShop: React.FC = () => {
  const { playerStats, handleEventOption, flags } = useGameStore();
  const vibrate = useGameVibrate();

  const handleStrikeIron = () => {
    vibrate(VIBRATION_PATTERNS.MEDIUM);
    if (playerStats.health < 10) {
      handleEventOption(undefined, '【豆沙铁匠铺】体力不足，无法打铁。');
      return;
    }

    const currentCount = (flags['blacksmith_count'] || 0) + 1;
    
    handleEventOption({
        health: -10,
        flagsSet: { blacksmith_count: currentCount }
    }, `【豆沙铁匠铺】你挥汗如雨，叮当打铁。（累计打铁 ${currentCount} 次）`);
  };

  const handleLearnSpear = () => {
     vibrate(VIBRATION_PATTERNS.MEDIUM);
     if (playerStats.health < 10) {
      handleEventOption(undefined, '【豆沙铁匠铺】体力不足，无法练枪。');
      return;
    }

    const currentCount = (flags['spear_count'] || 0) + 1;
    
    handleEventOption({
        health: -10,
        flagsSet: { spear_count: currentCount }
    }, `【豆沙铁匠铺】你舞动长枪，寒芒点点。（累计练枪 ${currentCount} 次）`);
  };

  return (
    <div className="p-4 space-y-4 rounded-lg border shadow-sm bg-card text-card-foreground">
      <div className="flex gap-2 items-center pb-2 border-b">
        <Hammer className="text-gray-600" />
        <h2 className="text-xl font-bold">豆沙铁匠铺</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        炉火纯青，百炼成钢。这里不仅可以打造兵器，还能切磋武艺。
      </p>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleStrikeIron}
          disabled={playerStats.health < 10}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Hammer className="mb-2" />
          <span className="font-bold">打铁</span>
          <span className="text-xs text-muted-foreground">消耗 10 体力</span>
          <span className="text-xs text-muted-foreground">累计: {flags['blacksmith_count'] || 0}</span>
        </button>

        <button
          onClick={handleLearnSpear}
          disabled={playerStats.health < 10}
          className="flex flex-col justify-center items-center p-4 rounded-lg border transition-all hover:bg-secondary disabled:opacity-50"
        >
          <Sword className="mb-2" />
          <span className="font-bold">学枪</span>
          <span className="text-xs text-muted-foreground">消耗 10 体力</span>
           <span className="text-xs text-muted-foreground">累计: {flags['spear_count'] || 0}</span>
        </button>
      </div>
    </div>
  );
};

export const Buildings: React.FC = () => {
  const navigate = useNavigate();
  const { logs } = useGameStore();
  const vibrate = useGameVibrate();

  return (
    <div className="flex justify-center p-4 min-h-screen bg-background">
      <div className="grid grid-cols-1 gap-6 w-full max-w-5xl md:grid-cols-2 md:h-[calc(100vh-2rem)]">
        
        {/* Left: Buildings List */}
        <div className="flex overflow-y-auto flex-col gap-4 mx-auto w-full max-w-md h-full md:max-w-none no-scrollbar">
          <header className="flex gap-4 items-center py-2 shrink-0">
            <button 
              onClick={() => {
                vibrate(VIBRATION_PATTERNS.LIGHT);
                navigate('/game');
              }}
              className="p-2 rounded-full transition-colors hover:bg-secondary"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-bold">建筑阁</h1>
          </header>

          <BlacksmithShop />
          <YuntuntunShop />
          <XingyueRestaurant />
          <XimengTower />
          <XiaoyanTavern />
          <LingrongGarden />
          <MobileStall />
          <BarberShop />
          <ArcheryHall />
          
          {/* Future buildings can be added here */}
          
        </div>

        {/* Right: Log Panel */}
        <div className="mx-auto w-full max-w-md h-64 md:h-full md:max-w-none">
          <LogPanel logs={logs} />
        </div>
      </div>
    </div>
  );
};
