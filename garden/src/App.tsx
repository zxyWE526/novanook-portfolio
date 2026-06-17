import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Notes from './pages/Notes';
import Ideas from './pages/Ideas';
import Gallery from './pages/Gallery';
import Vault from './pages/Vault';
import Goals from './pages/Goals';
import Timeline from './pages/Timeline';
import Reading from './pages/Reading';
import Guestbook from './pages/Guestbook';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/vault" element={<Vault />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/reading" element={<Reading />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
