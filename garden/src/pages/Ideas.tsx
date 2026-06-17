import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { Idea } from '../types';

type FilterType = 'all' | 'text' | 'link';

export default function Ideas() {
  const { ideas, addIdea, deleteIdea } = useStore();

  const [quickInput, setQuickInput] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [ideaType, setIdeaType] = useState<Idea['type']>('text');

  // Filter ideas
  const filtered = useMemo(() => {
    let list = [...ideas].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (filterType !== 'all') {
      list = list.filter((idea) => idea.type === filterType);
    }
    return list;
  }, [ideas, filterType]);

  // Quick capture
  const handleCapture = useCallback(() => {
    const content = quickInput.trim();
    if (!content) return;

    addIdea({ content, type: ideaType, source: '', isDraft: false });
    setQuickInput('');
  }, [quickInput, ideaType, addIdea]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
        handleCapture();
      }
    },
    [handleCapture]
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 60) return `${mins} 分钟前`;
    if (hours < 24) return `${hours} 小时前`;
    if (days < 7) return `${days} 天前`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const typeIcon = (type: Idea['type']) => {
    switch (type) {
      case 'text':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 7 4 4 20 4 20 7" />
            <line x1="9" y1="20" x2="15" y2="20" />
            <line x1="12" y1="4" x2="12" y2="20" />
          </svg>
        );
      case 'link':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        );
      case 'image':
        return (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        );
    }
  };

  const filterBtn = (type: FilterType, label: string) => (
    <button
      onClick={() => setFilterType(type)}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        filterType === type
          ? 'bg-accent/20 text-accent'
          : 'bg-bg-hover text-text-secondary hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-6 space-y-6"
    >
      {/* Quick Capture */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-bg-card border border-border rounded-xl p-5"
      >
        <h2 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
          快速捕捉
        </h2>
        <div className="flex gap-2 mb-3">
          {(['text', 'link', 'image'] as Idea['type'][]).map((t) => (
            <button
              key={t}
              onClick={() => setIdeaType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                ideaType === t
                  ? 'bg-accent/20 text-accent'
                  : 'bg-bg-hover text-text-secondary hover:text-text-primary'
              }`}
            >
              {typeIcon(t)}
              <span>{t === 'text' ? '文本' : t === 'link' ? '链接' : '图片'}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="记录一闪而过的灵感..."
            rows={2}
            className="flex-1 bg-bg-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary/30 outline-none focus:border-accent transition-colors resize-none"
          />
          <button
            onClick={handleCapture}
            disabled={!quickInput.trim()}
            className="px-4 py-2 bg-accent hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors self-end"
          >
            添加
          </button>
        </div>
        <p className="text-[10px] text-text-secondary/40 mt-2">
          按 Ctrl+Enter / Cmd+Enter 快速添加
        </p>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex items-center gap-2"
      >
        {filterBtn('all', '全部')}
        {filterBtn('text', '文本')}
        {filterBtn('link', '链接')}
        {filtered.length > 0 && (
          <span className="text-[10px] text-text-secondary/40 ml-auto">
            {filtered.length} 条灵感
          </span>
        )}
      </motion.div>

      {/* Masonry Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-text-secondary/50 text-sm">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-30">
            <path d="M9 18h6" />
            <path d="M10 22h4" />
            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A3.86 3.86 0 0 1 8.91 14" />
          </svg>
          <span>还没有灵感，开始记录吧</span>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {filtered.map((idea, idx) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(idx * 0.02, 0.4) }}
              className="break-inside-avoid"
            >
              <div className="bg-bg-card border border-border rounded-xl p-4 hover:border-accent/30 transition-colors group relative">
                {/* Delete button */}
                <button
                  onClick={() => deleteIdea(idea.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 bg-bg-hover hover:bg-red-500/20 text-text-secondary hover:text-red-400 transition-all"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Content */}
                <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap pr-4">
                  {idea.content}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                      idea.type === 'text'
                        ? 'bg-accent/10 text-accent-light'
                        : idea.type === 'link'
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-green-500/10 text-green-400'
                    }`}
                  >
                    {typeIcon(idea.type)}
                    {idea.type === 'text' ? '文本' : idea.type === 'link' ? '链接' : '图片'}
                  </span>
                  <span className="text-[10px] text-text-secondary/40">
                    {formatDate(idea.createdAt)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
