/**
 * EventsTab — upcoming events list with create, inline-edit, and delete.
 * All state lives in the officer store; no local persistence needed yet.
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CalendarDays, MapPin, Clock, Users, Plus, Pencil,
  Trash2, Save, X, ChevronDown, ChevronUp, CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useOfficerStore } from '@/lib/officer-store';
import type { ClubEvent } from '@/lib/officer-store';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today  = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function capacityColor(pct: number) {
  if (pct >= 90) return 'hsl(var(--destructive))';
  if (pct >= 70) return 'hsl(var(--warning))';
  return 'hsl(var(--success))';
}

// Today's date as YYYY-MM-DD
function todayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

// ─── Empty form state ─────────────────────────────────────────────────────────

type EventDraft = Omit<ClubEvent, 'id' | 'rsvpCount'>;

function emptyDraft(): EventDraft {
  return { title: '', date: '', time: '', location: '', description: '', capacity: 50 };
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
        {label}
        {required && <span style={{ color: 'hsl(var(--destructive))' }}> *</span>}
      </label>
      {children}
      {error && (
        <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--destructive))' }}>
          <AlertCircle size={10} /> {error}
        </span>
      )}
    </div>
  );
}

const inputCls = `
  w-full px-3 py-2 rounded-xl text-[13px] outline-none transition-all duration-150
`.trim();

function inputStyle(focused: boolean, error?: string) {
  return {
    background: 'hsl(var(--background))',
    color: 'hsl(var(--foreground))',
    border: `1.5px solid ${
      error
        ? 'hsl(var(--destructive))'
        : focused
        ? 'hsl(var(--primary))'
        : 'hsl(var(--border))'
    }`,
  };
}

// ─── Event form (create + edit) ───────────────────────────────────────────────

function EventForm({
  initial, onSave, onCancel, isEdit = false,
}: {
  initial: EventDraft;
  onSave: (d: EventDraft) => void;
  onCancel: () => void;
  isEdit?: boolean;
}) {
  const [draft, setDraft] = useState<EventDraft>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof EventDraft, string>>>({});
  const [focused, setFocused] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);

  function set<K extends keyof EventDraft>(key: K, val: EventDraft[K]) {
    setDraft((d) => ({ ...d, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validate(): boolean {
    const e: typeof errors = {};
    if (!draft.title.trim())    e.title    = 'Event name is required';
    if (!draft.date)            e.date     = 'Date is required';
    if (!draft.time.trim())     e.time     = 'Time is required';
    if (!draft.location.trim()) e.location = 'Location is required';
    if (draft.capacity < 1)     e.capacity = 'Capacity must be at least 1';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (validate()) onSave(draft);
  }

  const fb = (k: string) => ({
    onFocus: () => setFocused(k),
    onBlur:  () => setFocused(null),
  });

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
          <CalendarDays size={14} style={{ color: 'hsl(var(--primary))' }} />
          <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
            {isEdit ? 'Edit event' : 'New event'}
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
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title — full width */}
        <div className="sm:col-span-2">
          <Field label="Event name" required error={errors.title}>
            <input
              ref={titleRef}
              value={draft.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Stock Pitch Competition"
              className={inputCls}
              style={inputStyle(focused === 'title', errors.title)}
              {...fb('title')}
            />
          </Field>
        </div>

        <Field label="Date" required error={errors.date}>
          <input
            type="date"
            value={draft.date}
            min={todayStr()}
            onChange={(e) => set('date', e.target.value)}
            className={inputCls}
            style={inputStyle(focused === 'date', errors.date)}
            {...fb('date')}
          />
        </Field>

        <Field label="Time" required error={errors.time}>
          <input
            value={draft.time}
            onChange={(e) => set('time', e.target.value)}
            placeholder="e.g. 6:00 PM"
            className={inputCls}
            style={inputStyle(focused === 'time', errors.time)}
            {...fb('time')}
          />
        </Field>

        <Field label="Location" required error={errors.location}>
          <input
            value={draft.location}
            onChange={(e) => set('location', e.target.value)}
            placeholder="e.g. LaCava 220"
            className={inputCls}
            style={inputStyle(focused === 'location', errors.location)}
            {...fb('location')}
          />
        </Field>

        <Field label="Capacity" error={errors.capacity}>
          <input
            type="number"
            min={1}
            max={999}
            value={draft.capacity}
            onChange={(e) => set('capacity', parseInt(e.target.value) || 0)}
            className={inputCls}
            style={inputStyle(focused === 'capacity', errors.capacity)}
            {...fb('capacity')}
          />
        </Field>

        {/* Description — full width */}
        <div className="sm:col-span-2">
          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="What should members know about this event?"
              rows={3}
              className={`${inputCls} resize-none`}
              style={inputStyle(focused === 'description')}
              {...fb('description')}
            />
          </Field>
        </div>
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
          <Save size={13} />
          {isEdit ? 'Save changes' : 'Create event'}
        </button>
      </div>
    </motion.form>
  );
}

// ─── Delete confirm dialog ────────────────────────────────────────────────────

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
            Delete event
          </h3>
          <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Delete{' '}
            <span className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>
              {title}
            </span>
            ? This cannot be undone and all RSVPs will be lost.
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

// ─── Single event card ────────────────────────────────────────────────────────

function EventCard({ event }: { event: ClubEvent }) {
  const { updateEvent, deleteEvent } = useOfficerStore();
  const [expanded, setExpanded]   = useState(false);
  const [editing, setEditing]     = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const fillPct  = event.capacity > 0 ? Math.round((event.rsvpCount / event.capacity) * 100) : 0;
  const fillClr  = capacityColor(fillPct);
  const days     = daysUntil(event.date);
  const isPast   = days < 0;

  function handleSave(draft: EventDraft) {
    updateEvent(event.id, draft);
    setEditing(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  if (editing) {
    return (
      <EventForm
        initial={{ title: event.title, date: event.date, time: event.time, location: event.location, description: event.description, capacity: event.capacity }}
        onSave={handleSave}
        onCancel={() => setEditing(false)}
        isEdit
      />
    );
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'hsl(var(--card))',
          border: `0.5px solid ${isPast ? 'hsl(var(--border))' : 'hsl(var(--border))'}`,
          opacity: isPast ? 0.6 : 1,
        }}
      >
        {/* Card header row */}
        <div className="flex items-start gap-4 px-5 py-4">
          {/* Date badge */}
          <div
            className="shrink-0 w-12 flex flex-col items-center justify-center rounded-xl py-2"
            style={{ background: isPast ? 'hsl(var(--muted))' : 'hsl(var(--primary) / 0.08)' }}
          >
            <span
              className="text-[9px] font-bold"
              style={{ color: isPast ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))' }}
            >
              {new Date(event.date + 'T00:00:00')
                .toLocaleDateString('en-US', { month: 'short' })
                .toUpperCase()}
            </span>
            <span
              className="text-[20px] font-bold leading-tight"
              style={{
                color: isPast ? 'hsl(var(--muted-foreground))' : 'hsl(var(--primary))',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {new Date(event.date + 'T00:00:00').getDate()}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                {event.title}
              </span>
              {justSaved && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'hsl(var(--success) / 0.12)', color: 'hsl(var(--success))' }}
                >
                  <CheckCircle2 size={9} /> Saved
                </motion.span>
              )}
              {!isPast && days === 0 && (
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--secondary))' }}
                >
                  TODAY
                </span>
              )}
              {!isPast && days > 0 && days <= 3 && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'hsl(var(--warning) / 0.12)', color: 'hsl(var(--warning))' }}
                >
                  {days}d away
                </span>
              )}
              {isPast && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                >
                  Past
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
              <span
                className="flex items-center gap-1 text-[12px]"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <Clock size={10} /> {event.time}
              </span>
              <span
                className="flex items-center gap-1 text-[12px]"
                style={{ color: 'hsl(var(--muted-foreground))' }}
              >
                <MapPin size={10} /> {event.location}
              </span>
            </div>
          </div>

          {/* Capacity + actions */}
          <div className="shrink-0 flex flex-col items-end gap-2">
            {/* RSVP count */}
            <div className="flex items-center gap-1.5">
              <Users size={11} style={{ color: 'hsl(var(--muted-foreground))' }} />
              <span
                className="text-[12px] font-semibold"
                style={{ color: fillPct >= 70 ? fillClr : 'hsl(var(--foreground))', fontFamily: 'var(--font-mono)' }}
              >
                {event.rsvpCount}/{event.capacity}
              </span>
            </div>
            {/* Capacity bar */}
            <div
              className="w-20 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'hsl(var(--muted))' }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${fillPct}%`, background: fillClr }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1 mt-1">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--border))')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
              >
                <Pencil size={10} /> Edit
              </button>
              <button
                onClick={() => setDeleting(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
                style={{ background: 'hsl(var(--destructive) / 0.08)', color: 'hsl(var(--destructive))' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--destructive) / 0.18)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--destructive) / 0.08)')}
              >
                <Trash2 size={10} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Expand toggle for description */}
        {event.description && (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-5 py-2 text-[11px] font-medium transition-colors duration-100"
              style={{
                borderTop: '0.5px solid hsl(var(--border))',
                color: 'hsl(var(--muted-foreground))',
                background: expanded ? 'hsl(var(--muted) / 0.5)' : 'transparent',
              }}
            >
              <span>{expanded ? 'Hide description' : 'Show description'}</span>
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p
                    className="px-5 py-4 text-[13px] leading-relaxed"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                  >
                    {event.description}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {deleting && (
          <DeleteDialog
            title={event.title}
            onConfirm={() => { deleteEvent(event.id); setDeleting(false); }}
            onCancel={() => setDeleting(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export default function EventsTab() {
  const { club, addEvent } = useOfficerStore();
  const [creating, setCreating] = useState(false);
  const [filter, setFilter]     = useState<'upcoming' | 'past' | 'all'>('upcoming');

  const sorted = [...club.events].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((e) => daysUntil(e.date) >= 0);
  const past     = sorted.filter((e) => daysUntil(e.date) < 0);

  const displayed = filter === 'upcoming' ? upcoming : filter === 'past' ? past : sorted;

  const totalRsvps    = upcoming.reduce((s, e) => s + e.rsvpCount, 0);
  const totalCapacity = upcoming.reduce((s, e) => s + e.capacity, 0);
  const avgFill       = totalCapacity > 0 ? Math.round((totalRsvps / totalCapacity) * 100) : 0;

  function handleCreate(draft: EventDraft) {
    addEvent(draft);
    setCreating(false);
  }

  const FILTERS: { key: typeof filter; label: string; count: number }[] = [
    { key: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { key: 'past',     label: 'Past',     count: past.length },
    { key: 'all',      label: 'All',      count: sorted.length },
  ];

  return (
    <div className="flex flex-col gap-5">

      {/* ── Stats row ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          {
            label: 'Upcoming events',
            value: String(upcoming.length),
            sub: 'scheduled this semester',
            icon: <CalendarDays size={13} />,
            colorVar: 'hsl(var(--primary))',
          },
          {
            label: 'Total RSVPs',
            value: String(totalRsvps),
            sub: 'across upcoming events',
            icon: <Users size={13} />,
            colorVar: 'hsl(var(--success))',
          },
          {
            label: 'Avg fill rate',
            value: `${avgFill}%`,
            sub: 'of capacity filled',
            icon: <Users size={13} />,
            colorVar: avgFill >= 70 ? 'hsl(var(--warning))' : 'hsl(var(--success))',
          },
          {
            label: 'Events hosted',
            value: String(past.length),
            sub: 'completed this semester',
            icon: <CheckCircle2 size={13} />,
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

      {/* ── Toolbar: filter chips + create button ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {/* Filter chips */}
        <div className="flex items-center gap-1.5">
          {FILTERS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-all duration-150"
              style={{
                background: filter === key ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                color: filter === key ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {label}
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: filter === key ? 'hsl(var(--primary-foreground) / 0.2)' : 'hsl(var(--border))',
                  color: filter === key ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                }}
              >
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Create button */}
        <button
          onClick={() => { setCreating(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 active:scale-95"
          style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <Plus size={14} /> New event
        </button>
      </div>

      {/* ── Create form ── */}
      <AnimatePresence>
        {creating && (
          <EventForm
            initial={emptyDraft()}
            onSave={handleCreate}
            onCancel={() => setCreating(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Event list ── */}
      {displayed.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl"
          style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
        >
          <CalendarDays size={28} style={{ color: 'hsl(var(--muted-foreground))' }} />
          <p className="text-[14px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
            {filter === 'past' ? 'No past events' : 'No events scheduled'}
          </p>
          {filter !== 'past' && (
            <p className="text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Create your first event to get started.
            </p>
          )}
          {filter !== 'past' && (
            <button
              onClick={() => setCreating(true)}
              className="mt-1 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              <Plus size={13} /> New event
            </button>
          )}
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          <AnimatePresence initial={false}>
            {displayed.map((ev) => (
              <EventCard key={ev.id} event={ev} />
            ))}
          </AnimatePresence>
        </div>
      )}

    </div>
  );
}
