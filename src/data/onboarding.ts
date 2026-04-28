export interface GuideStepConfig {
  title: string;
  content: string;
  targetId?: string;
}

export interface OnboardingConfig {
  merchant: GuideStepConfig[];
  magistrate: GuideStepConfig[];
  hero: GuideStepConfig[];
}

export const onboardingConfig: OnboardingConfig = {
  merchant: [
    {
      title: '欢迎来到无宁县',
      content: '作为商人，您的目标是精打细算积累财富。通过低买高卖赚取利润，扩建商队，做大生意。',
    },
    {
      title: '买卖货物',
      content: '点击西市集购买低价货物，再以更高价格出售。关注价格波动，把握商机。',
      targetId: 'guide-market-btn',
    },
    {
      title: '接受任务',
      content: '点击任务记录查看当前任务。完成任务可获得丰厚奖励，助力您的商业帝国。',
      targetId: 'guide-task-btn',
    },
  ],
  magistrate: [
    {
      title: '欢迎来到无宁县',
      content: '作为县令，您的目标是造福百姓、整顿吏治。勤政爱民，让无宁县繁荣昌盛。',
    },
    {
      title: '处理公务',
      content: '点击县衙办公室处理日常公务。合理决策会影响治安、民心、经济等多方面。',
      targetId: 'guide-office-btn',
    },
    {
      title: '接受任务',
      content: '点击任务记录查看当前任务。完成任务可获得政绩，推动仕途发展。',
      targetId: 'guide-task-btn',
    },
  ],
  hero: [
    {
      title: '欢迎来到无宁县',
      content: '作为侠客，您的目标是快意恩仇、行侠仗义。修炼武艺，结交豪杰，成就一番事业。',
    },
    {
      title: '历练江湖',
      content: '点击历炼进行探索。江湖险恶，机遇与危险并存，每次历练都是成长的机会。',
      targetId: 'guide-explore-btn',
    },
    {
      title: '接受任务',
      content: '点击任务记录查看当前任务。完成任务可获得声望和阅历，提升实力。',
      targetId: 'guide-task-btn',
    },
  ],
};

export const getGuideStepsForRole = (role: string | null): GuideStepConfig[] => {
  if (role === 'merchant') {
    return onboardingConfig.merchant;
  }
  if (role === 'magistrate') {
    return onboardingConfig.magistrate;
  }
  if (role === 'hero') {
    return onboardingConfig.hero;
  }
  return onboardingConfig.merchant;
};
