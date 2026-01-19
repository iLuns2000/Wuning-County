export interface Fortune {
  summary: string;
  text: string;
}

export const fortunes: Fortune[] = [
  { summary: "中吉", text: "云开月明，静待花开。" },
  { summary: "中吉", text: "春风得意，马蹄疾香。" },
  { summary: "小吉", text: "东风借力，顺水推舟。" },
  { summary: "小吉", text: "柳暗花明，转角遇喜。" },
  { summary: "平", text: "无风无浪，亦无波澜。" },
  { summary: "平", text: "行到水穷处，坐看云起时。" },
  { summary: "平", text: "心中若有桃花源，何处不是水云间。" },
  { summary: "末吉", text: "塞翁失马，焉知非福。" },
  { summary: "末吉", text: "守得云开见月明。" },
  { summary: "小凶", text: "慎言慎行，静守己心。" },
  { summary: "小凶", text: "莫道昆明池水浅，观鱼胜过富春江。" }, // Ambiguous, suggesting caution/observation
  { summary: "小凶", text: "退一步海阔天空。" },
];
