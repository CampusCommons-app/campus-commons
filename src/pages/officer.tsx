import { useState, useEffect, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, CalendarDays, Megaphone, Users,
  TrendingUp, CheckCircle2, Info, Pencil, Save, RotateCcw,
  UserCheck, UserX, Clock, MapPin, ArrowUpRight,
  Minus, Plus, Shield,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/lib/auth-context';
import {
  OfficerStoreProvider, useOfficerStore,
  computeHealthScore, type HealthInputs,
} from '@/lib/officer-store';
import MembersTab from '@/components/officer/MembersTab';
import EventsTab from '@/components/officer/EventsTab';
import AnnouncementsTab from '@/components/officer/AnnouncementsTab';

// ─── Tab definition ───────────────────────────────────────────────────────────

type Tab = 'overview' | 'events' | 'announcements' | 'members';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',      label: 'Overview',      icon: <LayoutDashboard size={14} /> },
  { id: 'events',        label: 'Events',         icon: <CalendarDays size={14} /> },
  { id: 'announcements', label: 'Announcements',  icon: <Megaphone size={14} /> },
  { id: 'members',       label: 'Members',        icon: <Users size={14} /> },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Stepper input ────────────────────────────────────────────────────────────

function Stepper({
  label, sublabel, value, min = 0, max = 999, step = 1,
  suffix = '', onChange,
}: {
  label: string; sublabel?: string; value: number;
  min?: number; max?: number; step?: number;
  suffix?: string; onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!editing) setDraft(String(value)); }, [value, editing]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  function commit(raw: string) {
    const n = parseInt(raw, 10);
    if (!isNaN(n)) onChange(Math.max(min, Math.min(max, n)));
    setEditing(false);
  }

  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-2xl"
      style={{ background: 'hsl(var(--background))', border: '0.5px solid hsl(var(--border))' }}
    >
      <div>
        <div className="text-[12px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{label}</div>
        {sublabel && <div className="text-[11px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{sublabel}</div>}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150 shrink-0"
          style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--border))')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
          aria-label={`Decrease ${label}`}
        >
          <Minus size={11} />
        </button>

        <div className="flex-1 text-center">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => commit(draft)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit(draft);
                if (e.key === 'Escape') setEditing(false);
              }}
              className="w-full text-center text-[18px] font-bold rounded-lg px-1 py-0.5 outline-none"
              style={{
                background: 'hsl(var(--muted))',
                color: 'hsl(var(--foreground))',
                fontFamily: 'var(--font-mono)',
                border: '1.5px solid hsl(var(--primary))',
              }}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-full text-[22px] font-bold rounded-lg px-1 py-0.5 transition-colors duration-100"
              style={{ color: 'hsl(var(--foreground))', fontFamily: 'var(--font-mono)' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {value}{suffix}
            </button>
          )}
        </div>

        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors duration-150 shrink-0"
          style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--border))')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
          aria-label={`Increase ${label}`}
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
}

// ─── Health score arc (SVG half-circle gauge) ─────────────────────────────────

function ScoreArc({ score, tierColor }: { score: number; tierColor: string }) {
  const r = 52;
  const circ = Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <svg width="140" height="80" viewBox="0 0 140 80" className="overflow-visible" aria-hidden="true">
      <path
        d={`M 14 74 A ${r} ${r} 0 0 1 126 74`}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d={`M 14 74 A ${r} ${r} 0 0 1 126 74`}
        fill="none"
        stroke={tierColor}
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`}
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
    </svg>
  );
}

// ─── Tier config (semantic CSS vars only) ────────────────────────────────────

const TIER_META: Record<string, {
  bgVar: string; textVar: string; borderVar: string;
  tierColor: string; desc: string;
}> = {
  'At-Risk':  {
    bgVar: 'hsl(var(--destructive) / 0.1)',
    textVar: 'hsl(var(--destructive))',
    borderVar: 'hsl(var(--destructive) / 0.3)',
    tierColor: 'hsl(var(--destructive))',
    desc: 'Needs immediate attention — attendance and activity are critically low.',
  },
  'Declining': {
    bgVar: 'hsl(var(--warning) / 0.1)',
    textVar: 'hsl(var(--warning))',
    borderVar: 'hsl(var(--warning) / 0.3)',
    tierColor: 'hsl(var(--warning))',
    desc: 'Trending downward — improve meeting cadence and member engagement.',
  },
  'Healthy': {
    bgVar: 'hsl(var(--info) / 0.1)',
    textVar: 'hsl(var(--info))',
    borderVar: 'hsl(var(--info) / 0.3)',
    tierColor: 'hsl(var(--info))',
    desc: 'Solid foundation — keep up the momentum and grow your member base.',
  },
  'Thriving': {
    bgVar: 'hsl(var(--success) / 0.1)',
    textVar: 'hsl(var(--success))',
    borderVar: 'hsl(var(--success) / 0.3)',
    tierColor: 'hsl(var(--success))',
    desc: 'Excellent health — your club is a model for others on campus.',
  },
};

// ─── Score factor bar row ─────────────────────────────────────────────────────

function FactorRow({
  label, value, max, positive,
}: {
  label: string; value: number; max: number; positive: boolean;
}) {
  const pct = Math.min(100, (Math.abs(value) / max) * 100);
  const isNeg = value < 0;
  return (
    <div className="flex items-center gap-3">
      <div className="text-[11px] w-36 shrink-0" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</div>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: isNeg
              ? 'hsl(var(--destructive))'
              : positive
              ? 'hsl(var(--success))'
              : 'hsl(var(--info))',
          }}
        />
      </div>
      <div
        className="text-[11px] font-semibold w-10 text-right shrink-0"
        style={{ color: isNeg ? 'hsl(var(--destructive))' : 'hsl(var(--success))' }}
      >
        {isNeg ? '' : '+'}{value.toFixed(0)}
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const { club, updateHealthInputs, approveMember, denyMember } = useOfficerStore();
  const h = club.healthInputs;
  const { score, tier } = computeHealthScore(h);
  const meta = TIER_META[tier] ?? TIER_META['At-Risk'];

  const pending = club.members.filter((m) => m.status === 'pending');
  const active  = club.members.filter((m) => m.status === 'active');

  // Factor breakdown values
  const meetingContrib  = h.meetingsPlanned > 0 ? (h.meetingsHeld / h.meetingsPlanned) * 100 * 0.35 : 0;
  const attendContrib   = Math.min(h.avgAttendance, 100) * 0.35;
  const growthBonus     = Math.min(h.newMembersThisSemester * 2, 20);
  const eventBonus      = Math.min(h.eventsHosted * 3, 15);
  const budgetPenalty   = h.budgetUsedPct > 95 ? -10 : 0;
  const vacancyPenalty  = h.officerVacancies * -5;

  const [showInputs, setShowInputs] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const nextEvent = [...club.events].sort((a, b) => a.date.localeCompare(b.date))[0];
  const avgAttendance = active.length > 0
    ? Math.round(
        active.reduce((s, m) => s + (m.eventsTotal > 0 ? m.eventsAttended / m.eventsTotal : 0), 0)
        / active.length * 100,
      )
    : 0;

  const SEED_INPUTS: HealthInputs = {
    meetingsHeld: 3, meetingsPlanned: 14, avgAttendance: 72,
    memberCount: 142, newMembersThisSemester: 18, eventsHosted: 4,
    budgetUsedPct: 38, officerVacancies: 2,
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Row 1: Health score card + Inputs panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Health score card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp size={14} style={{ color: 'hsl(var(--primary))' }} />
              <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                Club health score
              </span>
            </div>
            <button
              onClick={() => setShowInputs((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
              style={{
                background: showInputs ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted))',
                color: showInputs ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
              }}
            >
              <Pencil size={10} />
              {showInputs ? 'Hide inputs' : 'Edit inputs'}
            </button>
          </div>

          {/* Arc + score */}
          <div className="px-5 pt-6 pb-4 flex flex-col items-center">
            <div className="relative">
              <ScoreArc score={score} tierColor={meta.tierColor} />
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                <span
                  className="text-[38px] font-bold leading-none"
                  style={{ color: meta.textVar, fontFamily: 'var(--font-mono)', transition: 'color 0.4s' }}
                >
                  {score}
                </span>
                <span className="text-[11px] font-medium mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  out of 100
                </span>
              </div>
            </div>

            {/* Tier badge */}
            <div
              className="mt-3 px-4 py-1.5 rounded-full text-[12px] font-bold"
              style={{
                background: meta.bgVar,
                color: meta.textVar,
                border: `1px solid ${meta.borderVar}`,
              }}
            >
              {tier}
            </div>
            <p className="mt-2 text-[12px] text-center max-w-[260px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {meta.desc}
            </p>
          </div>

          {/* Factor breakdown */}
          <div
            className="px-5 py-4 flex flex-col gap-2.5 mt-auto"
            style={{ borderTop: '0.5px solid hsl(var(--border))' }}
          >
            <div className="text-[11px] font-semibold mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Score breakdown
            </div>
            <FactorRow label="Meeting rate (35%)"   value={meetingContrib}  max={35} positive={true} />
            <FactorRow label="Avg attendance (35%)" value={attendContrib}   max={35} positive={true} />
            <FactorRow label="Member growth"        value={growthBonus}     max={20} positive={true} />
            <FactorRow label="Events hosted"        value={eventBonus}      max={15} positive={true} />
            {budgetPenalty < 0 && (
              <FactorRow label="Budget overrun"     value={budgetPenalty}   max={10} positive={false} />
            )}
            {vacancyPenalty < 0 && (
              <FactorRow label="Officer vacancies"  value={vacancyPenalty}  max={25} positive={false} />
            )}
          </div>
        </motion.div>

        {/* Inputs panel */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-2xl overflow-hidden flex flex-col"
          style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
          >
            <div className="flex items-center gap-2">
              <Shield size={14} style={{ color: 'hsl(var(--primary))' }} />
              <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                Health inputs
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => updateHealthInputs(SEED_INPUTS)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--border))')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
                title="Reset to defaults"
              >
                <RotateCcw size={10} /> Reset
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-150"
                style={{
                  background: saved ? 'hsl(var(--success) / 0.15)' : 'hsl(var(--primary))',
                  color: saved ? 'hsl(var(--success))' : 'hsl(var(--primary-foreground))',
                }}
              >
                {saved ? <CheckCircle2 size={10} /> : <Save size={10} />}
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <Stepper
                label="Meetings held"
                sublabel="This semester so far"
                value={h.meetingsHeld}
                max={h.meetingsPlanned}
                onChange={(v) => updateHealthInputs({ meetingsHeld: v })}
              />
              <Stepper
                label="Meetings planned"
                sublabel="Total for semester"
                value={h.meetingsPlanned}
                min={1}
                onChange={(v) => updateHealthInputs({ meetingsPlanned: v })}
              />
              <Stepper
                label="Avg attendance"
                sublabel="% of members per event"
                value={h.avgAttendance}
                max={100}
                suffix="%"
                onChange={(v) => updateHealthInputs({ avgAttendance: v })}
              />
              <Stepper
                label="Total members"
                sublabel="Active roster size"
                value={h.memberCount}
                onChange={(v) => updateHealthInputs({ memberCount: v })}
              />
              <Stepper
                label="New members"
                sublabel="Joined this semester"
                value={h.newMembersThisSemester}
                onChange={(v) => updateHealthInputs({ newMembersThisSemester: v })}
              />
              <Stepper
                label="Events hosted"
                sublabel="Non-meeting events"
                value={h.eventsHosted}
                onChange={(v) => updateHealthInputs({ eventsHosted: v })}
              />
              <Stepper
                label="Budget used"
                sublabel="% of semester budget"
                value={h.budgetUsedPct}
                max={100}
                suffix="%"
                onChange={(v) => updateHealthInputs({ budgetUsedPct: v })}
              />
              <Stepper
                label="Officer vacancies"
                sublabel="Unfilled officer roles"
                value={h.officerVacancies}
                max={10}
                onChange={(v) => updateHealthInputs({ officerVacancies: v })}
              />
            </div>

            {/* Info callout */}
            <div
              className="mt-4 flex items-start gap-2.5 p-3 rounded-xl"
              style={{
                background: 'hsl(var(--primary) / 0.06)',
                border: '0.5px solid hsl(var(--primary) / 0.15)',
              }}
            >
              <Info size={13} className="shrink-0 mt-0.5" style={{ color: 'hsl(var(--primary))' }} />
              <p className="text-[11px] leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Your health score is visible to university staff and used for funding decisions.
                Update these numbers after each meeting or event to keep your score accurate.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: Quick stats ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          {
            label: 'Active members',
            value: String(active.length),
            sub: `${h.memberCount} on roster`,
            icon: <Users size={13} />,
            colorVar: 'hsl(var(--primary))',
          },
          {
            label: 'Pending requests',
            value: String(pending.length),
            sub: pending.length === 1 ? '1 awaiting review' : `${pending.length} awaiting review`,
            icon: <UserCheck size={13} />,
            colorVar: pending.length > 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
          },
          {
            label: 'Avg attendance',
            value: `${avgAttendance}%`,
            sub: 'across active members',
            icon: <TrendingUp size={13} />,
            colorVar: avgAttendance >= 70
              ? 'hsl(var(--success))'
              : avgAttendance >= 50
              ? 'hsl(var(--warning))'
              : 'hsl(var(--destructive))',
          },
          {
            label: 'Next event',
            value: nextEvent ? formatDate(nextEvent.date) : '—',
            sub: nextEvent ? nextEvent.title : 'No events scheduled',
            icon: <CalendarDays size={13} />,
            colorVar: 'hsl(var(--primary))',
          },
        ].map(({ label, value, sub, icon, colorVar }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.1 + i * 0.04 }}
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

      {/* ── Row 3: Join requests ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.12 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
        >
          <div className="flex items-center gap-2">
            <UserCheck size={14} style={{ color: 'hsl(var(--primary))' }} />
            <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Join requests
            </span>
            {pending.length > 0 && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--secondary))' }}
              >
                {pending.length}
              </span>
            )}
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="px-5 py-10 flex flex-col items-center gap-2">
            <CheckCircle2 size={28} style={{ color: 'hsl(var(--muted-foreground))' }} />
            <p className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>All caught up</p>
            <p className="text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              No pending join requests right now.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {pending.map((member, i) => (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16, height: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.22 }}
                  className="flex items-center gap-4 px-5 py-4"
                  style={{
                    borderBottom: i < pending.length - 1 ? '0.5px solid hsl(var(--border))' : 'none',
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold shrink-0"
                    style={{
                      background: `hsl(${club.color} 65% 45%)`,
                      color: 'hsl(var(--primary-foreground))',
                    }}
                  >
                    {initials(member.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                      {member.name}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {member.email}
                    </div>
                  </div>

                  {/* Pending chip */}
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded-full shrink-0 hidden sm:inline"
                    style={{
                      background: 'hsl(var(--accent) / 0.12)',
                      color: 'hsl(var(--accent))',
                    }}
                  >
                    Pending
                  </span>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveMember(member.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 active:scale-95"
                      style={{
                        background: 'hsl(var(--success) / 0.12)',
                        color: 'hsl(var(--success))',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--success) / 0.22)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--success) / 0.12)')}
                    >
                      <UserCheck size={12} />
                      <span className="hidden sm:inline">Approve</span>
                    </button>
                    <button
                      onClick={() => denyMember(member.id)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 active:scale-95"
                      style={{
                        background: 'hsl(var(--destructive) / 0.08)',
                        color: 'hsl(var(--destructive))',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--destructive) / 0.18)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--destructive) / 0.08)')}
                    >
                      <UserX size={12} />
                      <span className="hidden sm:inline">Deny</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* ── Row 4: Upcoming events preview ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
        >
          <div className="flex items-center gap-2">
            <CalendarDays size={14} style={{ color: 'hsl(var(--primary))' }} />
            <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Upcoming events
            </span>
          </div>
        </div>

        {club.events.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              No events scheduled yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {[...club.events]
              .sort((a, b) => a.date.localeCompare(b.date))
              .slice(0, 3)
              .map((ev, i, arr) => {
                const fillPct = ev.capacity > 0 ? Math.round((ev.rsvpCount / ev.capacity) * 100) : 0;
                const fillColor =
                  fillPct >= 90
                    ? 'hsl(var(--destructive))'
                    : fillPct >= 70
                    ? 'hsl(var(--warning))'
                    : 'hsl(var(--success))';
                return (
                  <div
                    key={ev.id}
                    className="flex items-center gap-4 px-5 py-3.5"
                    style={{
                      borderBottom: i < arr.length - 1 ? '0.5px solid hsl(var(--border))' : 'none',
                    }}
                  >
                    {/* Date badge */}
                    <div
                      className="shrink-0 w-10 flex flex-col items-center justify-center rounded-xl py-1.5"
                      style={{ background: 'hsl(var(--muted))', minWidth: '40px' }}
                    >
                      <span
                        className="text-[9px] font-bold"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                      >
                        {new Date(ev.date + 'T00:00:00')
                          .toLocaleDateString('en-US', { month: 'short' })
                          .toUpperCase()}
                      </span>
                      <span
                        className="text-[16px] font-bold leading-tight"
                        style={{ color: 'hsl(var(--foreground))', fontFamily: 'var(--font-mono)' }}
                      >
                        {new Date(ev.date + 'T00:00:00').getDate()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                        {ev.title}
                      </div>
                      <div className="flex flex-wrap gap-x-3 mt-0.5">
                        <span
                          className="flex items-center gap-1 text-[11px]"
                          style={{ color: 'hsl(var(--muted-foreground))' }}
                        >
                          <Clock size={9} /> {ev.time}
                        </span>
                        <span
                          className="flex items-center gap-1 text-[11px]"
                          style={{ color: 'hsl(var(--muted-foreground))' }}
                        >
                          <MapPin size={9} /> {ev.location}
                        </span>
                      </div>
                    </div>

                    {/* Capacity bar */}
                    <div className="shrink-0 text-right">
                      <div
                        className="text-[11px] font-semibold"
                        style={{
                          color: fillPct >= 70 ? 'hsl(var(--warning))' : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        {ev.rsvpCount}/{ev.capacity}
                      </div>
                      <div
                        className="w-16 h-1.5 rounded-full mt-1 overflow-hidden"
                        style={{ background: 'hsl(var(--muted))' }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${fillPct}%`, background: fillColor }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </motion.div>

      {/* ── Row 5: Recent announcements preview ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.18 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
        >
          <div className="flex items-center gap-2">
            <Megaphone size={14} style={{ color: 'hsl(var(--primary))' }} />
            <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Recent announcements
            </span>
          </div>
        </div>
        <div className="flex flex-col">
          {club.announcements.slice(0, 2).map((a, i) => (
            <div
              key={a.id}
              className="flex items-start gap-3 px-5 py-4"
              style={{
                borderBottom: i === 0 ? '0.5px solid hsl(var(--border))' : 'none',
              }}
            >
              {a.pinned && (
                <span
                  className="shrink-0 mt-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{
                    background: 'hsl(var(--accent) / 0.15)',
                    color: 'hsl(var(--accent))',
                  }}
                >
                  PINNED
                </span>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                  {a.title}
                </div>
                <div
                  className="text-[12px] mt-0.5 line-clamp-2"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                >
                  {a.body}
                </div>
                <div className="text-[11px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {a.author} · {relativeTime(a.postedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

// ─── Placeholder tab ──────────────────────────────────────────────────────────


// ─── Inner page (needs store context) ────────────────────────────────────────

function OfficerPageInner() {
  const { club } = useOfficerStore();
  const [tab, setTab] = useState<Tab>('overview');

  return (
    <>
      <Helmet>
        <title>Officer Dashboard — {club.name} · Campus Commons</title>
        <meta
          name="description"
          content={`Manage ${club.name} — health score, events, announcements, and members.`}
        />
        <link rel="canonical" href="https://campuscommons.app/officer" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen pt-20 pb-16" style={{ background: 'hsl(var(--background))' }}>

        {/* ── Club banner ── */}
        <div
          className="w-full px-4 sm:px-6 py-5"
          style={{
            background: `linear-gradient(135deg, hsl(${club.color} 65% 18%), hsl(${club.color} 55% 28%))`,
          }}
        >
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-[14px] font-bold shrink-0"
              style={{
                background: 'hsl(var(--primary-foreground) / 0.15)',
                color: 'hsl(var(--primary-foreground))',
              }}
            >
              {club.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1
                  className="text-[20px] font-bold"
                  style={{
                    color: 'hsl(var(--primary-foreground))',
                    fontFamily: 'var(--font-heading)',
                  }}
                >
                  {club.name}
                </h1>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'hsl(var(--primary-foreground) / 0.15)',
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  OFFICER VIEW
                </span>
              </div>
              <p
                className="text-[12px] mt-0.5"
                style={{ color: 'hsl(var(--primary-foreground) / 0.75)' }}
              >
                {club.category} · {club.meetingSchedule} · {club.location}
              </p>
            </div>
            <Link
              to={`/bentley/clubs/${club.id}`}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-150"
              style={{
                background: 'hsl(var(--primary-foreground) / 0.15)',
                color: 'hsl(var(--primary-foreground))',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--primary-foreground) / 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--primary-foreground) / 0.15)')}
            >
              <ArrowUpRight size={13} /> Public page
            </Link>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div
          className="sticky top-[60px] z-30 w-full"
          style={{
            background: 'hsl(var(--card))',
            borderBottom: '0.5px solid hsl(var(--border))',
          }}
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="flex items-center gap-2 px-4 py-3.5 text-[13px] font-medium whitespace-nowrap transition-all duration-150 border-b-2 -mb-px"
                  style={{
                    color: tab === t.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                    borderBottomColor: tab === t.id ? 'hsl(var(--primary))' : 'transparent',
                  }}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
            >
              {tab === 'overview'      && <OverviewTab />}
              {tab === 'events'        && <EventsTab />}
              {tab === 'announcements' && <AnnouncementsTab />}
              {tab === 'members'       && <MembersTab />}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>
    </>
  );
}

// ─── Exported page (auth guard + store provider) ──────────────────────────────

export default function OfficerPage() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSignedIn) navigate('/login', { replace: true });
  }, [isSignedIn, navigate]);

  if (!isSignedIn) return null;

  return (
    <OfficerStoreProvider>
      <OfficerPageInner />
    </OfficerStoreProvider>
  );
}
