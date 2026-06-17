import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const statuses = [
  '打造我的 Life OS',
  '学习新知识',
  '探索想法',
  '记录笔记',
  '捕捉瞬间',
];

const activities = [
  { label: '更新了项目笔记', time: '2小时前', type: 'note' },
  { label: '添加了新日记', time: '5小时前', type: 'journal' },
  { label: '完成了本周目标', time: '1天前', type: 'goal' },
  { label: '上传了相册照片', time: '2天前', type: 'photo' },
  { label: '开始阅读《沙丘》', time: '3天前', type: 'reading' },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const duration = 1500;
          const steps = 30;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function Home() {
  const { stats } = useStore();
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statuses.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const statItems = [
    { label: '日记', value: stats.totalJournals, suffix: '', icon: 'pen' },
    { label: '笔记', value: stats.totalNotes, suffix: '', icon: 'book' },
    { label: '照片', value: stats.totalPhotos, suffix: '', icon: 'image' },
    { label: '灵感', value: stats.totalIdeas, suffix: '', icon: 'bulb' },
    { label: '目标', value: stats.totalGoals, suffix: '', icon: 'target' },
  ];

  return (
    <div className="p-8 space-y-10">
      {/* Greeting section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-5xl font-bold font-['Space_Grotesk'] tracking-tight">
          <span className="bg-gradient-to-r from-[#6C63FF] to-[#E26EE5] bg-clip-text text-transparent">
            你好，我是 Lnyeon
          </span>
        </h1>
        <motion.p
          key={statusIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          className="text-lg text-text-secondary font-light"
        >
          {statuses[statusIndex]}
        </motion.p>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-5 gap-4"
      >
        {statItems.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + idx * 0.08 }}
            className="bg-bg-card border border-border rounded-xl p-5 hover:bg-bg-hover transition-colors duration-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-accent-light">
                <StatIcon name={stat.icon} />
              </span>
              <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
            <span className="text-3xl font-bold font-['Space_Grotesk'] text-text-primary">
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Activity feed */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="bg-bg-card border border-border rounded-xl p-6"
      >
        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
          最近动态
        </h3>
        <div className="space-y-3">
          {activities.map((activity, idx) => (
            <motion.div
              key={activity.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.6 + idx * 0.06 }}
              className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-bg-hover transition-colors duration-200 group"
            >
              <span className="text-accent-light flex-shrink-0">
                <ActivityIcon type={activity.type} />
              </span>
              <span className="flex-1 text-sm text-text-primary">{activity.label}</span>
              <span className="text-xs text-text-secondary/60">{activity.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StatIcon({ name }: { name: string }) {
  const size = 16;
  switch (name) {
    case 'pen':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      );
    case 'book':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      );
    case 'image':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      );
    case 'bulb':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A3.86 3.86 0 0 1 8.91 14"/>
        </svg>
      );
    case 'target':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
        </svg>
      );
    default:
      return null;
  }
}

function ActivityIcon({ type }: { type: string }) {
  const size = 14;
  switch (type) {
    case 'note':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
      );
    case 'journal':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      );
    case 'goal':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
        </svg>
      );
    case 'photo':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      );
    case 'reading':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      );
    default:
      return null;
  }
}
