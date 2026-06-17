import { useEffect, useRef, useCallback } from 'react';
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
  { id: 'life-home', label: '首页', icon: '◈', comp: Home },
  { id: 'life-journal', label: '日志', icon: '◇', comp: Journal },
  { id: 'life-notes', label: '笔记', icon: '□', comp: Notes },
  { id: 'life-ideas', label: '灵感', icon: '○', comp: Ideas },
  { id: 'life-gallery', label: '相册', icon: '◎', comp: Gallery },
  { id: 'life-vault', label: '文件', icon: '▽', comp: Vault },
  { id: 'life-goals', label: '目标', icon: '△', comp: Goals },
  { id: 'life-timeline', label: '时间轴', icon: '◈', comp: Timeline },
  { id: 'life-reading', label: '收藏', icon: '☆', comp: Reading },
  { id: 'life-guestbook', label: '留言', icon: '◇', comp: Guestbook },
  { id: 'life-dashboard', label: '数据', icon: '◈', comp: Dashboard },
  { id: 'life-settings', label: '设置', icon: '◎', comp: Settings },
];

export default function LifeOSView() {
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);

  // 滚动到当前 section 时高亮导航
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if (id) {
            document.querySelectorAll('.nav-link').forEach((el) => el.classList.remove('active'));
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (link) link.classList.add('active');
          }
        }
      });
    }, { threshold: 0.2, rootMargin: '-64px 0px 0px 0px' });

    sectionRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ paddingTop: 0 }}>
      {SECTIONS.map((sec, i) => {
        const Comp = sec.comp;
        return (
          <section
            key={sec.id}
            id={sec.id}
            ref={(el) => { sectionRefs.current[i] = el; }}
            className="life-section"
          >
            <div className="life-card">
              <Comp />
            </div>
          </section>
        );
      })}
      <style>{`
        .life-section {
          scroll-margin-top: 72px;
          padding: 16px 0;
          opacity:0;
          animation: fadeUp 0.5s ease forwards;
          animation-delay: ${SECTIONS.length * 0.05}s;
        }
        .life-section:nth-child(1) { animation-delay: 0.05s; }
        .life-section:nth-child(2) { animation-delay: 0.1s; }
        .life-section:nth-child(3) { animation-delay: 0.15s; }
        .life-section:nth-child(4) { animation-delay: 0.2s; }
        .life-section:nth-child(5) { animation-delay: 0.25s; }
        .life-section:nth-child(6) { animation-delay: 0.3s; }
        .life-section:nth-child(7) { animation-delay: 0.35s; }
        .life-section:nth-child(8) { animation-delay: 0.4s; }
        .life-section:nth-child(9) { animation-delay: 0.45s; }
        .life-section:nth-child(10) { animation-delay: 0.5s; }
        .life-section:nth-child(11) { animation-delay: 0.55s; }
        .life-section:nth-child(12) { animation-delay: 0.6s; }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(20px); }
          to { opacity:1; transform:translateY(0); }
        }
        .life-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
          padding: 24px;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .life-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
        }
        @media (max-width: 640px) {
          .life-card { padding: 16px; border-radius: 10px; }
          .life-section { padding: 10px 0; }
        }
      `}</style>
    </div>
  );
}
