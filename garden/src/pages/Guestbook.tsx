import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function Guestbook() {
  const { messages, addMessage, approveMessage, deleteMessage } = useStore();
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [adminMode, setAdminMode] = useState(false);

  const approvedMessages = messages.filter((m) => m.approved);
  const pendingMessages = messages.filter((m) => !m.approved);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;
    addMessage({ name: name.trim(), content: content.trim(), approved: false });
    setName('');
    setContent('');
  };

  const handleAdminToggle = () => {
    if (!adminMode) {
      const pwd = prompt('输入管理员密码：');
      if (pwd === 'admin') {
        setAdminMode(true);
      }
    } else {
      setAdminMode(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Leave message form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card rounded-xl p-6 border border-border mb-8"
      >
        <h2 className="text-lg font-semibold text-text-primary mb-4">留言</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的名字"
              className="w-full px-3 py-2 rounded-lg bg-bg-dark border border-border text-text-primary text-sm placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="写下你想说的话..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg bg-bg-dark border border-border text-text-primary text-sm placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>
          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={!name.trim() || !content.trim()}
              className="px-5 py-2 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              发送
            </button>
            <button
              type="button"
              onClick={handleAdminToggle}
              className={`text-xs transition-colors ${
                adminMode ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {adminMode ? '退出管理' : '管理'}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Admin: pending messages */}
      <AnimatePresence>
        {adminMode && pendingMessages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 overflow-hidden"
          >
            <h3 className="text-sm font-medium text-warning mb-3">
              待审核 ({pendingMessages.length})
            </h3>
            <div className="space-y-3">
              {pendingMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-bg-card rounded-xl p-4 border border-warning/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-text-primary text-sm">{msg.name}</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(msg.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">{msg.content}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveMessage(msg.id)}
                      className="px-3 py-1 bg-success/20 text-success rounded text-xs hover:bg-success/30 transition-colors"
                    >
                      通过
                    </button>
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Approved messages */}
      <div className="space-y-4">
        {approvedMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-text-secondary"
          >
            还没有留言，来写下第一条吧
          </motion.div>
        ) : (
          <>
            <h3 className="text-sm font-medium text-text-secondary/70 uppercase tracking-wider">
              留言板 ({approvedMessages.length})
            </h3>
            <AnimatePresence>
              {approvedMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  variants={messageVariants}
                  initial="hidden"
                  animate="show"
                  exit={{ opacity: 0, y: -10 }}
                  layout
                  className="bg-bg-card rounded-xl p-5 border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-text-primary">{msg.name}</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(msg.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{msg.content}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
