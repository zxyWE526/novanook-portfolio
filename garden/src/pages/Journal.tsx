import { useState, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import type { JournalEntry } from '../types';

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

  // Store cursor position before insertion
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(newStart, newEnd);
  });

  return (
    textarea.value.substring(0, start) + newText + textarea.value.substring(end)
  );
}

export default function Journal() {
  const { journals, addJournal, updateJournal, deleteJournal } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [draft, setDraft] = useState(false);

  // Derive all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    journals.forEach((j) => j.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [journals]);

  // Filter journals
  const filtered = useMemo(() => {
    let list = [...journals].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.content.toLowerCase().includes(q)
      );
    }
    if (selectedTag) {
      list = list.filter((j) => j.tags.includes(selectedTag!));
    }
    return list;
  }, [journals, search, selectedTag]);

  const selectedEntry = editingId
    ? journals.find((j) => j.id === editingId) ?? null
    : null;

  // Open an entry for editing
  const openEditor = useCallback((entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setContent(entry.content);
    setTagsInput(entry.tags.join(', '));
    setDraft(entry.draft);
  }, []);

  // New entry
  const newEntry = useCallback(() => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setTagsInput('');
    setDraft(false);
  }, []);

  // Save
  const handleSave = useCallback(() => {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId && selectedEntry) {
      updateJournal(editingId, { title, content, tags, draft });
    } else {
      addJournal({
        title,
        content,
        tags,
        images: [],
        draft,
      });
    }
    setEditingId(null);
    setTitle('');
    setContent('');
    setTagsInput('');
    setDraft(false);
  }, [editingId, selectedEntry, title, content, tagsInput, draft, addJournal, updateJournal]);

  // Delete
  const handleDelete = useCallback(() => {
    if (!editingId) return;
    deleteJournal(editingId);
    setEditingId(null);
    setTitle('');
    setContent('');
    setTagsInput('');
    setDraft(false);
  }, [editingId, deleteJournal]);

  // Cancel
  const handleCancel = useCallback(() => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setTagsInput('');
    setDraft(false);
  }, []);

  // Markdown toolbar handler
  const handleMarkdown = useCallback(
    (action: MarkdownAction) => {
      const ta = textareaRef.current;
      if (!ta) return;
      setContent(insertAtCursor(ta, action));
    },
    []
  );

  // Format date for display
  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex h-[calc(100vh-73px)]"
    >
      {/* Left: List column */}
      <div className="w-full lg:w-[380px] xl:w-[420px] border-r border-border flex flex-col overflow-hidden flex-shrink-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索日记..."
              className="flex-1 bg-bg-hover border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-secondary/50 outline-none focus:border-accent transition-colors"
            />
            <button
              onClick={newEntry}
              className="px-3 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              新日记
            </button>
          </div>

          {/* Tags filter */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTag(null)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  selectedTag === null
                    ? 'bg-accent/20 text-accent'
                    : 'bg-bg-hover text-text-secondary hover:text-text-primary'
                }`}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setSelectedTag(tag === selectedTag ? null : tag)
                  }
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    selectedTag === tag
                      ? 'bg-accent/20 text-accent'
                      : 'bg-bg-hover text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Entry list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-text-secondary/50 text-sm px-4 text-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="mb-2 opacity-40"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>
                {search || selectedTag ? '未找到匹配的日记' : '还没有日记，点击上方按钮创建'}
              </span>
            </div>
          ) : (
            <div className="py-2">
              {filtered.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => openEditor(entry)}
                  className={`w-full text-left px-4 py-3 border-l-2 transition-colors hover:bg-bg-hover ${
                    editingId === entry.id
                      ? 'border-accent bg-accent/5'
                      : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs text-text-secondary/60">
                      {formatDate(entry.createdAt)}
                    </span>
                    {entry.draft && (
                      <span className="text-[10px] uppercase tracking-wider text-warning font-medium">
                        草稿
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-text-primary truncate">
                    {entry.title || '无标题'}
                  </h3>
                  <p className="text-xs text-text-secondary/70 mt-0.5 line-clamp-2">
                    {entry.content}
                  </p>
                  {entry.tags.length > 0 && (
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {entry.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-accent/10 text-accent-light"
                        >
                          {tag}
                        </span>
                      ))}
                      {entry.tags.length > 3 && (
                        <span className="text-[10px] text-text-secondary/50">
                          +{entry.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Editor column */}
      <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
        {editingId === null && !title && !content ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary/40 text-sm">
            选择一篇日记开始编辑，或点击"新日记"创建
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
                  title={action}
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
                placeholder="日记标题..."
                className="w-full bg-transparent border-b border-border pb-2 text-xl font-semibold text-text-primary placeholder-text-secondary/30 outline-none focus:border-accent transition-colors"
              />

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="开始写作..."
                className="w-full flex-1 min-h-[300px] bg-bg-hover border border-border rounded-lg p-4 text-sm text-text-primary placeholder-text-secondary/30 outline-none focus:border-accent transition-colors resize-none font-['JetBrains_Mono'] leading-relaxed"
              />

              <div>
                <label className="block text-xs text-text-secondary/60 uppercase tracking-wider mb-1.5">
                  标签
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="用逗号分隔，如: 生活, 学习, 思考"
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

              {/* Draft toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={draft}
                  onChange={(e) => setDraft(e.target.checked)}
                  className="w-4 h-4 rounded border-border bg-bg-hover text-accent focus:ring-accent/30 focus:ring-offset-0"
                />
                <span className="text-xs text-text-secondary">保存为草稿</span>
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
