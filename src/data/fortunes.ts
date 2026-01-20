export interface Fortune {
  summary: string;
  text: string;
  level: 'great_blessing' | 'blessing' | 'normal' | 'bad_luck' | 'terrible_luck';
}

export const fortunes: Fortune[] = [
  { summary: "大吉", text: "鸿运当头，万事如意。", level: 'great_blessing' },
  { summary: "中吉", text: "云开月明，静待花开。", level: 'blessing' },
  { summary: "中吉", text: "春风得意，马蹄疾香。", level: 'blessing' },
  { summary: "小吉", text: "东风借力，顺水推舟。", level: 'blessing' },
  { summary: "小吉", text: "柳暗花明，转角遇喜。", level: 'blessing' },
  { summary: "平", text: "无风无浪，亦无波澜。", level: 'normal' },
  { summary: "平", text: "行到水穷处，坐看云起时。", level: 'normal' },
  { summary: "平", text: "心中若有桃花源，何处不是水云间。", level: 'normal' },
  { summary: "末吉", text: "塞翁失马，焉知非福。", level: 'bad_luck' },
  { summary: "末吉", text: "守得云开见月明。", level: 'bad_luck' },
  { summary: "小凶", text: "慎言慎行，静守己心。", level: 'bad_luck' },
  { summary: "小凶", text: "莫道昆明池水浅，观鱼胜过富春江。", level: 'bad_luck' },
  { summary: "小凶", text: "退一步海阔天空。", level: 'bad_luck' },
  { summary: "大凶", text: "诸事不宜，静待时机。", level: 'terrible_luck' },
];
