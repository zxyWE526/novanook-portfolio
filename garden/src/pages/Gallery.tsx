import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

const CATEGORIES = ['All', 'Travel', 'Life', 'Food', 'Art', 'Other'] as const;

export default function Gallery() {
  const { photos, addPhoto, deletePhoto } = useStore();
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showModal, setShowModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      activeCategory === 'All'
        ? photos
        : photos.filter((p) => p.category === activeCategory),
    [photos, activeCategory]
  );

  const openLightbox = (idx: number) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

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
          相册
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-accent hover:bg-accent-light text-white rounded-lg text-sm font-medium transition-colors duration-200 self-start"
        >
          添加照片
        </button>
      </motion.div>

      {/* Category filter tabs */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex gap-2 flex-wrap"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-accent text-white'
                : 'bg-bg-card text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            {cat === 'All' ? '全部' : cat}
          </button>
        ))}
      </motion.div>

      {/* Photo grid */}
      {filtered.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-text-secondary text-center py-20"
        >
          暂无照片，点击"添加照片"开始记录
        </motion.p>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((photo, idx) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-bg-card border border-border aspect-video"
                onClick={() => openLightbox(idx)}
              >
                <img
                  src={photo.url}
                  alt={photo.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect fill="%23141418" width="16" height="9"/><text x="8" y="5.5" text-anchor="middle" fill="%238E8E96" font-size="0.8">加载失败</text></svg>';
                  }}
                />
                {/* Caption overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <div className="w-full">
                    <p className="text-white text-sm font-medium truncate">
                      {photo.caption}
                    </p>
                    <p className="text-white/60 text-xs mt-0.5">{photo.category}</p>
                  </div>
                </div>
                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePhoto(photo.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white/80 hover:bg-red-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add Photo Modal */}
      <AnimatePresence>
        {showModal && (
          <AddPhotoModal onClose={() => setShowModal(false)} onAdd={addPhoto} />
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photos={filtered}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onNavigate={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddPhotoModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (p: { url: string; thumbUrl: string; caption: string; category: string; takenAt: string }) => void;
}) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('Travel');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onAdd({
      url: url.trim(),
      thumbUrl: url.trim(),
      caption: caption.trim(),
      category,
      takenAt: new Date().toISOString(),
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
          添加照片
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">图片链接</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
              required
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">描述</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="照片的简短描述"
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors placeholder:text-text-secondary/40"
            />
          </div>
          <div>
            <label className="block text-sm text-text-secondary mb-1.5">分类</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-bg-dark border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent transition-colors"
            >
              {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
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

function Lightbox({
  photos,
  currentIndex,
  onClose,
  onNavigate,
}: {
  photos: { id: string; url: string; caption: string; category: string }[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (idx: number) => void;
}) {
  const photo = photos[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10 text-lg"
      >
        ✕
      </button>

      {/* Prev */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      )}

      {/* Next */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* Image */}
      <motion.div
        key={photo.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="max-w-4xl max-h-[85vh] w-full mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.url}
          alt={photo.caption}
          className="max-w-full max-h-[75vh] object-contain rounded-lg"
        />
        <div className="mt-3 text-center">
          <p className="text-white text-base">{photo.caption}</p>
          <p className="text-white/50 text-sm mt-1">{photo.category}</p>
          <p className="text-white/30 text-xs mt-1">
            {currentIndex + 1} / {photos.length}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
