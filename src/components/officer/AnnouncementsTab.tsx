/**
 * AnnouncementsTab — compose + post announcements, pin/unpin, delete.
 * All state lives in the officer store.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Megaphone, Pin, PinOff, Trash2, Plus, X, Send,
  AlertCircle, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useOfficerStore } from '@/lib/officer-store';
import type { Announcement } from '@/lib/officer-store';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 2)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7)   return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// ─── Compose form ─────────────────────────────────────────────────────────────

interface ComposeDraft {
  title: string;
  body: string;
  pinned: boolean;
}

function ComposeForm({
  onPost, onCancel,
}: {
  onPost: (d: ComposeDraft) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ComposeDraft>({ title: '', body: '', pinned: false });
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({});
  const [focused, setFocused] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  function set<K extends keyof ComposeDraft>(k: K, v: ComposeDraft[K]) {
    setDraft((d) => ({ ...d, [k]: v }));
    if (k !== 'pinned') setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!draft.title.trim()) e.title = 'Title is required';
    if (!draft.body.trim())  e.body  = 'Message body is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (validate()) onPost(draft);
  }

  const fb = (k: string) => ({
    onFocus: () => setFocused(k),
    onBlur:  () => setFocused(null),
  });

  const inputStyle = (k: string, err?: string) => ({
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    border: `1.5px solid ${
      err ? 'hsl(var(--destructive))' : focused === k ? 'hsl(var(--primary))' : 'hsl(var(--border))'
    }`,
  });

  const inputCls = 'w-full px-3 py-2 rounded-xl text-[13px] outline-none transition-all duration-150';

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      onSubmit={handleSubmit}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'hsl(var(--card))', border: '1.5px solid hsl(var(--primary) / 0.3)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
      >
        <div className="flex items-center gap-2">
          <Megaphone size={14} style={{ color: 'hsl(var(--primary))' }} />
          <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            New announcement
          </span>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150"
          style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--border))')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
        >
          <X size={13} />
        </button>
      </div>

      {/* Fields */}
      <div className="p-5 flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            Title <span style={{ color: 'hsl(var(--destructive))' }}>*</span>
          </label>
          <input
            ref={titleRef}
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="e.g. Welcome to Fall 2026!"
            className={inputCls}
            style={inputStyle('title', errors.title)}
            {...fb('title')}
          />
          {errors.title && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--destructive))' }}>
              <AlertCircle size={10} /> {errors.title}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            Message <span style={{ color: 'hsl(var(--destructive))' }}>*</span>
          </label>
          <textarea
            value={draft.body}
            onChange={(e) => set('body', e.target.value)}
            placeholder="Write your announcement here…"
            rows={4}
            className={`${inputCls} resize-none`}
            style={inputStyle('body', errors.body)}
            {...fb('body')}
          />
          {errors.body && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--destructive))' }}>
              <AlertCircle size={10} /> {errors.body}
            </span>
          )}
          <span className="text-[11px] text-right" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {draft.body.length} chars
          </span>
        </div>

        {/* Pin toggle */}
        <button
          type="button"
          onClick={() => set('pinned', !draft.pinned)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium transition-all duration-150 text-left"
          style={{
            background: draft.pinned ? 'hsl(var(--accent) / 0.1)' : 'hsl(var(--muted))',
            border: `1.5px solid ${draft.pinned ? 'hsl(var(--accent) / 0.4)' : 'hsl(var(--border))'}`,
            color: draft.pinned ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
          }}
        >
          <Pin size={13} />
          <span>
            {draft.pinned ? 'Pinned — will appear at the top of the feed' : 'Pin this announcement'}
          </span>
        </button>
      </div>

      {/* Actions */}
      <div
        className="flex items-center justify-end gap-2 px-5 py-4"
        style={{ borderTop: '0.5px solid hsl(var(--border))' }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150"
          style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--border))')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 active:scale-95"
          style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Send size={13} /> Post announcement
        </button>
      </div>
    </motion.form>
  );
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteDialog({
  title, onConfirm, onCancel,
}: {
  title: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'hsl(var(--foreground) / 0.4)' }}
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4"
        style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1">
          <h3 className="text-[15px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            Delete announcement
          </h3>
          <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Delete{' '}
            <span className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>"{title}"</span>?
            {' '}Members will no longer see this post.
          </p>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors duration-150"
            style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--border))')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors duration-150"
            style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Single announcement card ─────────────────────────────────────────────────

function AnnouncementCard({ post, clubColor }: { post: Announcement; clubColor: string }) {
  const { togglePin, deleteAnnouncement } = useOfficerStore();
  const [expanded, setExpanded] = useState(post.pinned);
  const [deleting, setDeleting] = useState(false);

  const isLong = post.body.length > 180;
  const preview = isLong && !expanded ? post.body.slice(0, 180).trimEnd() + '…' : post.body;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'hsl(var(--card))',
          border: post.pinned
            ? '1.5px solid hsl(var(--accent) / 0.4)'
            : '0.5px solid hsl(var(--border))',
        }}
      >
        {/* Pinned banner */}
        {post.pinned && (
          <div
            className="flex items-center gap-1.5 px-5 py-2"
            style={{ background: 'hsl(var(--accent) / 0.08)', borderBottom: '0.5px solid hsl(var(--accent) / 0.2)' }}
          >
            <Pin size={10} style={{ color: 'hsl(var(--accent))' }} />
            <span className="text-[10px] font-bold" style={{ color: 'hsl(var(--accent))' }}>
              PINNED
            </span>
          </div>
        )}

        {/* Body */}
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-[14px] font-semibold leading-snug" style={{ color: 'hsl(var(--foreground))' }}>
              {post.title}
            </h3>
            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => togglePin(post.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                style={{
                  background: post.pinned ? 'hsl(var(--accent) / 0.12)' : 'hsl(var(--muted))',
                  color: post.pinned ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = post.pinned ? 'hsl(var(--accent) / 0.22)' : 'hsl(var(--border))')}
                onMouseLeave={(e) => (e.currentTarget.style.background = post.pinned ? 'hsl(var(--accent) / 0.12)' : 'hsl(var(--muted))')}
                title={post.pinned ? 'Unpin' : 'Pin'}
              >
                {post.pinned ? <PinOff size={11} /> : <Pin size={11} />}
              </button>
              <button
                onClick={() => setDeleting(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                style={{ background: 'hsl(var(--destructive) / 0.08)', color: 'hsl(var(--destructive))' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--destructive) / 0.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--destructive) / 0.08)')}
                title="Delete"
              >
                <Trash2 size={11} />
              </button>
            </div>
          </div>

          {/* Author + time */}
          <div className="flex items-center gap-2 mt-2 mb-3">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-bold shrink-0"
              style={{ background: `hsl(${clubColor} 65% 45%)`, color: 'hsl(var(--primary-foreground))' }}
            >
              {initials(post.author)}
            </div>
            <span className="text-[11px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {post.author}
            </span>
            <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>·</span>
            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <Clock size={9} /> {relativeTime(post.postedAt)}
            </span>
          </div>

          {/* Body text */}
          <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {preview}
          </p>

          {/* Expand toggle for long posts */}
          {isLong && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 mt-2 text-[11px] font-medium transition-opacity duration-150 hover:opacity-70"
              style={{ color: 'hsl(var(--primary))' }}
            >
              {expanded ? (
                <><ChevronUp size={11} /> Show less</>
              ) : (
                <><ChevronDown size={11} /> Read more</>
              )}
            </button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {deleting && (
          <DeleteDialog
            title={post.title}
            onConfirm={() => { deleteAnnouncement(post.id); setDeleting(false); }}
            onCancel={() => setDeleting(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export default function AnnouncementsTab() {
  const { club, addAnnouncement } = useOfficerStore();
  const [composing, setComposing] = useState(false);

  const pinned  = club.announcements.filter((a) => a.pinned);
  const recent  = club.announcements.filter((a) => !a.pinned)
    .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());

  function handlePost(draft: { title: string; body: string; pinned: boolean }) {
    addAnnouncement({ title: draft.title, body: draft.body, author: 'Alex Chen', pinned: draft.pinned });
    setComposing(false);
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Stats row ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-2 md:grid-cols-3 gap-3"
      >
        {[
          {
            label: 'Total posts',
            value: String(club.announcements.length),
            sub: 'this semester',
            icon: <Megaphone size={13} />,
            colorVar: 'hsl(var(--primary))',
          },
          {
            label: 'Pinned',
            value: String(pinned.length),
            sub: pinned.length === 1 ? '1 post at top of feed' : `${pinned.length} posts at top of feed`,
            icon: <Pin size={13} />,
            colorVar: pinned.length > 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
          },
          {
            label: 'Latest post',
            value: club.announcements.length > 0
              ? relativeTime(
                  [...club.announcements].sort(
                    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
                  )[0].postedAt,
                )
              : '—',
            sub: 'most recent activity',
            icon: <Clock size={13} />,
            colorVar: 'hsl(var(--muted-foreground))',
          },
        ].map(({ label, value, sub, icon, colorVar }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04 }}
            className="p-4 rounded-2xl flex flex-col gap-1.5"
            style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
              <span style={{ color: colorVar }}>{icon}</span>
            </div>
            <span
              className="text-[24px] font-bold leading-none"
              style={{ color: 'hsl(var(--foreground))', fontFamily: 'var(--font-mono)' }}
            >
              {value}
            </span>
            <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{sub}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {club.announcements.length} announcement{club.announcements.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => setComposing(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 active:scale-95"
          style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={14} /> New announcement
        </button>
      </div>

      {/* ── Compose form ── */}
      <AnimatePresence>
        {composing && (
          <ComposeForm onPost={handlePost} onCancel={() => setComposing(false)} />
        )}
      </AnimatePresence>

      {/* ── Pinned section ── */}
      <AnimatePresence>
        {pinned.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <Pin size={12} style={{ color: 'hsl(var(--accent))' }} />
              <span className="text-[12px] font-semibold" style={{ color: 'hsl(var(--accent))' }}>
                Pinned
              </span>
            </div>
            <AnimatePresence initial={false}>
              {pinned.map((a) => (
                <AnnouncementCard key={a.id} post={a} clubColor={club.color} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Recent section ── */}
      {recent.length > 0 && (
        <div className="flex flex-col gap-3">
          {pinned.length > 0 && (
            <div className="flex items-center gap-2">
              <Megaphone size={12} style={{ color: 'hsl(var(--muted-foreground))' }} />
              <span className="text-[12px] font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Recent
              </span>
            </div>
          )}
          <AnimatePresence initial={false}>
            {recent.map((a) => (
              <AnnouncementCard key={a.id} post={a} clubColor={club.color} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Empty state ── */}
      {club.announcements.length === 0 && !composing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
          style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
        >
          <Megaphone size={28} style={{ color: 'hsl(var(--muted-foreground))' }} />
          <p className="text-[14px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
            No announcements yet
          </p>
          <p className="text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Post your first announcement to keep members informed.
          </p>
          <button
            onClick={() => setComposing(true)}
            className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150"
            style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          >
            <Plus size={13} /> New announcement
          </button>
        </motion.div>
      )}

    </div>
  );
}
