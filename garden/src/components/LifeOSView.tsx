import Home from '../pages/Home';
import Journal from '../pages/Journal';
import Notes from '../pages/Notes';
import Ideas from '../pages/Ideas';
import Gallery from '../pages/Gallery';
import Vault from '../pages/Vault';
import Goals from '../pages/Goals';
import Timeline from '../pages/Timeline';
import Reading from '../pages/Reading';
import Guestbook from '../pages/Guestbook';
import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';

const SECTIONS = [
  { id: 'life-home', label: '首页', component: Home },
  { id: 'life-journal', label: '日志', component: Journal },
  { id: 'life-notes', label: '笔记', component: Notes },
  { id: 'life-ideas', label: '灵感', component: Ideas },
  { id: 'life-gallery', label: '相册', component: Gallery },
  { id: 'life-vault', label: '文件', component: Vault },
  { id: 'life-goals', label: '目标', component: Goals },
  { id: 'life-timeline', label: '时间轴', component: Timeline },
  { id: 'life-reading', label: '收藏', component: Reading },
  { id: 'life-guestbook', label: '留言', component: Guestbook },
  { id: 'life-dashboard', label: '数据', component: Dashboard },
  { id: 'life-settings', label: '设置', component: Settings },
];

export default function LifeOSView() {
  return (
    <div>
      {SECTIONS.map((sec) => {
        const Comp = sec.component;
        return (
          <section key={sec.id} id={sec.id} className="life-section">
            <Comp />
          </section>
        );
      })}
      <style>{`
        .life-section { scroll-margin-top: 64px; }
      `}</style>
    </div>
  );
}
