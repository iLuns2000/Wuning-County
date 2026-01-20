import { HashRouter, BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { Game } from '@/pages/Game';
import { NPCList } from '@/pages/NPCList';
import { TaskList } from '@/pages/TaskList';
import { Facilities } from '@/pages/Facilities';
import { Collection } from '@/pages/Collection';
import { Credits } from '@/pages/Credits';
import { Developer } from '@/pages/Developer';
import { Watermark } from '@/components/Watermark';

const isSingleFile = import.meta.env.MODE === 'singlefile';
const Router = isSingleFile ? HashRouter : BrowserRouter;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<Game />} />
        <Route path="/npcs" element={<NPCList />} />
        <Route path="/tasks" element={<TaskList />} />
        <Route path="/facilities" element={<Facilities />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="/developer" element={<Developer />} />
      </Routes>
      <Watermark />
    </Router>
  );
}

export default App;
