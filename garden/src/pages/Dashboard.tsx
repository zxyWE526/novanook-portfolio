import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

function AnimatedCount({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setCount(0);
      return;
    }
    setCount(0);
    const duration = 800;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return <span>{count}</span>;
}

function StatCard({
  icon,
  count,
  label,
  delay,
}: {
  icon: JSX.Element;
  count: number;
  label: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-bg-card rounded-xl p-5 border border-border"
    >
      <div className="flex items-center gap-3 mb-3">
        <span className="text-accent">{icon}</span>
        <span className="text-sm text-text-secondary">{label}</span>
      </div>
      <div className="text-3xl font-bold font-['Space_Grotesk'] text-text-primary">
        <AnimatedCount value={count} />
      </div>
    </motion.div>
  );
}

function RecentItem({
  type,
  title,
  date,
}: {
  type: string;
  title: string;
  date: string;
}) {
  const typeStyles: Record<string, string> = {
    journal: 'bg-accent/20 text-accent',
    note: 'bg-blue-500/20 text-blue-400',
    photo: 'bg-green-500/20 text-green-400',
    file: 'bg-orange-500/20 text-orange-400',
    idea: 'bg-yellow-500/20 text-yellow-400',
    goal: 'bg-purple-500/20 text-purple-400',
    timeline: 'bg-pink-500/20 text-pink-400',
    reading: 'bg-cyan-500/20 text-cyan-400',
    message: 'bg-success/20 text-success',
  };
  const typeLabels: Record<string, string> = {
    journal: '日记',
    note: '笔记',
    photo: '照片',
    file: '文件',
    idea: '想法',
    goal: '目标',
    timeline: '时间线',
    reading: '阅读',
    message: '留言',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-3 px-4 rounded-lg hover:bg-bg-hover transition-colors"
    >
      <span
        className={`px-2 py-0.5 rounded text-xs font-medium shrink-0 ${
          typeStyles[type] || 'bg-bg-hover text-text-secondary'
        }`}
      >
        {typeLabels[type] || type}
      </span>
      <span className="flex-1 text-sm text-text-primary truncate">{title}</span>
      <span className="text-xs text-text-secondary shrink-0">
        {new Date(date).toLocaleDateString('zh-CN')}
      </span>
    </motion.div>
  );
}

/* SVG icon components */
function JournalIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  );
}

function PhotoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  );
}

export default function Dashboard() {
  const { stats, readings, messages, journals, notes, photos, files, ideas, goals, timeline } = useStore();

  // Build recent activity list from all available module data
  const recentItems = [
    ...journals.map((r) => ({ id: `journal-${r.id}`, type: 'journal' as const, title: r.title, date: r.createdAt })),
    ...notes.map((r) => ({ id: `note-${r.id}`, type: 'note' as const, title: r.title, date: r.createdAt })),
    ...photos.map((r) => ({ id: `photo-${r.id}`, type: 'photo' as const, title: r.caption || 'Photo', date: r.uploadedAt })),
    ...files.map((r) => ({ id: `file-${r.id}`, type: 'file' as const, title: r.name, date: r.createdAt })),
    ...ideas.map((r) => ({ id: `idea-${r.id}`, type: 'idea' as const, title: r.content.slice(0, 60), date: r.createdAt })),
    ...goals.map((r) => ({ id: `goal-${r.id}`, type: 'goal' as const, title: r.title, date: r.createdAt })),
    ...timeline.map((r) => ({ id: `timeline-${r.id}`, type: 'timeline' as const, title: r.title, date: r.date })),
    ...readings.map((r) => ({ id: `reading-${r.id}`, type: 'reading' as const, title: r.title, date: r.createdAt })),
    ...messages.map((m) => ({
      id: `message-${m.id}`,
      type: 'message' as const,
      title: `${m.name}: ${m.content.slice(0, 40)}${m.content.length > 40 ? '...' : ''}`,
      date: m.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const statCards = [
    { icon: <JournalIcon />, count: stats.totalJournals, label: '日记', delay: 0 },
    { icon: <NoteIcon />, count: stats.totalNotes, label: '笔记', delay: 0.05 },
    { icon: <PhotoIcon />, count: stats.totalPhotos, label: '照片', delay: 0.1 },
    { icon: <FileIcon />, count: stats.totalFiles, label: '文件', delay: 0.15 },
  ];

  const secondaryStats = [
    { label: '想法', count: stats.totalIdeas },
    { label: '目标', count: stats.totalGoals },
    { label: '时间线事件', count: timeline.length },
    { label: '阅读', count: readings.length },
    { label: '留言', count: messages.length },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Top row - 4 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            count={card.count}
            label={card.label}
            delay={card.delay}
          />
        ))}
      </div>

      {/* Second row - per-module breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-bg-card rounded-xl p-6 border border-border mb-8"
      >
        <h3 className="text-sm font-medium text-text-secondary/70 uppercase tracking-wider mb-4">
          各模块统计
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {secondaryStats.map((stat) => (
            <div key={stat.label} className="text-center p-4 rounded-lg bg-bg-dark">
              <div className="text-2xl font-bold font-['Space_Grotesk'] text-text-primary">
                <AnimatedCount value={stat.count} />
              </div>
              <div className="text-xs text-text-secondary mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Third row - recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-bg-card rounded-xl p-6 border border-border"
      >
        <h3 className="text-sm font-medium text-text-secondary/70 uppercase tracking-wider mb-4">
          最近动态
        </h3>
        {recentItems.length === 0 ? (
          <div className="text-center py-8 text-text-secondary text-sm">
            暂无活动记录
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentItems.map((item) => (
              <RecentItem
                key={item.id}
                type={item.type}
                title={item.title}
                date={item.date}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
