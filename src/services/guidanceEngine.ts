import { GameState } from '@/types/game';

export interface Guidance {
  id: string;
  title: string;
  reason: string;
  cta: string;
  action: () => void;
  priority: number;
  targetId?: string;
}

type GuidanceGenerator = (state: GameState) => Guidance | null;

const merchantGuidance: GuidanceGenerator[] = [
  (state) => {
    if ((state.playerStats.money || 0) < 50) {
      return {
        id: 'merchant-no-money',
        title: '资金不足',
        reason: '您的资金不足50文，无法进行买卖。建议先完成简单任务积累资金。',
        cta: '查看任务',
        action: () => {},
        priority: 100,
        targetId: 'guide-task-btn',
      };
    }
    return null;
  },
  (state) => {
    const money = state.playerStats.money || 0;
    const reputation = state.playerStats.reputation || 0;
    if (money > 100 && reputation < 20) {
      return {
        id: 'merchant-low-reputation',
        title: '声望较低',
        reason: '声望越高，商品价格越有利。建议多做任务提升声望。',
        cta: '查看任务',
        action: () => {},
        priority: 60,
        targetId: 'guide-task-btn',
      };
    }
    return null;
  },
  (state) => {
    const money = state.playerStats.money || 0;
    if (money >= 50 && money < 500) {
      return {
        id: 'merchant-first-trade',
        title: '开始您的商业之路',
        reason: '您已有一定资金，可以去西市集购买货物，低买高卖赚取利润。',
        cta: '前往西市集',
        action: () => {},
        priority: 80,
        targetId: 'guide-market-btn',
      };
    }
    return null;
  },
  (state) => {
    if (state.dailyCounts?.work && state.dailyCounts.work < 3) {
      return {
        id: 'merchant-work-available',
        title: '还有工作机会',
        reason: '今日还能工作赚钱，抓紧时间积累资本。',
        cta: '努力工作',
        action: () => {},
        priority: 50,
      };
    }
    return null;
  },
];

const magistrateGuidance: GuidanceGenerator[] = [
  (state) => {
    const order = state.countyStats?.order || 50;
    const economy = state.countyStats?.economy || 50;
    if (order < 30) {
      return {
        id: 'magistrate-low-order',
        title: '治安告急',
        reason: '县域治安较差，需要处理公务或颁布政策改善。',
        cta: '前往县衙',
        action: () => {},
        priority: 90,
        targetId: 'guide-office-btn',
      };
    }
    return null;
  },
  (state) => {
    const livelihood = state.countyStats?.livelihood || 50;
    if (livelihood < 30) {
      return {
        id: 'magistrate-low-livelihood',
        title: '民生艰难',
        reason: '百姓生活困难，需要关注民生问题。',
        cta: '处理公务',
        action: () => {},
        priority: 85,
        targetId: 'guide-office-btn',
      };
    }
    return null;
  },
  (state) => {
    const economy = state.countyStats?.economy || 50;
    if (economy < 30) {
      return {
        id: 'magistrate-low-economy',
        title: '经济衰退',
        reason: '县域经济下滑，需要采取措施促进贸易和产业。',
        cta: '处理公务',
        action: () => {},
        priority: 80,
        targetId: 'guide-office-btn',
      };
    }
    return null;
  },
  (state) => {
    if (state.dailyCounts?.work && state.dailyCounts.work < 3) {
      return {
        id: 'magistrate-work-available',
        title: '今日还有公务',
        reason: '处理公务可以提升政绩，推动仕途发展。',
        cta: '处理公务',
        action: () => {},
        priority: 50,
      };
    }
    return null;
  },
];

const heroGuidance: GuidanceGenerator[] = [
  (state) => {
    const health = state.playerStats?.health || 100;
    if (health < 30) {
      return {
        id: 'hero-low-health',
        title: '伤势严重',
        reason: '您的生命值较低，建议休息恢复后再历练。',
        cta: '休息恢复',
        action: () => {},
        priority: 100,
      };
    }
    return null;
  },
  (state) => {
    const ability = state.playerStats?.ability || 0;
    if (ability < 10) {
      return {
        id: 'hero-low-ability',
        title: '武艺初成',
        reason: '您的武艺还比较低，建议多历练提升实力。',
        cta: '外出历练',
        action: () => {},
        priority: 80,
        targetId: 'guide-explore-btn',
      };
    }
    return null;
  },
  (state) => {
    const exploreCount = state.dailyCounts?.explore || 0;
    if (exploreCount < 2) {
      return {
        id: 'hero-explore-available',
        title: '历练机会',
        reason: '今日还有历练机会，江湖险恶但机遇与危险并存。',
        cta: '外出历练',
        action: () => {},
        priority: 70,
        targetId: 'guide-explore-btn',
      };
    }
    return null;
  },
  (state) => {
    const reputation = state.playerStats?.reputation || 0;
    if (reputation < 20) {
      return {
        id: 'hero-low-reputation',
        title: '声望较低',
        reason: '声望代表您在江湖中的名声，声望越高越受尊敬。',
        cta: '查看任务',
        action: () => {},
        priority: 60,
        targetId: 'guide-task-btn',
      };
    }
    return null;
  },
];

export const generateGuidance = (state: GameState): Guidance | null => {
  let generators: GuidanceGenerator[];

  switch (state.role) {
    case 'merchant':
      generators = merchantGuidance;
      break;
    case 'magistrate':
      generators = magistrateGuidance;
      break;
    case 'hero':
      generators = heroGuidance;
      break;
    default:
      generators = [];
  }

  const validGuidances: Guidance[] = [];

  for (const generator of generators) {
    const guidance = generator(state);
    if (guidance) {
      validGuidances.push(guidance);
    }
  }

  if (validGuidances.length === 0) {
    return {
      id: 'default',
      title: '自由探索',
      reason: '您目前状态良好，可以自由探索武宁镇的各种玩法。',
      cta: '查看任务',
      action: () => {},
      priority: 10,
      targetId: 'guide-task-btn',
    };
  }

  validGuidances.sort((a, b) => b.priority - a.priority);
  return validGuidances[0];
};
