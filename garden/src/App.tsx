import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/journal" element={<div className="p-8 text-text-secondary">Journal</div>} />
        <Route path="/notes" element={<div className="p-8 text-text-secondary">Notes</div>} />
        <Route path="/gallery" element={<div className="p-8 text-text-secondary">Gallery</div>} />
        <Route path="/vault" element={<div className="p-8 text-text-secondary">Vault</div>} />
        <Route path="/ideas" element={<div className="p-8 text-text-secondary">Ideas</div>} />
        <Route path="/goals" element={<div className="p-8 text-text-secondary">Goals</div>} />
        <Route path="/timeline" element={<div className="p-8 text-text-secondary">Timeline</div>} />
        <Route path="/reading" element={<div className="p-8 text-text-secondary">Reading</div>} />
        <Route path="/guestbook" element={<div className="p-8 text-text-secondary">Guestbook</div>} />
        <Route path="/dashboard" element={<div className="p-8 text-text-secondary">Dashboard</div>} />
        <Route path="/settings" element={<div className="p-8 text-text-secondary">Settings</div>} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Route>
    </Routes>
  );
}
