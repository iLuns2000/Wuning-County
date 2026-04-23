import { useEffect, useRef, useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';

export interface HelpTrigger {
  moduleId: string;
  condition: 'stay' | 'failure' | 'both';
  stayThreshold?: number;
  failureThreshold?: number;
  hintContent: {
    title: string;
    message: string;
    cta?: string;
  };
}

const MARKET_HELP_TRIGGERS: HelpTrigger[] = [
  {
    moduleId: 'market',
    condition: 'stay',
    stayThreshold: 30000,
    hintContent: {
      title: '市场交易技巧',
      message: '低买高卖是商人之道。关注价格走势，在低价时买入，高价时卖出。繁荣期卖，萧条期买。',
      cta: '知道了',
    },
  },
  {
    moduleId: 'market',
    condition: 'failure',
    failureThreshold: 3,
    hintContent: {
      title: '交易遇到困难？',
      message: '尝试关注市场状态：繁荣期卖出，萧条期买入。也可以先从小额交易开始熟悉行情。',
      cta: '查看任务',
    },
  },
];

const LEEK_GARDEN_HELP_TRIGGERS: HelpTrigger[] = [
  {
    moduleId: 'leekGarden',
    condition: 'stay',
    stayThreshold: 25000,
    hintContent: {
      title: '韭菜园玩法',
      message: '韭菜需要收割才能变现。但别割得太狠，留根才能继续生长。关注生长周期，适时收割。',
      cta: '知道了',
    },
  },
  {
    moduleId: 'leekGarden',
    condition: 'failure',
    failureThreshold: 2,
    hintContent: {
      title: '韭菜收割技巧',
      message: '每次收割会消耗体力。合理安排收割节奏，避免体力透支。优先收割成熟的韭菜。',
      cta: '查看任务',
    },
  },
];

const EXPLORE_HELP_TRIGGERS: HelpTrigger[] = [
  {
    moduleId: 'explore',
    condition: 'stay',
    stayThreshold: 20000,
    hintContent: {
      title: '探险准备',
      message: '外出探险会消耗体力，建议体力充足时出发。可先在城镇补充物资，了解目的地风险。',
      cta: '知道了',
    },
  },
];

export const CONTEXTUAL_HELP_TRIGGERS: Record<string, HelpTrigger[]> = {
  market: MARKET_HELP_TRIGGERS,
  leekGarden: LEEK_GARDEN_HELP_TRIGGERS,
  explore: EXPLORE_HELP_TRIGGERS,
};

interface UseContextualHelpOptions {
  moduleId: string;
  onHelpTrigger?: (hint: HelpTrigger) => void;
}

export const useContextualHelp = ({ moduleId, onHelpTrigger }: UseContextualHelpOptions) => {
  const entryTimeRef = useRef<number>(0);
  const shownHintsRef = useRef<Set<string>>(new Set());
  const { markHintShown, hintState } = useGameStore();

  const checkTriggers = useCallback(() => {
    const triggers = CONTEXTUAL_HELP_TRIGGERS[moduleId];
    if (!triggers) return;

    const stayDuration = Date.now() - entryTimeRef.current;
    const failureCount = hintState[`${moduleId}_failure`]?.count || 0;

    for (const trigger of triggers) {
      const hintKey = `${trigger.moduleId}_${trigger.condition}`;
      if (shownHintsRef.current.has(hintKey)) continue;

      let shouldTrigger = false;

      if (trigger.condition === 'stay' && trigger.stayThreshold) {
        shouldTrigger = stayDuration >= trigger.stayThreshold;
      } else if (trigger.condition === 'failure' && trigger.failureThreshold) {
        shouldTrigger = failureCount >= trigger.failureThreshold;
      } else if (trigger.condition === 'both' && trigger.stayThreshold && trigger.failureThreshold) {
        shouldTrigger = stayDuration >= trigger.stayThreshold && failureCount >= trigger.failureThreshold;
      }

      if (shouldTrigger) {
        shownHintsRef.current.add(hintKey);
        markHintShown(`${moduleId}_${trigger.condition}`);
        onHelpTrigger?.(trigger);
        break;
      }
    }
  }, [moduleId, hintState, markHintShown, onHelpTrigger]);

  useEffect(() => {
    entryTimeRef.current = Date.now();
    shownHintsRef.current.clear();

    const intervalId = setInterval(checkTriggers, 5000);

    return () => clearInterval(intervalId);
  }, [moduleId, checkTriggers]);

  const recordFailure = useCallback(() => {
    markHintShown(`${moduleId}_failure`);
  }, [moduleId, markHintShown]);

  return { recordFailure };
};

export const showModuleHelp = (moduleId: string): HelpTrigger | null => {
  const triggers = CONTEXTUAL_HELP_TRIGGERS[moduleId];
  if (!triggers || triggers.length === 0) return null;
  return triggers[0];
};