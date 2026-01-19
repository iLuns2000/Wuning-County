import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Game } from '@/pages/Game';
import { NPCList } from '@/pages/NPCList';
import { TaskList } from '@/pages/TaskList';
import { Facilities } from '@/pages/Facilities';
import { Collection } from '@/pages/Collection';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/npcs" element={<NPCList />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/collection" element={<Collection />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
