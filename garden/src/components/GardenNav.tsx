import { useEffect, useRef } from 'react';

interface Tab {
  key: string;
  label: string;
  icon: string;
}

interface Props {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export default function GardenNav({ tabs, activeTab, onTabChange }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const offset = el.offsetLeft - container.offsetLeft - 16;
      container.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div className="garden-nav-wrap">
      <div className="garden-nav-inner">
        <div className="garden-nav-scroll" ref={scrollRef}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              ref={tab.key === activeTab ? activeRef : undefined}
              onClick={() => onTabChange(tab.key)}
              className={`garden-tab ${tab.key === activeTab ? 'active' : ''}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <style>{`
        .garden-nav-wrap {
          position: sticky; top: 0; z-index: 50;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .garden-nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; }
        .garden-nav-scroll {
          display: flex; gap: 4px; overflow-x: auto;
          scrollbar-width: none; padding: 8px 0;
          -webkit-overflow-scrolling: touch;
        }
        .garden-nav-scroll::-webkit-scrollbar { display: none; }
        .garden-tab {
          flex-shrink: 0; padding: 8px 18px; border: none;
          border-radius: 8px; font-size: 13px; font-weight: 500;
          background: transparent; color: #666; cursor: pointer;
          transition: all 0.2s;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .garden-tab:hover { background: rgba(108,99,255,0.06); color: #333; }
        .garden-tab.active {
          background: rgba(108,99,255,0.1); color: #6C63FF; font-weight: 600;
        }
        .garden-content {
          max-width: 1100px; margin: 0 auto; padding: 24px;
          min-height: 400px;
        }
        @media (max-width: 640px) {
          .garden-content { padding: 16px; }
          .garden-tab { padding: 6px 14px; font-size: 12px; }
        }
      `}</style>
    </div>
  );
}
