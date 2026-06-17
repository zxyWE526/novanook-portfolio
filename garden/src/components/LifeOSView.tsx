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

interface SectionDef {
  id: string; label: string; comp: React.ComponentType; accent: string; num: string;
}

const SECTIONS: SectionDef[] = [
  { id: 'life-home', label: '首页', comp: Home, accent: '#6C63FF', num: '01' },
  { id: 'life-journal', label: '日志', comp: Journal, accent: '#E26EE5', num: '02' },
  { id: 'life-notes', label: '笔记', comp: Notes, accent: '#34D399', num: '03' },
  { id: 'life-ideas', label: '灵感', comp: Ideas, accent: '#F59E0B', num: '04' },
  { id: 'life-gallery', label: '相册', comp: Gallery, accent: '#F472B6', num: '05' },
  { id: 'life-vault', label: '文件', comp: Vault, accent: '#60A5FA', num: '06' },
  { id: 'life-goals', label: '目标', comp: Goals, accent: '#A78BFA', num: '07' },
  { id: 'life-timeline', label: '时间轴', comp: Timeline, accent: '#FBBF24', num: '08' },
  { id: 'life-reading', label: '收藏', comp: Reading, accent: '#34D399', num: '09' },
  { id: 'life-guestbook', label: '留言', comp: Guestbook, accent: '#FB923C', num: '10' },
  { id: 'life-dashboard', label: '数据', comp: Dashboard, accent: '#6C63FF', num: '11' },
  { id: 'life-settings', label: '设置', comp: Settings, accent: '#8E8E96', num: '12' },
];

const BG_LIGHT = '#f5f6fa';
const BG_DIM = '#f0f1f6';

export default function LifeOSView() {
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
    }, { threshold: 0.3, rootMargin: '-64px 0px 0px 0px' });

    document.querySelectorAll('.life-screen').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="life-root">
      {SECTIONS.map((sec, i) => {
        const Comp = sec.comp;
        const bg = i % 2 === 0 ? BG_LIGHT : BG_DIM;
        return (
          <section
            key={sec.id}
            id={sec.id}
            className="life-screen"
            style={{ background: bg }}
          >
            {/* 顶部渐变装饰条 */}
            <div className="life-accent" style={{ background: sec.accent }} />

            {/* 超大背景数字 */}
            <div className="life-bg-num">{sec.num}</div>

            {/* 内容区 */}
            <div className="life-content-wrap">
              <div className="life-content-header">
                <span className="life-label" style={{ color: sec.accent }}>{sec.label}</span>
                <div className="life-hr" style={{ background: sec.accent, opacity: 0.15 }} />
              </div>
              <div className="life-content">
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
          min-height: 100dvh;
        }
        .life-screen {
          min-height: 100dvh;
          scroll-snap-align: start;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 88px 40px 40px;
          transition: background 0.4s ease;
        }
        .life-accent {
          position: absolute; top: 0; left: 0; right: 0;
          height: 4px; z-index: 1;
          transition: height 0.3s ease;
        }
        .life-screen:hover .life-accent {
          height: 6px;
        }
        .life-bg-num {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          font-family: 'Space Grotesk', monospace;
          font-size: clamp(200px, 40vw, 400px);
          font-weight: 800;
          color: rgba(0,0,0,0.025);
          pointer-events: none;
          user-select: none;
          line-height: 1;
        }
        .life-content-wrap {
          width: 100%;
          max-width: 1000px;
          position: relative;
          z-index: 1;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both;
        }
        .life-content-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }
        .life-label {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .life-hr {
          flex: 1;
          height: 1px;
        }
        .life-content {
          width: 100%;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .life-screen { padding: 72px 16px 24px; }
          .life-content-header { margin-bottom: 16px; gap: 8px; }
          .life-label { font-size: 10px; }
        }
      `}</style>
    </div>
  );
}
