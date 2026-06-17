import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { ReadingItem } from '../types';

const typeLabels: Record<string, string> = {
  book: '书籍',
  movie: '电影',
  music: '音乐',
  game: '游戏',
  article: '文章',
};

const typeIcons: Record<string, JSX.Element> = {
  book: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  movie: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
      <line x1="7" y1="2" x2="7" y2="22"/>
      <line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/>
      <line x1="17" y1="17" x2="22" y2="17"/>
    </svg>
  ),
  music: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/>
      <circle cx="6" cy="18" r="3"/>
      <circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  game: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="11" x2="10" y2="11"/>
      <line x1="8" y1="9" x2="8" y2="13"/>
      <line x1="15" y1="12" x2="15.01" y2="12"/>
      <line x1="18" y1="10" x2="18.01" y2="10"/>
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"/>
    </svg>
  ),
  article: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
};

const filters = ['all', 'book', 'movie', 'music', 'game', 'article'];
const filterLabels: Record<string, string> = {
  all: '全部',
  book: '书籍',
  movie: '电影',
  music: '音乐',
  game: '游戏',
  article: '文章',
};

function StarRating({
  rating,
  onChange,
  size = 'md',
}: {
  rating: number;
  onChange?: (v: number) => void;
  size?: 'sm' | 'md';
}) {
  const starSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={`${starSize} ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          aria-label={`${star} 星`}
        >
          <svg viewBox="0 0 24 24" fill={star <= rating ? '#6C63FF' : 'none'} stroke="#6C63FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function Reading() {
  const { readings, addReading, deleteReading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ReadingItem['type']>('book');
  const [newRating, setNewRating] = useState(0);
  const [newReview, setNewReview] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const filteredItems = readings.filter((item) => {
    const matchFilter = activeFilter === 'all' || item.type === activeFilter;
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addReading({
      title: newTitle.trim(),
      type: newType,
      rating: newRating,
      review: newReview.trim(),
      url: newUrl.trim() || undefined,
    });
    useStore.getState().recalcStats();
    setNewTitle('');
    setNewType('book');
    setNewRating(0);
    setNewReview('');
    setNewUrl('');
    setShowAddModal(false);
  };

  return (
    <div className="p-6">
      {/* Search and add */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="搜索标题..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg-card border border-border text-text-primary placeholder-text-secondary/50 text-sm focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="ml-4 px-4 py-2 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-medium transition-colors"
        >
          添加
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              activeFilter === f
                ? 'bg-accent text-white'
                : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full text-center py-16 text-text-secondary"
            >
              暂无记录
            </motion.div>
          ) : (
            filteredItems.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="bg-bg-card rounded-xl p-5 border border-border hover:border-accent/30 transition-colors group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-accent">{typeIcons[item.type]}</span>
                    <span className="text-xs text-text-secondary">{typeLabels[item.type]}</span>
                  </div>
                  <button
                    onClick={() => { deleteReading(item.id); useStore.getState().recalcStats(); }}
                    className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-red-400 transition-all p-1"
                    title="删除"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
                <h3 className="font-medium text-text-primary mb-2 line-clamp-2">{item.title}</h3>
                <StarRating rating={item.rating} size="sm" />
                {item.review && (
                  <p className="text-sm text-text-secondary mt-2 line-clamp-3">{item.review}</p>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent hover:text-accent-light mt-2 inline-block transition-colors"
                  >
                    查看链接
                  </a>
                )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-bg-card rounded-xl p-6 w-full max-w-md mx-4 border border-border"
            >
              <h2 className="text-lg font-semibold text-text-primary mb-4">添加记录</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-1">标题</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-bg-dark border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="输入标题"
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1">类型</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ReadingItem['type'])}
                    className="w-full px-3 py-2 rounded-lg bg-bg-dark border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                  >
                    {(['book', 'movie', 'music', 'game', 'article'] as const).map((t) => (
                      <option key={t} value={t}>{typeLabels[t]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1">评分</label>
                  <StarRating rating={newRating} onChange={setNewRating} />
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1">评价</label>
                  <textarea
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-bg-dark border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors resize-none"
                    placeholder="写下你的评价..."
                  />
                </div>

                <div>
                  <label className="block text-sm text-text-secondary mb-1">链接（可选）</label>
                  <input
                    type="url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-bg-dark border border-border text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
                    placeholder="https://"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary transition-colors text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleAdd}
                  disabled={!newTitle.trim()}
                  className="flex-1 px-4 py-2 rounded-lg bg-accent hover:bg-accent-light text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  保存
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
