/*
 * @Author: xyZhan
 * @Date: 2026-01-19 15:02:38
 * @LastEditors: xyZhan
 * @LastEditTime: 2026-01-20 13:55:30
 * @FilePath: \textgame\src\App.tsx
 * @Description: 
 * 
 * Copyright (c) 2026 by , All Rights Reserved. 
 */
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Game } from '@/pages/Game';
import { NPCList } from '@/pages/NPCList';
import { NPCDetail } from '@/pages/NPCDetail';
import { TaskList } from '@/pages/TaskList';
import { Facilities } from '@/pages/Facilities';
import { Buildings } from '@/pages/Buildings';
import { Collection } from '@/pages/Collection';
import { Credits } from '@/pages/Credits';
import { Developer } from '@/pages/Developer';
import { Watermark } from '@/components/Watermark';

import { MobileLogToast } from '@/components/MobileLogToast';
import { useTheme } from '@/hooks/useTheme';

const Router = HashRouter;

function App() {
  useTheme();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/npcs" element={<NPCList />} />
        <Route path="/npcs/:id" element={<NPCDetail />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/buildings" element={<Buildings />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/developer" element={<Developer />} />
      </Routes>
      <MobileLogToast />
      <Watermark />
      <div className="fixed bottom-2 left-0 w-full text-center z-40 text-[10px] md:text-xs text-muted-foreground/40 pointer-events-none select-none">
        <a 
          href="https://beian.miit.gov.cn/" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="transition-colors pointer-events-auto hover:text-muted-foreground/80"
        >
          苏ICP备2026005123号
        </a>
      </div>
    </Router>
  );
}

export default App;
