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
import { TaskList } from '@/pages/TaskList';
import { Facilities } from '@/pages/Facilities';
import { Buildings } from '@/pages/Buildings';
import { Collection } from '@/pages/Collection';
import { Credits } from '@/pages/Credits';
import { Developer } from '@/pages/Developer';
import { Watermark } from '@/components/Watermark';

const Router = HashRouter;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/npcs" element={<NPCList />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/buildings" element={<Buildings />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/developer" element={<Developer />} />
      </Routes>
      <Watermark />
    </Router>
  );
}

export default App;
