import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { useStore } from '../../store/useStore';

const pageTitles: Record<string, string> = {
  '/home': '首页',
  '/journal': '日志',
  '/notes': '笔记',
  '/gallery': '相册',
  '/vault': '文件库',
  '/ideas': '灵感',
  '/goals': '目标',
  '/timeline': '时间轴',
  '/reading': '收藏',
  '/guestbook': '留言',
  '/dashboard': '数据',
  '/settings': '设置',
};

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: 'easeIn' } },
};

export default function Layout() {
  const location = useLocation();
  const { theme, setTheme } = useStore();
  const title = pageTitles[location.pathname] || '数字花园';

  return (
    <div className="flex min-h-screen bg-bg-dark">
      <Sidebar />

      {/* Main content area */}
      <div className="ml-[240px] flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-xl bg-bg-dark/80 border-b border-border flex items-center justify-between px-8 py-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              {location.pathname.slice(1) || 'home'}
            </p>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all duration-200"
            aria-label="切换主题"
          >
            {theme === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </header>

        {/* Page content with animated transitions */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={pageVariants}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
