/**
 * MembersTab — full roster with attendance bars, role badges,
 * pending join requests with approve/deny, and remove-member action.
 */
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, UserCheck, UserX, UserMinus, Search, ChevronDown, TrendingUp, Award, Clock, Filter } from 'lucide-react';
import { useOfficerStore } from '@/lib/officer-store';
import type { Member } from '@/lib/officer-store';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function attendancePct(m: Member) {
  return m.eventsTotal > 0 ? Math.round((m.eventsAttended / m.eventsTotal) * 100) : 0;
}

function attendanceColor(pct: number) {
  if (pct >= 80) return 'hsl(var(--success))';
  if (pct >= 55) return 'hsl(var(--warning))';
  return 'hsl(var(--destructive))';
}

const ROLE_ORDER = ['President', 'VP Events', 'VP Education', 'VP Marketing', 'Treasurer', 'Secretary', 'Member'];

function roleRank(role: string) {
  const i = ROLE_ORDER.indexOf(role);
  return i === -1 ? 99 : i;
}

type SortKey = 'name' | 'role' | 'attendance' | 'joined';

// ─── Confirm dialog ───────────────────────────────────────────────────────────

function ConfirmDialog({
  name, onConfirm, onCancel,
}: {
  name: string; onConfirm: () => void; onCancel: () => void;
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
            Remove member
          </h3>
          <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Remove <span className="font-medium" style={{ color: 'hsl(var(--foreground))' }}>{name}</span> from the club?
            They will need to re-apply to rejoin.
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
            Remove
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Pending request card ─────────────────────────────────────────────────────

function PendingCard({ member, clubColor }: { member: Member; clubColor: string }) {
  const { approveMember, denyMember } = useOfficerStore();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{ background: 'hsl(var(--accent) / 0.06)', border: '0.5px solid hsl(var(--accent) / 0.2)' }}
    >
      {/* Avatar */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
        style={{ background: `hsl(${clubColor} 65% 45%)`, color: 'hsl(var(--primary-foreground))' }}
      >
        {initials(member.name)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
          {member.name}
        </div>
        <div className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {member.email}
        </div>
      </div>

      <span
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 hidden sm:inline"
        style={{ background: 'hsl(var(--accent) / 0.15)', color: 'hsl(var(--accent))' }}
      >
        Pending
      </span>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => approveMember(member.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-150 active:scale-95"
          style={{ background: 'hsl(var(--success) / 0.12)', color: 'hsl(var(--success))' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--success) / 0.22)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--success) / 0.12)')}
        >
          <UserCheck size={12} />
          <span className="hidden sm:inline">Approve</span>
        </button>
        <button
          onClick={() => denyMember(member.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all duration-150 active:scale-95"
          style={{ background: 'hsl(var(--destructive) / 0.08)', color: 'hsl(var(--destructive))' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--destructive) / 0.18)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--destructive) / 0.08)')}
        >
          <UserX size={12} />
          <span className="hidden sm:inline">Deny</span>
        </button>
      </div>
    </motion.div>
  );
}

// ─── Active member row ────────────────────────────────────────────────────────

function MemberRow({
  member, clubColor, isLast,
}: {
  member: Member; clubColor: string; isLast: boolean;
}) {
  const { removeMember } = useOfficerStore();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pct = attendancePct(member);
  const isOfficer = roleRank(member.role) < ROLE_ORDER.indexOf('Member');

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.18 }}
        className="flex items-center gap-4 px-5 py-3.5 group"
        style={{ borderBottom: isLast ? 'none' : '0.5px solid hsl(var(--border))' }}
      >
        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{ background: `hsl(${clubColor} 65% 45%)`, color: 'hsl(var(--primary-foreground))' }}
        >
          {initials(member.name)}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              {member.name}
            </span>
            {isOfficer && (
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}
              >
                {member.role.toUpperCase()}
              </span>
            )}
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {member.email}
          </div>
        </div>

        {/* Joined semester */}
        <div className="hidden md:flex flex-col items-end shrink-0 w-28">
          <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <Clock size={9} className="inline mr-1" />
            {member.joinedSemester}
          </span>
        </div>

        {/* Attendance bar */}
        <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-28">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[12px] font-semibold"
              style={{ color: attendanceColor(pct), fontFamily: 'var(--font-mono)' }}
            >
              {pct}%
            </span>
            <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              ({member.eventsAttended}/{member.eventsTotal})
            </span>
          </div>
          <div
            className="w-24 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'hsl(var(--muted))' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: attendanceColor(pct) }}
            />
          </div>
        </div>

        {/* Remove button (visible on hover) */}
        <button
          onClick={() => setConfirmOpen(true)}
          className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150"
          style={{ background: 'hsl(var(--destructive) / 0.08)', color: 'hsl(var(--destructive))' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--destructive) / 0.18)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--destructive) / 0.08)')}
          aria-label={`Remove ${member.name}`}
        >
          <UserMinus size={12} />
        </button>
      </motion.div>

      <AnimatePresence>
        {confirmOpen && (
          <ConfirmDialog
            name={member.name}
            onConfirm={() => { removeMember(member.id); setConfirmOpen(false); }}
            onCancel={() => setConfirmOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main tab ─────────────────────────────────────────────────────────────────

export default function MembersTab() {
  const { club } = useOfficerStore();

  const pending = club.members.filter((m) => m.status === 'pending');
  const active  = club.members.filter((m) => m.status === 'active');

  const [query, setQuery]       = useState('');
  const [sortKey, setSortKey]   = useState<SortKey>('role');
  const [sortAsc, setSortAsc]   = useState(true);
  const [showSort, setShowSort] = useState(false);

  // Aggregate stats
  const avgPct = active.length > 0
    ? Math.round(active.reduce((s, m) => s + attendancePct(m), 0) / active.length)
    : 0;
  const topAttenders = [...active].sort((a, b) => attendancePct(b) - attendancePct(a)).slice(0, 3);

  // Filter + sort
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = active.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q),
    );
    return list.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name')       cmp = a.name.localeCompare(b.name);
      if (sortKey === 'role')       cmp = roleRank(a.role) - roleRank(b.role);
      if (sortKey === 'attendance') cmp = attendancePct(a) - attendancePct(b);
      if (sortKey === 'joined')     cmp = a.joinedSemester.localeCompare(b.joinedSemester);
      return sortAsc ? cmp : -cmp;
    });
  }, [active, query, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
    setShowSort(false);
  }

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'role',       label: 'Role' },
    { key: 'name',       label: 'Name' },
    { key: 'attendance', label: 'Attendance' },
    { key: 'joined',     label: 'Joined' },
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
            label: 'Active members',
            value: String(active.length),
            sub: `${club.healthInputs.memberCount} on roster`,
            icon: <Users size={13} />,
            colorVar: 'hsl(var(--primary))',
          },
          {
            label: 'Pending requests',
            value: String(pending.length),
            sub: pending.length === 0 ? 'All caught up' : `${pending.length} awaiting review`,
            icon: <UserCheck size={13} />,
            colorVar: pending.length > 0 ? 'hsl(var(--accent))' : 'hsl(var(--muted-foreground))',
          },
          {
            label: 'Avg attendance',
            value: `${avgPct}%`,
            sub: 'across active members',
            icon: <TrendingUp size={13} />,
            colorVar: avgPct >= 70 ? 'hsl(var(--success))' : avgPct >= 50 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))',
          },
          {
            label: 'Perfect attendance',
            value: String(active.filter((m) => m.eventsTotal > 0 && m.eventsAttended === m.eventsTotal).length),
            sub: 'attended every event',
            icon: <Award size={13} />,
            colorVar: 'hsl(var(--success))',
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

      {/* ── Pending requests ── */}
      <AnimatePresence>
        {pending.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl overflow-hidden"
            style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
          >
            <div
              className="flex items-center gap-2 px-5 py-4"
              style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
            >
              <UserCheck size={14} style={{ color: 'hsl(var(--accent))' }} />
              <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                Join requests
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--secondary))' }}
              >
                {pending.length}
              </span>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <AnimatePresence initial={false}>
                {pending.map((m) => (
                  <PendingCard key={m.id} member={m} clubColor={club.color} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top attenders spotlight ── */}
      {topAttenders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
        >
          <div
            className="flex items-center gap-2 px-5 py-4"
            style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
          >
            <Award size={14} style={{ color: 'hsl(var(--accent))' }} />
            <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
              Top attenders this semester
            </span>
          </div>
          <div className="flex flex-col sm:flex-row gap-0 sm:divide-x" style={{ borderColor: 'hsl(var(--border))' }}>
            {topAttenders.map((m, i) => {
              const pct = attendancePct(m);
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div
                  key={m.id}
                  className="flex-1 flex items-center gap-3 px-5 py-4"
                  style={{ borderBottom: i < topAttenders.length - 1 ? '0.5px solid hsl(var(--border))' : 'none' }}
                >
                  <span className="text-[20px] shrink-0">{medals[i]}</span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: `hsl(${club.color} 65% 45%)`, color: 'hsl(var(--primary-foreground))' }}
                  >
                    {initials(m.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold truncate" style={{ color: 'hsl(var(--foreground))' }}>
                      {m.name}
                    </div>
                    <div className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {m.eventsAttended}/{m.eventsTotal} events
                    </div>
                  </div>
                  <span
                    className="text-[14px] font-bold shrink-0"
                    style={{ color: attendanceColor(pct), fontFamily: 'var(--font-mono)' }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Full roster ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
      >
        {/* Toolbar */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
        >
          <Users size={14} style={{ color: 'hsl(var(--primary))' }} />
          <span className="text-[14px] font-semibold flex-1" style={{ color: 'hsl(var(--foreground))' }}>
            Active roster
          </span>

          {/* Search */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1 max-w-[220px]"
            style={{ background: 'hsl(var(--muted))', border: '0.5px solid hsl(var(--border))' }}
          >
            <Search size={12} style={{ color: 'hsl(var(--muted-foreground))' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search members…"
              className="flex-1 bg-transparent text-[12px] outline-none"
              style={{ color: 'hsl(var(--foreground))' }}
            />
          </div>

          {/* Sort dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSort((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium transition-all duration-150"
              style={{
                background: showSort ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted))',
                color: showSort ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                border: '0.5px solid hsl(var(--border))',
              }}
            >
              <Filter size={11} />
              <span className="hidden sm:inline">Sort</span>
              <ChevronDown size={10} />
            </button>
            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 w-40 rounded-xl overflow-hidden z-20"
                  style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))', boxShadow: '0 8px 24px hsl(var(--foreground) / 0.08)' }}
                >
                  {SORT_OPTIONS.map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => toggleSort(key)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-[12px] transition-colors duration-100"
                      style={{
                        color: sortKey === key ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                        background: sortKey === key ? 'hsl(var(--primary) / 0.06)' : 'transparent',
                      }}
                      onMouseEnter={(e) => { if (sortKey !== key) e.currentTarget.style.background = 'hsl(var(--muted))'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = sortKey === key ? 'hsl(var(--primary) / 0.06)' : 'transparent'; }}
                    >
                      {label}
                      {sortKey === key && (
                        <span className="text-[10px]">{sortAsc ? '↑' : '↓'}</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Column headers */}
        <div
          className="hidden sm:grid px-5 py-2"
          style={{
            gridTemplateColumns: '36px 1fr 112px 112px 28px',
            gap: '16px',
            borderBottom: '0.5px solid hsl(var(--border))',
            background: 'hsl(var(--muted) / 0.4)',
          }}
        >
          {['', 'Member', 'Joined', 'Attendance', ''].map((h, i) => (
            <span key={i} className="text-[10px] font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-5 py-10 flex flex-col items-center gap-2">
            <Search size={24} style={{ color: 'hsl(var(--muted-foreground))' }} />
            <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              No members match "{query}"
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            <AnimatePresence initial={false}>
              {filtered.map((m, i) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  clubColor={club.color}
                  isLast={i === filtered.length - 1}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: '0.5px solid hsl(var(--border))' }}
          >
            <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {filtered.length} of {active.length} members
              {query && ` matching "${query}"`}
            </span>
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-[11px] font-medium transition-opacity duration-150 hover:opacity-70"
                style={{ color: 'hsl(var(--primary))' }}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </motion.div>

    </div>
  );
}
