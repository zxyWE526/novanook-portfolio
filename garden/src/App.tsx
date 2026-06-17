import { useState } from 'react';
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
import GardenNav from './components/GardenNav';

const TABS = [
  { key: 'home', label: '首页', icon: '◈' },
  { key: 'journal', label: '日志', icon: '◇' },
  { key: 'notes', label: '笔记', icon: '□' },
  { key: 'ideas', label: '灵感', icon: '○' },
  { key: 'gallery', label: '相册', icon: '◎' },
  { key: 'vault', label: '文件', icon: '▽' },
  { key: 'goals', label: '目标', icon: '△' },
  { key: 'timeline', label: '时间轴', icon: '△' },
  { key: 'reading', label: '收藏', icon: '☆' },
  { key: 'guestbook', label: '留言', icon: '◇' },
  { key: 'dashboard', label: '数据', icon: '◈' },
  { key: 'settings', label: '设置', icon: '◎' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Home />;
      case 'journal': return <Journal />;
      case 'notes': return <Notes />;
      case 'ideas': return <Ideas />;
      case 'gallery': return <Gallery />;
      case 'vault': return <Vault />;
      case 'goals': return <Goals />;
      case 'timeline': return <Timeline />;
      case 'reading': return <Reading />;
      case 'guestbook': return <Guestbook />;
      case 'dashboard': return <Dashboard />;
      case 'settings': return <Settings />;
      default: return <Home />;
    }
  };

  return (
    <div className="garden-app">
      <GardenNav tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="garden-content">
        {renderContent()}
      </div>
    </div>
  );
}
