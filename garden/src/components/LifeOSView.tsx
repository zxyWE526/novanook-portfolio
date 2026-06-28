import { useEffect, useRef } from 'react';
import Home from '../pages/Home';
import Journal from '../pages/Journal';
import Notes from '../pages/Notes';
import Ideas from '../pages/Ideas';
import Gallery from '../pages/Footprint';
import Vault from '../pages/Vault';
import Goals from '../pages/Goals';
import Timeline from '../pages/Timeline';
import Reading from '../pages/Reading';
import Guestbook from '../pages/Guestbook';
import Dashboard from '../pages/Dashboard';
import Settings from '../pages/Settings';
import CRM from '../pages/CRM';

interface SectionDef {
  id: string; label: string; comp: React.ComponentType; color: string; num: string;
}

const COLORS = [
  { base: '#6366f1', soft: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.12)' },
  { base: '#ec4899', soft: 'rgba(236,72,153,0.06)', border: 'rgba(236,72,153,0.12)' },
  { base: '#10b981', soft: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.12)' },
  { base: '#f59e0b', soft: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.12)' },
  { base: '#f472b6', soft: 'rgba(244,114,182,0.06)', border: 'rgba(244,114,182,0.12)' },
  { base: '#3b82f6', soft: 'rgba(59,130,246,0.06)', border: 'rgba(59,130,246,0.12)' },
  { base: '#8b5cf6', soft: 'rgba(139,92,246,0.06)', border: 'rgba(139,92,246,0.12)' },
  { base: '#f59e0b', soft: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.12)' },
  { base: '#10b981', soft: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.12)' },
  { base: '#f97316', soft: 'rgba(249,115,22,0.06)', border: 'rgba(249,115,22,0.12)' },
  { base: '#6366f1', soft: 'rgba(99,102,241,0.06)', border: 'rgba(99,102,241,0.12)' },
  { base: '#6b7280', soft: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.12)' },
  { base: '#f59e0b', soft: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.12)' },
];

const SECTIONS: SectionDef[] = [
  { id: 'life-home', label: '首页', comp: Home, color: '#6366f1', num: '01' },
  { id: 'life-journal', label: '日志', comp: Journal, color: '#ec4899', num: '02' },
  { id: 'life-notes', label: '笔记', comp: Notes, color: '#10b981', num: '03' },
  { id: 'life-ideas', label: '灵感', comp: Ideas, color: '#f59e0b', num: '04' },
  { id: 'life-gallery', label: '足迹', comp: Gallery, color: '#f472b6', num: '05' },
  { id: 'life-vault', label: '文件', comp: Vault, color: '#3b82f6', num: '06' },
  { id: 'life-goals', label: '目标', comp: Goals, color: '#8b5cf6', num: '07' },
  { id: 'life-timeline', label: '时间轴', comp: Timeline, color: '#f59e0b', num: '08' },
  { id: 'life-reading', label: '收藏', comp: Reading, color: '#10b981', num: '09' },
  { id: 'life-guestbook', label: '留言', comp: Guestbook, color: '#f97316', num: '10' },
  { id: 'life-dashboard', label: '数据', comp: Dashboard, color: '#6366f1', num: '11' },
  { id: 'life-settings', label: '设置', comp: Settings, color: '#6b7280', num: '12' },
  { id: 'life-crm', label: 'CRM', comp: CRM, color: '#f59e0b', num: '13' },
];

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

    const els = document.querySelectorAll('.life-screen');
    els.forEach((el) => observerRef.current?.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  return (
    <div className="life-root">
      {SECTIONS.map((sec, i) => {
        const c = COLORS[i];
        const Comp = sec.comp;
        return (
          <section
            key={sec.id}
            id={sec.id}
            className="life-screen"
            style={{ background: c.soft }}
          >
            <div className="life-bar" style={{ background: sec.color }} />
            <div className="life-number">{sec.num}</div>
            <div className="life-content-wrap">
              <div className="life-header">
                <span className="life-tag" style={{ color: sec.color, borderColor: c.border }}>{sec.label}</span>
                <div className="life-divider" style={{ background: c.border }} />
              </div>
              <div className="life-body">
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
        .life-bar {
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px; z-index: 1;
          transition: height 0.25s ease, opacity 0.25s ease;
        }
        .life-screen:hover .life-bar { height: 4px; }
        .life-number {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: clamp(180px, 35vw, 360px);
          font-weight: 700;
          color: rgba(0,0,0,0.025);
          pointer-events: none;
          user-select: none;
          line-height: 1;
          letter-spacing: -0.04em;
        }
        .life-content-wrap {
          width: 100%;
          max-width: 1000px;
          position: relative;
          z-index: 1;
        }
        .life-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .life-tag {
          font-family: 'Inter', -apple-system, sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          flex-shrink: 0;
          border: 1px solid;
          border-radius: 4px;
          padding: 3px 10px;
          transition: all 0.2s ease;
          cursor: default;
        }
        .life-screen:hover .life-tag {
          background: var(--tag-bg, transparent);
        }
        .life-divider {
          flex: 1;
          height: 1px;
        }
        .life-body {
          width: 100%;
        }
        @media (max-width: 640px) {
          .life-screen { padding: 72px 16px 24px; }
          .life-header { margin-bottom: 16px; gap: 8px; }
          .life-tag { font-size: 9px; padding: 2px 8px; }
          .life-number { display: none; }
        }
      `}</style>
    </div>
  );
}
