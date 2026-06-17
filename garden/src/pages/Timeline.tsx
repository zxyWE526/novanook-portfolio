import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const EVENT_TYPES = ['achievement', 'milestone', 'memory', 'work'] as const;

const TYPE_BADGES: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  achievement: { label: '成就', bg: '#7C3AED20', color: '#7C3AED' },
  milestone: { label: '里程碑', bg: '#14B8A620', color: '#14B8A6' },
  memory: { label: '回忆', bg: '#EC489920', color: '#EC4899' },
  work: { label: '工作', bg: '#3B82F620', color: '#3B82F6' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = d.toLocaleDateString('zh-CN', { month: 'long' });
  const day = d.getDate();
  return `${year} ${month} ${day}`;
}

export default function Timeline() {
  const { timeline: events, addEvent, deleteEvent } = useStore();
  const [showModal, setShowModal] = useState(false);

  const sorted = useMemo(
    () => [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [events]
  );

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-text-primary tracking-tight">
          时间线
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-medium transition-colors duration-200 self-start"
        >
          新事件
        </button>
      </motion.div>

      {/* Timeline */}
      {sorted.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-text-secondary text-center py-20"
        >
          暂无事件记录，点击"新事件"开始记录你的人生故事
        </motion.p>
      ) : (
        <div className="relative">
          {/* Vertical line - hidden on mobile, visible on desktop */}
          <div className="hidden md:block absolute left-1/2 -translate-x-px top-0 bottom-0 w-0.5 bg-accent/30" />

          <div className="space-y-10 md:space-y-12">
            {sorted.map((event, idx) => {
              const badge = TYPE_BADGES[event.type] || TYPE_BADGES.memory;
              const isLeft = idx % 2 === 0;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="relative"
                >
                  {/* Desktop: alternating layout */}
                  <div className="hidden md:flex items-start">
                    {/* Left side */}
                    <div className={`w-[calc(50%-2rem)] ${isLeft ? '' : 'order-3'}`}>
                      {isLeft && <EventCard event={event} badge={badge} onDelete={deleteEvent} />}
                    </div>

                    {/* Center: dot + date */}
                    <div className="flex flex-col items-center mx-8 relative z-10 order-2">
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="w-4 h-4 rounded-full bg-accent border-4 border-bg-dark shadow-[0_0_0_2px_rgba(108,99,255,0.3)]"
                      />
                      <span className="text-xs text-text-secondary/60 mt-2 whitespace-nowrap font-medium">
                        {formatDate(event.date)}
                      </span>
                    </div>

                    {/* Right side */}
                    <div className={`w-[calc(50%-2rem)] ${isLeft ? 'order-3' : ''}`}>
                      {!isLeft && <EventCard event={event} badge={badge} onDelete={deleteEvent} />}
                    </div>
                  </div>

                  {/* Mobile: all left */}
                  <div className="md:hidden relative pl-8">
                    {/* Dot on the line */}
                    <div className="absolute left-0 top-1.5 flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-accent border-3 border-bg-dark shadow-[0_0_0_2px_rgba(108,99,255,0.3)]" />
                    </div>
                    {/* Vertical line segment */}
                    <div className="absolute left-[5px] top-5 bottom-0 w-0.5 bg-accent/20" />

                    <span className="text-xs text-text-secondary/60 mb-2 block font-medium">
                      {formatDate(event.date)}
                    </span>
                    <EventCard event={event} badge={badge} onDelete={deleteEvent} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Event Modal */}
      <AnimatePresence>
        {showModal && (
          <NewEventModal
            onClose={() => setShowModal(false)}
            onAdd={(data) => {
              addEvent(data);
              setShowModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EventCard({
  event,
  badge,
  onDelete,
}: {
  event: { id: string; title: string; description: string; type: string; images: string[] };
  badge: { label: string; bg: string; color: string };
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      className="bg-bg-card border border-border rounded-xl p-5 group hover:border-accent/30 transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-base font-semibold text-text-primary font-['Space_Grotesk']">
            {event.title}
          </h3>
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: badge.bg, color: badge.color }}
          >
            {badge.label}
          </span>
        </div>
        <button
          onClick={() => onDelete(event.id)}
          className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 flex items-center justify-center transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
          title="删除"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
      {event.description && (
        <p className="text-sm text-text-secondary leading-relaxed">{event.description}</p>
      )}
      {event.images && event.images.length > 0 && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {event.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${event.title} ${i + 1}`}
              loading="lazy"
              className="w-20 h-20 object-cover rounded-lg border border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function NewEventModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (e: {
    date: string;
    title: string;
    description: string;
    type: string;
    images: string[];
  }) => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<string>('memory');
  const [images, setImages] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    onAdd({
      date,
      title: title.trim(),
      description: description.trim(),
      type,
      images: images
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="bg-bg-card border border-border rounded-xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-text-primary mb-5 font-['Space_Grotesk']">
          新事件
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">日期</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="事件的标题"
              required
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="详细描述这个事件..."
              rows={3}
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">类型</label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_TYPES.map((t) => {
                const badge = TYPE_BADGES[t];
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      type === t
                        ? 'ring-2 ring-offset-1 ring-offset-bg-card'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: badge.bg,
                      color: badge.color,
                      ...(type === t ? { boxShadow: `0 0 0 2px ${badge.color}` } : {}),
                    }}
                  >
                    {badge.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">图片链接（每行一个）</label>
            <textarea
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg"
              rows={2}
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-medium transition-colors"
            >
              添加
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
