/*
 * @Author: xyZhan
 * @Date: 2026-04-03 09:56:21
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-04-03 09:56:34
 * @FilePath: \textgame\src\data\fix.js
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
const fs = require('fs');
const iconv = require('iconv-lite');

// 读原文件（二进制）
const buf = fs.readFileSync('events.ts');

// 按 GBK 解码，再转成 UTF-8
const str = iconv.decode(buf, 'gbk');

// 写回 UTF-8
fs.writeFileSync('events_fixed.ts', str, 'utf8');

console.log('修复完成');