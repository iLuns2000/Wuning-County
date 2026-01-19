import { Policy } from '@/types/game';

export const policies: Policy[] = [
  {
    id: 'policy_rest',
    name: '休养生息',
    description: '减免赋税，减轻徭役，让百姓休养生息。\n效果：每日民生+2，治安+1，金钱收入减少',
    dailyEffect: {
      livelihood: 2,
      order: 1,
      money: -10,
    },
    cost: 50,
  },
  {
    id: 'policy_security',
    name: '严整治安',
    description: '加强巡逻，严厉打击犯罪，整顿县城秩序。\n效果：每日治安+3，声望+2，民生-1',
    dailyEffect: {
      order: 3,
      reputation: 2,
      livelihood: -1,
    },
    cost: 50,
  },
  {
    id: 'policy_commerce',
    name: '通商惠工',
    description: '降低关税，鼓励商业往来，繁荣县域经济。\n效果：每日经济+3，金钱+20，治安-2',
    dailyEffect: {
      economy: 3,
      money: 20,
      order: -2,
    },
    cost: 80,
  },
  {
    id: 'policy_culture',
    name: '兴修文教',
    description: '修缮学宫，举办文会，提升县城文化氛围。\n效果：每日文化+3，声望+5，金钱-15',
    dailyEffect: {
      culture: 3,
      reputation: 5,
      money: -15,
    },
    cost: 100,
  },
];
