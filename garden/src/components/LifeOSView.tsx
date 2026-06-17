import { useEffect, useRef } from 'react';
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
  { id: 'life-home', label: '首页', comp: Home, bg: '#f5f6fa' },
  { id: 'life-journal', label: '日志', comp: Journal, bg: '#f0f2f8' },
  { id: 'life-notes', label: '笔记', comp: Notes, bg: '#f5f6fa' },
  { id: 'life-ideas', label: '灵感', comp: Ideas, bg: '#f0f2f8' },
  { id: 'life-gallery', label: '相册', comp: Gallery, bg: '#f5f6fa' },
  { id: 'life-vault', label: '文件', comp: Vault, bg: '#f0f2f8' },
  { id: 'life-goals', label: '目标', comp: Goals, bg: '#f5f6fa' },
  { id: 'life-timeline', label: '时间轴', comp: Timeline, bg: '#f0f2f8' },
  { id: 'life-reading', label: '收藏', comp: Reading, bg: '#f5f6fa' },
  { id: 'life-guestbook', label: '留言', comp: Guestbook, bg: '#f0f2f8' },
  { id: 'life-dashboard', label: '数据', comp: Dashboard, bg: '#f5f6fa' },
  { id: 'life-settings', label: '设置', comp: Settings, bg: '#f0f2f8' },
];

const COLORS = ['#f5f6fa','#f0f2f8','#faf5ff','#f5fffa','#fff5f5','#f5f5ff'];

export default function LifeOSView() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
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
    }, { threshold: 0.3, rootMargin: '-64px 0px 0px 0px' });

    document.querySelectorAll('.life-screen').forEach((el) => {
      observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="life-root">
      {SECTIONS.map((sec, i) => {
        const Comp = sec.comp;
        const bg = COLORS[i % COLORS.length];
        return (
          <section
            key={sec.id}
            id={sec.id}
            className="life-screen"
            style={{ background: bg }}
          >
            <div className="life-screen-inner">
              <div className="life-counter">{String(i + 1).padStart(2, '0')}</div>
              <div className="life-screen-content">
                <Comp />
              </div>
            </div>
          </section>
        );
      })}
      <style>{`
        .life-root {
          scroll-snap-type: y mandatory;
          overflow-y: scroll;
          height: 100vh;
        }
        .life-screen {
          min-height: 100vh;
          scroll-snap-align: start;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 80px 24px 40px;
          position: relative;
          transition: background 0.5s ease;
        }
        .life-screen-inner {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          position: relative;
        }
        .life-counter {
          position: absolute;
          top: -12px;
          left: 0;
          font-family: 'Space Grotesk', monospace;
          font-size: 12px;
          font-weight: 600;
          color: rgba(0,0,0,0.08);
          letter-spacing: 0.15em;
        }
        .life-screen-content {
          background: #fff;
          border-radius: 18px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.04);
          padding: 28px 32px;
          min-height: 60vh;
          animation: screenIn 0.4s ease both;
          transition: box-shadow 0.3s, transform 0.3s;
        }
        .life-screen-content:hover {
          box-shadow: 0 8px 30px rgba(0,0,0,0.06);
        }
        @keyframes screenIn {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 640px) {
          .life-screen { padding: 72px 12px 24px; }
          .life-screen-content { padding: 16px; border-radius: 12px; }
        }
      `}</style>
    </div>
  );
}
