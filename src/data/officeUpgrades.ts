export interface OfficeUpgradeConfig {
  level: number;
  cost: {
    money: number;
    wood: number;
    stone: number;
    constructionOrder?: number; // 建材令 (L11+)
    rareStone?: number; // 稀有石料 (L16+)
  };
  durationSeconds: number; // 升级所需秒数
  benefits: {
    resourceRate: number; // 资源产量加成 (e.g. 1.05 for +5%)
    storageCap: number; // 仓库容量加成 (e.g. 1.08 for +8%)
    unlocks?: string[]; // 解锁的功能描述
  };
}

// 1-20级完整数值表
export const officeUpgrades: OfficeUpgradeConfig[] = [
  {
    level: 1,
    cost: { money: 0, wood: 0, stone: 0 },
    durationSeconds: 0,
    benefits: { resourceRate: 1.0, storageCap: 1.0 }
  },
  {
    level: 2,
    cost: { money: 500, wood: 200, stone: 100 },
    durationSeconds: 5 * 60,
    benefits: { resourceRate: 1.05, storageCap: 1.08 }
  },
  {
    level: 3,
    cost: { money: 775, wood: 300, stone: 145 },
    durationSeconds: 8 * 60,
    benefits: { resourceRate: 1.10, storageCap: 1.16, unlocks: [] }
  },
  {
    level: 4,
    cost: { money: 1200, wood: 450, stone: 210 },
    durationSeconds: 13 * 60,
    benefits: { resourceRate: 1.15, storageCap: 1.24 }
  },
  {
    level: 5,
    cost: { money: 1860, wood: 675, stone: 305 },
    durationSeconds: 21 * 60,
    benefits: { resourceRate: 1.20, storageCap: 1.32, unlocks: [] }
  },
  {
    level: 6,
    cost: { money: 2880, wood: 1010, stone: 440 },
    durationSeconds: 34 * 60,
    benefits: { resourceRate: 1.25, storageCap: 1.40 }
  },
  {
    level: 7,
    cost: { money: 4460, wood: 1515, stone: 640 },
    durationSeconds: 55 * 60,
    benefits: { resourceRate: 1.30, storageCap: 1.48, unlocks: ['官邸外观升级', ] }
  },
  {
    level: 8,
    cost: { money: 6910, wood: 2270, stone: 930 },
    durationSeconds: 90 * 60, // 1.5 hours
    benefits: { resourceRate: 1.35, storageCap: 1.56 }
  },
  {
    level: 9,
    cost: { money: 10710, wood: 3405, stone: 1350 },
    durationSeconds: 150 * 60, // 2.5 hours
    benefits: { resourceRate: 1.40, storageCap: 1.64, unlocks: [] }
  },
  {
    level: 10,
    cost: { money: 16500, wood: 5105, stone: 1960 },
    durationSeconds: 240 * 60, // 4 hours
    benefits: { resourceRate: 1.45, storageCap: 1.72 }
  },
  {
    level: 11,
    cost: { money: 25600, wood: 7660, stone: 2840, constructionOrder: 1 },
    durationSeconds: 390 * 60, // 6.5 hours
    benefits: { resourceRate: 1.50, storageCap: 1.80, unlocks: [] }
  },
  {
    level: 12,
    cost: { money: 39600, wood: 11490, stone: 4120, constructionOrder: 1 },
    durationSeconds: 600 * 60, // 10 hours
    benefits: { resourceRate: 1.55, storageCap: 1.88 }
  },
  {
    level: 13,
    cost: { money: 61400, wood: 17235, stone: 5970, constructionOrder: 1 },
    durationSeconds: 960 * 60, // 16 hours
    benefits: { resourceRate: 1.60, storageCap: 1.96 }
  },
  {
    level: 14,
    cost: { money: 95200, wood: 25850, stone: 8660, constructionOrder: 2 },
    durationSeconds: 1500 * 60, // 25 hours
    benefits: { resourceRate: 1.65, storageCap: 2.04 }
  },
  {
    level: 15,
    cost: { money: 147600, wood: 38775, stone: 12550, constructionOrder: 2 },
    durationSeconds: 2400 * 60, // 40 hours
    benefits: { resourceRate: 1.70, storageCap: 2.12 }
  },
  {
    level: 16,
    cost: { money: 228800, wood: 58160, stone: 18200, constructionOrder: 2, rareStone: 1 },
    durationSeconds: 3840 * 60, // 64 hours
    benefits: { resourceRate: 1.75, storageCap: 2.20 }
  },
  {
    level: 17,
    cost: { money: 354700, wood: 87240, stone: 26390, constructionOrder: 2, rareStone: 1 },
    durationSeconds: 6120 * 60, // 102 hours
    benefits: { resourceRate: 1.80, storageCap: 2.28 }
  },
  {
    level: 18,
    cost: { money: 549700, wood: 130860, stone: 38270, constructionOrder: 3, rareStone: 1 },
    durationSeconds: 9780 * 60, // 163 hours
    benefits: { resourceRate: 1.85, storageCap: 2.36 }
  },
  {
    level: 19,
    cost: { money: 852000, wood: 196290, stone: 55590, constructionOrder: 3, rareStone: 2 },
    durationSeconds: 15660 * 60, // 261 hours
    benefits: { resourceRate: 1.90, storageCap: 2.44 }
  },
  {
    level: 20,
    cost: { money: 1321000, wood: 294430, stone: 80610, constructionOrder: 3, rareStone: 2 },
    durationSeconds: 25080 * 60, // 418 hours
    benefits: { resourceRate: 1.95, storageCap: 2.52 }
  }
];
