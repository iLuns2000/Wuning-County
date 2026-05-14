/**
 * 将微博 JSON 数据转换为 scrollContents.ts
 * 用法: node scripts/convertScrolls.cjs
 */
const fs = require('fs');
const path = require('path');

const INPUT = path.join(__dirname, '../src/1836589294.json');
const OUTPUT = path.join(__dirname, '../src/data/scrollContents.ts');

const d = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
const valid = d.weibos.filter(w => w.content && w.content.trim().length > 0);

function cleanContent(raw) {
  let s = raw;
  s = s.replace(/\r?\n/g, ' ');
  s = s.replace(/\t/g, ' ');
  s = s.replace(/\s*显示地图\s*.*$/, '');
  s = s.replace(/\s*\[组图共\d+张\].*$/, '');
  s = s.replace(/\s*\[视频\].*$/, '');
  s = s.replace(/\s*原图\s*已?\s*$/, '');
  s = s.replace(/\s*已\s*$/, '');
  s = s.replace(/\s*展开全文c\s*$/, '');
  s = s.replace(/\s*收起\s*$/, '');
  s = s.replace(/\s*网页链接\s*$/, '');
  s = s.replace(/  +/g, ' ');
  s = s.replace(/\s+\[\s*$/, '');
  return s.trim();
}

function escapeTS(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/"/g, '\\"')
    .replace(/`/g, '\\`');
}

const entries = valid
  .map(w => ({
    text: cleanContent(w.content),
    phoneModel: w.tool || '未知设备',
    publishDate: w.publish_time,
  }))
  .filter(e => e.text.length >= 1);

let out = '// Auto-generated from scroll data\n';
out += 'export interface ScrollContent {\n';
out += '  text: string;\n';
out += '  phoneModel: string;\n';
out += '  publishDate: string;\n';
out += '}\n\n';
out += 'export const scrollContents: ScrollContent[] = [\n';

entries.forEach((e, i) => {
  const t = escapeTS(e.text);
  const m = escapeTS(e.phoneModel);
  const d = escapeTS(e.publishDate);
  out += `  { text: "${t}", phoneModel: "${m}", publishDate: "${d}" }`;
  out += (i < entries.length - 1) ? ',\n' : ',\n';
});

out += '];\n';

fs.writeFileSync(OUTPUT, out, 'utf-8');
console.log(`Done! ${entries.length} entries written to ${OUTPUT}`);
