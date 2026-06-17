import { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { Note } from '../types';

type MarkdownAction = 'bold' | 'italic' | 'heading' | 'list' | 'link';

const INSERT_MAP: Record<MarkdownAction, { prefix: string; suffix: string; placeholder?: string }> = {
  bold: { prefix: '**', suffix: '**', placeholder: '粗体文本' },
  italic: { prefix: '*', suffix: '*', placeholder: '斜体文本' },
  heading: { prefix: '## ', suffix: '', placeholder: '标题' },
  list: { prefix: '- ', suffix: '', placeholder: '列表项' },
  link: { prefix: '[', suffix: '](url)', placeholder: '链接文本' },
};

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  action: MarkdownAction
): string {
  const { prefix, suffix, placeholder } = INSERT_MAP[action];
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end);
  const insertion = selected || placeholder || '';
  const newText = prefix + insertion + suffix;
  const newStart = start + prefix.length;
  const newEnd = newStart + insertion.length;

  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(newStart, newEnd);
  });

  return (
    textarea.value.substring(0, start) + newText + textarea.value.substring(end)
  );
}

type FilterMode = 'all' | 'featured' | 'category' | 'uncategorized';

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [linksInput, setLinksInput] = useState('');
  const [featured, setFeatured] = useState(false);

  // Derive categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((n) => {
      if (n.category) set.add(n.category);
    });
    return Array.from(set).sort();
  }, [notes]);

  // Filter notes
  const filtered = useMemo(() => {
    let list = [...notes].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    if (filterMode === 'featured') {
      list = list.filter((n) => n.featured);
    } else if (filterMode === 'category' && activeCategory) {
      list = list.filter((n) => n.category === activeCategory);
    } else if (filterMode === 'uncategorized') {
      list = list.filter((n) => !n.category);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [notes, search, filterMode, activeCategory]);

  const selectedNote = editingId
    ? notes.find((n) => n.id === editingId) ?? null
    : null;

  const openEditor = useCallback((entry: Note) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setCategory(entry.category);
    setTagsInput(entry.tags.join(', '));
    setLinksInput((entry.links || []).join(', '));
    setFeatured(entry.featured);
  }, []);

  const newEntry = useCallback(() => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('');
    setTagsInput('');
    setLinksInput('');
    setFeatured(false);
  }, []);

  const handleSave = useCallback(() => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const links = linksInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean);

    if (editingId && selectedNote) {
      updateNote(editingId, { title, content, category, tags, links, featured });
    } else {
      addNote({ title, content, category, tags, links, featured });
    }

    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('');
    setTagsInput('');
    setLinksInput('');
    setFeatured(false);
  }, [editingId, selectedNote, title, content, category, tagsInput, linksInput, featured, addNote, updateNote]);

  const handleDelete = useCallback(() => {
    if (!editingId) return;
    deleteNote(editingId);
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('');
    setTagsInput('');
    setLinksInput('');
    setFeatured(false);
  }, [editingId, deleteNote]);

  const handleCancel = useCallback(() => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setCategory('');
    setTagsInput('');
    setLinksInput('');
    setFeatured(false);
  }, []);

  const handleMarkdown = useCallback(
    (action: MarkdownAction) => {
      const ta = textareaRef.current;
      if (!ta) return;
      setContent(insertAtCursor(ta, action));
    },
    []
  );

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const sidebarSections: { label: string; mode: FilterMode; category?: string }[] = [
    { label: '全部笔记', mode: 'all' },
    { label: '精选笔记', mode: 'featured' },
    { label: '未分类', mode: 'uncategorized' },
    ...(categories.length > 0
      ? [{ label: '---', mode: 'all' as FilterMode }]
      : []),
    ...categories.map((c) => ({ label: c, mode: 'category' as FilterMode, category: c })),
  ];

  const isActive = (section: typeof sidebarSections[0]) => {
    if (section.mode === 'all') return filterMode === 'all';
    if (section.mode === 'featured') return filterMode === 'featured';
    if (section.mode === 'uncategorized') return filterMode === 'uncategorized';
    if (section.mode === 'category')
      return filterMode === 'category' && activeCategory === section.category;
    return false;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex h-[calc(100vh-73px)]"
    >
      {/* Left: Categories */}
      <div className="hidden md:flex w-[180px] xl:w-[200px] border-r border-border flex-col overflow-hidden flex-shrink-0">
        <div className="p-3 border-b border-border">
          <button
            onClick={newEntry}
            className="w-full px-3 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors"
          >
            新笔记
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {sidebarSections.map((section) => {
            if (section.label === '---') {
              return (
                <div
                  key="separator"
                  className="px-4 py-1 text-[10px] uppercase tracking-wider text-text-secondary/40"
                >
                  分类
                </div>
              );
            }
            return (
              <button
                key={section.label + section.mode + (section.category || '')}
                onClick={() => {
                  if (section.mode === 'category' && section.category) {
                    setFilterMode('category');
                    setActiveCategory(section.category);
                  } else {
                    setFilterMode(section.mode);
                    setActiveCategory(null);
                  }
                }}
                className={`w-full text-left px-4 py-2 text-sm border-l-2 transition-colors hover:bg-bg-hover ${
                  isActive(section)
                    ? 'border-accent text-accent bg-accent/5'
                    : 'border-transparent text-text-secondary hover:text-text-primary'
                }`}
              >
                {section.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Middle: Note list */}
      <div className="w-full md:w-[260px] xl:w-[300px] border-r border-border flex flex-col overflow-hidden flex-shrink-0">
        <div className="p-3 border-b border-border">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索笔记..."
            className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary/50 outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary/50 text-sm px-4 text-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-2 opacity-40">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <span>暂无笔记</span>
            </div>
          ) : (
            <div className="py-1">
              {filtered.map((note) => (
                <button
                  key={note.id}
                  onClick={() => openEditor(note)}
                  className={`w-full text-left px-3 py-2.5 border-l-2 transition-colors hover:bg-bg-hover ${
                    editingId === note.id
                      ? 'border-accent bg-accent/5'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h3 className="text-sm font-medium text-text-primary truncate">
                      {note.title || '无标题'}
                    </h3>
                    {note.featured && (
                      <span className="text-[10px] text-accent-light flex-shrink-0">
                        ★
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary/60 line-clamp-1 mb-1">
                    {note.content}
                  </p>
                  <div className="flex items-center gap-1.5">
                    {note.category && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-hover text-text-secondary/70">
                        {note.category}
                      </span>
                    )}
                    {note.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent-light"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[10px] text-text-secondary/40 ml-auto">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Editor */}
      <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
        {editingId === null && !title && !content ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary/40 text-sm">
            选择一篇笔记开始编辑，或点击"新笔记"创建
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Markdown toolbar */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-border bg-bg-card">
              {(
                [
                  ['bold', 'B'],
                  ['italic', 'I'],
                  ['heading', 'H'],
                  ['list', 'L'],
                  ['link', 'Link'],
                ] as [MarkdownAction, string][]
              ).map(([action, label]) => (
                <button
                  key={action}
                  onClick={() => handleMarkdown(action)}
                  className="px-2.5 py-1 rounded text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="笔记标题..."
                className="w-full bg-transparent border-b border-border pb-2 text-xl font-semibold text-text-primary placeholder-text-secondary/30 outline-none focus:border-accent transition-colors"
              />

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始记录..."
                className="w-full min-h-[250px] bg-bg-hover border border-border rounded-lg p-4 text-sm text-text-primary placeholder-text-secondary/30 outline-none focus:border-accent transition-colors resize-none font-['JetBrains_Mono'] leading-relaxed"
              />

              {/* Category selector */}
              <div>
                <label className="block text-xs text-text-secondary/60 uppercase tracking-wider mb-1.5">
                  分类
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="输入或选择分类"
                    className="flex-1 bg-bg-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary/30 outline-none focus:border-accent transition-colors"
                  />
                  {categories.length > 0 && (
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-bg-hover border border-border rounded-lg px-2 py-2 text-sm text-text-primary outline-none focus:border-accent transition-colors"
                    >
                      <option value="">选择</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs text-text-secondary/60 uppercase tracking-wider mb-1.5">
                  标签
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="用逗号分隔"
                  className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary/30 outline-none focus:border-accent transition-colors"
                />
                {tagsInput && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tagsInput
                      .split(',')
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded text-xs bg-accent/10 text-accent-light"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Bidirectional links */}
              <div>
                <label className="block text-xs text-text-secondary/60 uppercase tracking-wider mb-1.5">
                  双向链接
                </label>
                <input
                  type="text"
                  value={linksInput}
                  onChange={(e) => setLinksInput(e.target.value)}
                  placeholder="输入关联笔记ID或标题，用逗号分隔"
                  className="w-full bg-bg-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary/30 outline-none focus:border-accent transition-colors"
                />
                {linksInput && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {linksInput
                      .split(',')
                      .map((l) => l.trim())
                      .filter(Boolean)
                      .map((link) => (
                        <span
                          key={link}
                          className="px-2 py-0.5 rounded text-xs bg-accent/10 text-accent-light"
                        >
                          {link}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-bg-hover text-accent focus:ring-accent/30 focus:ring-offset-0"
                />
                <span className="text-xs text-text-secondary">标记为精选</span>
              </label>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-bg-card">
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors"
              >
                {editingId ? '更新' : '保存'}
              </button>
              {editingId && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg transition-colors"
                >
                  删除
                </button>
              )}
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 text-text-secondary hover:text-text-primary text-sm font-medium rounded-lg hover:bg-bg-hover transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
