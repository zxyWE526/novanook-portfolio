import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const FILE_TYPES = ['PDF', 'Word', 'ZIP', 'Video', 'Audio', 'Other'] as const;

type SortKey = 'name' | 'date' | 'size';
type SortDir = 'asc' | 'desc';

const TYPE_COLORS: Record<string, string> = {
  PDF: '#3B82F6',
  Word: '#2B579A',
  ZIP: '#F97316',
  Video: '#EF4444',
  Audio: '#1DB954',
  Other: '#6B7280',
};

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  if (bytes >= 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return bytes + ' B';
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function FileIcon({ type }: { type: string }) {
  const color = TYPE_COLORS[type] || TYPE_COLORS.Other;
  return (
    <div
      className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color + '20', color }}
    >
      {type === 'PDF' ? 'PDF' : type === 'Word' ? 'W' : type === 'ZIP' ? 'ZIP' : type === 'Video' ? 'VID' : type === 'Audio' ? 'AUD' : 'FILE'}
    </div>
  );
}

export default function Vault() {
  const { files, addFile, deleteFile } = useStore();
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    files.forEach((f) => f.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [files]);

  const filtered = useMemo(() => {
    let list = [...files];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.note.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Tag filter
    if (tagFilter) {
      list = list.filter((f) => f.tags.includes(tagFilter));
    }

    // Sort
    list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'date') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortKey === 'size') cmp = a.size - b.size;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [files, search, tagFilter, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const handleDelete = (id: string) => {
    deleteFile(id);
    setConfirmDelete(null);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-text-primary tracking-tight">
          文件库
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-medium transition-colors duration-200 self-start"
        >
          上传文件
        </button>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
      >
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary/50"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索文件名称、标签或备注..."
            className="w-full bg-bg-card border border-border rounded-lg pl-10 pr-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
          />
        </div>

        {/* Tag filter */}
        {allTags.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {tagFilter && (
              <button
                onClick={() => setTagFilter('')}
                className="px-3 py-1 rounded-full text-xs border border-border text-text-secondary hover:text-text-primary transition-colors"
              >
                全部
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag === tagFilter ? '' : tag)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  tagFilter === tag
                    ? 'bg-accent text-white border-accent'
                    : 'border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Sort controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-4 text-xs text-text-secondary"
      >
        {(['name', 'date', 'size'] as const).map((key) => (
          <button
            key={key}
            onClick={() => toggleSort(key)}
            className={`flex items-center gap-1 hover:text-text-primary transition-colors ${
              sortKey === key ? 'text-accent' : ''
            }`}
          >
            {key === 'name' ? '名称' : key === 'date' ? '日期' : '大小'}
            {sortKey === key && (
              <svg
                className={`w-3 h-3 transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            )}
          </button>
        ))}
      </motion.div>

      {/* File list */}
      {filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-text-secondary text-center py-20"
        >
          {search || tagFilter ? '没有匹配的文件' : '暂无文件，点击"上传文件"添加'}
        </motion.p>
      ) : (
        <motion.div layout className="space-y-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-4 hover:bg-bg-hover transition-colors duration-200 group"
              >
                <FileIcon type={file.type} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-text-primary truncate">
                      {file.name}
                    </span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: TYPE_COLORS[file.type] + '20',
                        color: TYPE_COLORS[file.type],
                      }}
                    >
                      {file.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary">
                    <span>{formatSize(file.size)}</span>
                    <span>{formatDate(file.createdAt)}</span>
                  </div>
                  {file.tags.length > 0 && (
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {file.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-bg-dark text-text-secondary/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {file.note && (
                    <p className="text-xs text-text-secondary/60 mt-1.5 line-clamp-1">
                      {file.note}
                    </p>
                  )}
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {file.url && (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-lg bg-accent/10 hover:bg-accent/20 text-accent flex items-center justify-center transition-colors"
                      title="预览"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => setConfirmDelete(file.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 flex items-center justify-center transition-colors"
                    title="删除"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Upload Modal */}
      <AnimatePresence>
        {showModal && (
          <UploadModal onClose={() => setShowModal(false)} onAdd={addFile} />
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <DeleteConfirm
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => handleDelete(confirmDelete)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function UploadModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (f: { name: string; type: string; size: number; url: string; tags: string[]; note: string }) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState('PDF');
  const [size, setSize] = useState('');
  const [tags, setTags] = useState('');
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    const sizeNum = parseInt(size, 10) || 0;
    onAdd({
      name: name.trim(),
      type,
      size: sizeNum,
      url: url.trim(),
      tags: tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean),
      note: note.trim(),
    });
    onClose();
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
          上传文件
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">文件名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：项目报告.pdf"
              required
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">文件类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            >
              {FILE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">文件大小（字节）</label>
            <input
              type="number"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              placeholder="例如：1048576"
              min="0"
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">文件链接</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/file.pdf"
              required
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">标签（逗号分隔）</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="工作, 项目, 重要"
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">备注</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="添加一些备注..."
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
              上传
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function DeleteConfirm({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-bg-card border border-border rounded-xl p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-text-primary mb-2">确认删除</h3>
        <p className="text-sm text-text-secondary mb-5">确定要删除这个文件吗？此操作不可撤销。</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-border rounded-lg text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            删除
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
