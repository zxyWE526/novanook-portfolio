import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

export default function Settings() {
  const { theme, setTheme } = useStore();
  const [importStatus, setImportStatus] = useState('');

  const handleExport = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital-garden-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, JSON.stringify(value));
        });
        setImportStatus('数据导入成功！请刷新页面以应用更改。');
      } catch {
        setImportStatus('导入失败：文件格式不正确。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClear = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可恢复。')) {
      localStorage.clear();
      setImportStatus('数据已清除。请刷新页面。');
    }
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Theme */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card rounded-xl p-6 border border-border"
      >
        <h2 className="text-lg font-semibold text-text-primary mb-4">主题</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">
            当前：{theme === 'dark' ? '黑暗模式' : '明亮模式'}
          </span>
          <button
            onClick={handleThemeToggle}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-accent' : 'bg-text-secondary/30'
            }`}
            aria-label="切换主题"
          >
            <span
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                theme === 'dark' ? 'translate-x-[30px]' : 'translate-x-[2px]'
              }`}
            />
          </button>
        </div>
      </motion.section>

      {/* Data Management */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-bg-card rounded-xl p-6 border border-border"
      >
        <h2 className="text-lg font-semibold text-text-primary mb-4">数据管理</h2>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full px-4 py-3 rounded-lg bg-bg-dark border border-border text-text-primary hover:border-accent transition-colors text-sm text-left flex items-center gap-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            导出数据
          </button>

          <label className="block w-full px-4 py-3 rounded-lg bg-bg-dark border border-border text-text-primary hover:border-accent transition-colors text-sm cursor-pointer flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            导入数据
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>

          <button
            onClick={handleClear}
            className="w-full px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm text-left flex items-center gap-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            清除数据
          </button>
        </div>

        {importStatus && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 text-sm text-accent"
          >
            {importStatus}
          </motion.p>
        )}
      </motion.section>

      {/* About */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-bg-card rounded-xl p-6 border border-border"
      >
        <h2 className="text-lg font-semibold text-text-primary mb-4">关于</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-sm text-text-secondary">应用名称</span>
            <span className="text-sm text-text-primary">Digital Garden</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-sm text-text-secondary">版本</span>
            <span className="text-sm text-text-primary">v0.1</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-sm text-text-secondary">描述</span>
            <span className="text-sm text-text-primary text-right max-w-[200px]">
              个人数字花园 - 记录生活、管理知识、追踪成长
            </span>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
