import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

type GoalTab = 'long-term' | 'short-term';

const TAB_LABELS: Record<GoalTab, string> = {
  'long-term': '长期目标',
  'short-term': '短期目标',
};

export default function Goals() {
  const { goals, addGoal, updateGoal, deleteGoal, addTask, removeTask, toggleTask } = useStore();
  const [activeTab, setActiveTab] = useState<GoalTab>('short-term');
  const [showModal, setShowModal] = useState(false);

  const filtered = goals.filter((g) => g.type === activeTab);

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
          目标管理
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-medium transition-colors duration-200 self-start"
        >
          新建目标
        </button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-1 bg-bg-card rounded-xl p-1 w-fit border border-border"
      >
        {(Object.entries(TAB_LABELS) as [GoalTab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === key
                ? 'bg-accent text-white shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </motion.div>

      {/* Goal list */}
      {filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-text-secondary text-center py-20"
        >
          暂无{activeTab === 'long-term' ? '长期' : '短期'}目标，点击"新建目标"开始
        </motion.p>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onToggleTask={toggleTask}
                onAddTask={addTask}
                onRemoveTask={removeTask}
                onDelete={deleteGoal}
                onUpdate={(patch) => updateGoal(goal.id, patch)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* New Goal Modal */}
      <AnimatePresence>
        {showModal && (
          <NewGoalModal
            defaultType={activeTab}
            onClose={() => setShowModal(false)}
            onAdd={(data) => {
              addGoal(data);
              setShowModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function GoalCard({
  goal,
  onToggleTask,
  onAddTask,
  onRemoveTask,
  onDelete,
  onUpdate,
}: {
  goal: {
    id: string;
    title: string;
    description: string;
    tasks: { id: string; content: string; completed: boolean }[];
    deadline?: string;
    progress: number;
  };
  onToggleTask: (goalId: string, taskId: string) => void;
  onAddTask: (goalId: string, content: string) => void;
  onRemoveTask: (goalId: string, taskId: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (patch: { title?: string; description?: string; deadline?: string }) => void;
}) {
  const [newTask, setNewTask] = useState('');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);
  const [deadline, setDeadline] = useState(goal.deadline || '');
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    onAddTask(goal.id, newTask.trim());
    setNewTask('');
  };

  const handleSaveEdit = () => {
    onUpdate({ title: title.trim() || goal.title, description: description.trim(), deadline });
    setEditing(false);
  };

  const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
  const isOverdue = deadlineDate && deadlineDate < new Date();

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-bg-card border border-border rounded-xl p-5 space-y-4 hover:border-accent/30 transition-colors duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        {editing ? (
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent resize-none"
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-bg-dark border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleSaveEdit}
                className="px-3 py-1.5 bg-accent text-white rounded-lg text-xs font-medium"
              >
                保存
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-3 py-1.5 border border-border text-text-secondary rounded-lg text-xs"
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0" onDoubleClick={() => setEditing(true)}>
            <h3 className="text-base font-semibold text-text-primary font-['Space_Grotesk']">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-sm text-text-secondary mt-1 line-clamp-2">{goal.description}</p>
            )}
            {deadlineDate && (
              <p
                className={`text-xs mt-1.5 ${isOverdue ? 'text-red-400' : 'text-text-secondary/60'}`}
              >
                {isOverdue ? '已逾期：' : '截止：'}
                {deadlineDate.toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        )}
        <button
          onClick={() => onDelete(goal.id)}
          className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-text-secondary hover:text-red-400 flex items-center justify-center transition-colors flex-shrink-0"
          title="删除目标"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between text-xs text-text-secondary mb-1.5">
          <span>进度</span>
          <span>{goal.progress}%</span>
        </div>
        <div className="w-full h-2 bg-bg-dark rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #6C63FF, #E26EE5)',
            }}
            initial={{ width: 0 }}
            animate={visible ? { width: `${goal.progress}%` } : { width: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-1.5">
        {goal.tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 group"
          >
            <button
              onClick={() => onToggleTask(goal.id, task.id)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                task.completed
                  ? 'bg-accent border-accent'
                  : 'border-text-secondary/30 hover:border-accent'
              }`}
            >
              {task.completed && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
            <span
              className={`text-sm flex-1 ${
                task.completed ? 'text-text-secondary/50 line-through' : 'text-text-primary'
              }`}
            >
              {task.content}
            </span>
            <button
              onClick={() => onRemoveTask(goal.id, task.id)}
              className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded hover:bg-red-500/10 text-text-secondary hover:text-red-400 flex items-center justify-center transition-all text-xs"
            >
              ✕
            </button>
          </motion.div>
        ))}
        {/* Add task */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-4 h-4 rounded border-2 border-dashed border-text-secondary/20 flex-shrink-0" />
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddTask();
            }}
            placeholder="添加子任务..."
            className="flex-1 bg-transparent text-sm text-text-secondary placeholder:text-text-secondary/30 focus:outline-none"
          />
          {newTask.trim() && (
            <button
              onClick={handleAddTask}
              className="text-xs text-accent hover:text-accent-light font-medium transition-colors"
            >
              添加
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function NewGoalModal({
  defaultType,
  onClose,
  onAdd,
}: {
  defaultType: GoalTab;
  onClose: () => void;
  onAdd: (g: {
    title: string;
    description: string;
    type: 'long-term' | 'short-term';
    tasks: { id: string; content: string; completed: boolean }[];
    deadline?: string;
    progress: number;
  }) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<GoalTab>(defaultType);
  const [deadline, setDeadline] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({
      title: title.trim(),
      description: description.trim(),
      type,
      tasks: [],
      deadline: deadline || undefined,
      progress: 0,
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
          新建目标
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">目标标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：学习新的编程语言"
              required
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="目标的具体描述..."
              rows={3}
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">目标类型</label>
            <div className="flex gap-2">
              {(['long-term', 'short-term'] as GoalTab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    type === t
                      ? 'bg-accent text-white'
                      : 'bg-bg-dark border border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {TAB_LABELS[t]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">截止日期（可选）</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
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
              创建
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
