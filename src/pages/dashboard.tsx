import { dashboard } from 'virtual:content';
import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, ChevronRight, Clock, MapPin, Users,
  CheckCircle2, Hourglass, ExternalLink, Calendar,
  TrendingUp, Bell, X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/lib/auth-context';

// ─── Calendar helpers ─────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

// ─── Mock events keyed by "YYYY-MM-DD" ───────────────────────────────────────

const today = new Date();
const Y = today.getFullYear();
const M = today.getMonth(); // 0-indexed

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Seed events relative to today so the calendar always looks populated
const EVENTS_BY_DATE: Record<string, { id: string; title: string; time: string; location: string; clubId: string; clubName: string; clubColor: string }[]> = {
  [dateKey(Y, M, today.getDate())]: [
    { id: 'e-t1', title: 'Finance Club — Weekly Meeting', time: '6:00 PM', location: 'LaCava 220', clubId: '1', clubName: 'Finance Club', clubColor: '215' },
  ],
  [dateKey(Y, M, Math.min(today.getDate() + 2, getDaysInMonth(Y, M)))]: [
    { id: 'e-a1', title: 'Stock Pitch Competition', time: '6:00 PM', location: 'LaCava 220', clubId: '1', clubName: 'Finance Club', clubColor: '215' },
  ],
  [dateKey(Y, M, Math.min(today.getDate() + 5, getDaysInMonth(Y, M)))]: [
    { id: 'e-a2', title: 'Bloomberg Terminal Workshop', time: '5:30 PM', location: 'Adamian 127', clubId: '1', clubName: 'Finance Club', clubColor: '215' },
    { id: 'e-a3', title: 'Case Cracking Session', time: '6:00 PM', location: 'Morison 110', clubId: '11', clubName: 'Consulting Club', clubColor: '262' },
  ],
  [dateKey(Y, M, Math.min(today.getDate() + 9, getDaysInMonth(Y, M)))]: [
    { id: 'e-a4', title: 'McKinsey Alumni Talk', time: '6:30 PM', location: 'Rauch 201', clubId: '11', clubName: 'Consulting Club', clubColor: '262' },
  ],
  [dateKey(Y, M, Math.min(today.getDate() + 12, getDaysInMonth(Y, M)))]: [
    { id: 'e-a5', title: 'Finance Club — Social Night', time: '7:00 PM', location: 'Seasons', clubId: '1', clubName: 'Finance Club', clubColor: '215' },
  ],
  [dateKey(Y, M, Math.max(today.getDate() - 3, 1))]: [
    { id: 'e-p1', title: 'Consulting Club — Kickoff', time: '6:00 PM', location: 'Morison 110', clubId: '11', clubName: 'Consulting Club', clubColor: '262' },
  ],
  [dateKey(Y, M, Math.max(today.getDate() - 7, 1))]: [
    { id: 'e-p2', title: 'Finance Club — Intro Session', time: '5:30 PM', location: 'LaCava 220', clubId: '1', clubName: 'Finance Club', clubColor: '215' },
  ],
};

// ─── Upcoming events list (next 30 days) ─────────────────────────────────────

const UPCOMING = Object.entries(EVENTS_BY_DATE)
  .flatMap(([dateStr, evs]) => evs.map((ev) => ({ ...ev, dateStr })))
  .filter(({ dateStr }) => dateStr >= dateKey(Y, M, today.getDate()))
  .sort((a, b) => a.dateStr.localeCompare(b.dateStr))
  .slice(0, 6);

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isSignedIn, leaveClub } = useAuth();
  const navigate = useNavigate();

  // Route guard
  useEffect(() => {
    if (!isSignedIn) navigate('/login', { replace: true });
  }, [isSignedIn, navigate]);

  // Calendar state
  const [calYear, setCalYear] = useState(Y);
  const [calMonth, setCalMonth] = useState(M);
  const [selectedDate, setSelectedDate] = useState<string | null>(dateKey(Y, M, today.getDate()));

  // Leave club confirm
  const [leaveConfirm, setLeaveConfirm] = useState<string | null>(null);

  if (!user) return null;

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDow = getFirstDayOfWeek(calYear, calMonth);
  const todayKey = dateKey(Y, M, today.getDate());
  const isCurrentMonth = calYear === Y && calMonth === M;

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
    setSelectedDate(null);
  }

  const selectedEvents = selectedDate ? (EVENTS_BY_DATE[selectedDate] ?? []) : [];

  // Format a dateKey for display
  function formatDateKey(key: string) {
    const [, mo, dy] = key.split('-').map(Number);
    const d = new Date(calYear, mo - 1, dy);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }

  return (
    <>
      <Helmet>
        <title>My Dashboard — Campus Commons</title>
        <meta name="description" content="Your personal Campus Commons dashboard — calendar, clubs, and upcoming events." />
        <link rel="canonical" href="https://campuscommons.app/dashboard" />
      </Helmet>

      <main className="min-h-screen pt-20 pb-16 px-4 sm:px-6" style={{ background: 'hsl(var(--background))' }}>
        <div className="max-w-5xl mx-auto">

          {/* ── Page header ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <p className="text-[13px] font-medium mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
            <h1 className="text-[28px] font-bold" style={{ color: 'hsl(var(--foreground))' }}>
              Welcome back, {user.name.split(' ')[0]}
            </h1>
          </motion.div>

          {/* ── Main grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

            {/* ── LEFT: Calendar ── */}
            <div className="flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
              >
                {/* Calendar header */}
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={15} style={{ color: 'hsl(var(--primary))' }} />
                    <span className="text-[15px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                      {MONTH_NAMES[calMonth]} {calYear}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={prevMonth}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      aria-label="Previous month"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    {!isCurrentMonth && (
                      <button
                        onClick={() => { setCalYear(Y); setCalMonth(M); setSelectedDate(todayKey); }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors duration-150"
                        style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}
                      >
                        Today
                      </button>
                    )}
                    <button
                      onClick={nextMonth}
                      className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      aria-label="Next month"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Day-of-week labels */}
                <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                  {dashboard.DAY_LABELS.map((d) => (
                    <div key={d} className="text-center text-[11px] font-semibold pb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7 px-3 pb-4 gap-y-1">
                  {/* Empty cells before first day */}
                  {Array.from({ length: firstDow }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const key = dateKey(calYear, calMonth, day);
                    const isToday = key === todayKey;
                    const isSelected = key === selectedDate;
                    const hasEvents = !!EVENTS_BY_DATE[key]?.length;
                    const isPast = key < todayKey;

                    return (
                      <button
                        key={day}
                        onClick={() => setSelectedDate(isSelected ? null : key)}
                        className="relative flex flex-col items-center justify-center rounded-xl transition-all duration-150 py-1.5 mx-0.5"
                        style={{
                          background: isSelected
                            ? 'hsl(var(--primary))'
                            : isToday
                            ? 'hsl(var(--accent) / 0.15)'
                            : 'transparent',
                          outline: isToday && !isSelected ? '1.5px solid hsl(var(--accent))' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'hsl(var(--muted))';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = isToday
                              ? 'hsl(var(--accent) / 0.15)'
                              : 'transparent';
                          }
                        }}
                        aria-label={`${MONTH_NAMES[calMonth]} ${day}`}
                      >
                        <span
                          className="text-[13px] font-medium leading-none"
                          style={{
                            color: isSelected
                              ? 'hsl(var(--primary-foreground))'
                              : isToday
                              ? 'hsl(var(--accent))'
                              : isPast
                              ? 'hsl(var(--muted-foreground))'
                              : 'hsl(var(--foreground))',
                            fontFamily: "'DM Mono', monospace",
                          }}
                        >
                          {day}
                        </span>
                        {/* Event dot */}
                        {hasEvents && (
                          <span
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                            style={{
                              background: isSelected
                                ? 'hsl(var(--primary-foreground) / 0.7)'
                                : 'hsl(var(--primary))',
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Selected day events */}
                <AnimatePresence>
                  {selectedDate && (
                    <motion.div
                      key={selectedDate}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ borderTop: '0.5px solid hsl(var(--border))' }}
                    >
                      <div className="px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[12px] font-semibold" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            {formatDateKey(selectedDate)}
                            {selectedDate === todayKey && (
                              <span
                                className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--secondary))' }}
                              >
                                Today
                              </span>
                            )}
                          </span>
                          <button onClick={() => setSelectedDate(null)} style={{ color: 'hsl(var(--muted-foreground))' }}>
                            <X size={13} />
                          </button>
                        </div>

                        {selectedEvents.length === 0 ? (
                          <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            No events on this day.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-2">
                            {selectedEvents.map((ev) => (
                              <div
                                key={ev.id}
                                className="flex items-start gap-3 p-3 rounded-xl"
                                style={{ background: 'hsl(var(--background))', border: '0.5px solid hsl(var(--border))' }}
                              >
                                <div
                                  className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                                  style={{ background: `hsl(${ev.clubColor} 65% 45%)` }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>{ev.title}</div>
                                  <div className="flex flex-wrap gap-x-3 mt-0.5">
                                    <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                      <Clock size={9} /> {ev.time}
                                    </span>
                                    <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                      <MapPin size={9} /> {ev.location}
                                    </span>
                                  </div>
                                </div>
                                <Link
                                  to={`/bentley/clubs/${ev.clubId}`}
                                  className="shrink-0 mt-0.5"
                                  style={{ color: 'hsl(var(--muted-foreground))' }}
                                  title="View club"
                                >
                                  <ExternalLink size={12} />
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* ── Upcoming events list ── */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-2xl"
                style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
              >
                <div
                  className="flex items-center gap-2 px-5 py-4"
                  style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
                >
                  <Bell size={14} style={{ color: 'hsl(var(--primary))' }} />
                  <span className="text-[15px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Upcoming events</span>
                </div>
                <div className="flex flex-col divide-y" style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
                  {UPCOMING.length === 0 ? (
                    <p className="px-5 py-4 text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>No upcoming events.</p>
                  ) : (
                    UPCOMING.map((ev, i) => {
                      const evDate = new Date(ev.dateStr + 'T00:00:00');
                      const isEvToday = ev.dateStr === todayKey;
                      return (
                        <motion.div
                          key={ev.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.25, delay: 0.12 + i * 0.04 }}
                          className="flex items-start gap-3 px-5 py-3.5"
                          style={{ borderColor: 'hsl(var(--border))' }}
                        >
                          {/* Date badge */}
                          <div
                            className="shrink-0 w-10 flex flex-col items-center justify-center rounded-xl py-1.5"
                            style={{
                              background: isEvToday ? 'hsl(var(--accent))' : 'hsl(var(--muted))',
                              minWidth: '40px',
                            }}
                          >
                            <span
                              className="text-[10px] font-semibold leading-none"
                              style={{ color: isEvToday ? 'hsl(var(--secondary))' : 'hsl(var(--muted-foreground))' }}
                            >
                              {evDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                            </span>
                            <span
                              className="text-[16px] font-bold leading-tight"
                              style={{
                                color: isEvToday ? 'hsl(var(--secondary))' : 'hsl(var(--foreground))',
                                fontFamily: "'DM Mono', monospace",
                              }}
                            >
                              {evDate.getDate()}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <div
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: `hsl(${ev.clubColor} 65% 45%)` }}
                              />
                              <span className="text-[11px] font-medium truncate" style={{ color: `hsl(${ev.clubColor} 55% 45%)` }}>
                                {ev.clubName}
                              </span>
                              {isEvToday && (
                                <span
                                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                                  style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--secondary))' }}
                                >
                                  TODAY
                                </span>
                              )}
                            </div>
                            <div className="text-[13px] font-medium mb-0.5" style={{ color: 'hsl(var(--foreground))' }}>{ev.title}</div>
                            <div className="flex flex-wrap gap-x-3">
                              <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                <Clock size={9} /> {ev.time}
                              </span>
                              <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                <MapPin size={9} /> {ev.location}
                              </span>
                            </div>
                          </div>

                          <Link
                            to={`/bentley/clubs/${ev.clubId}`}
                            className="shrink-0 mt-1"
                            style={{ color: 'hsl(var(--muted-foreground))' }}
                            title="View club"
                          >
                            <ExternalLink size={13} />
                          </Link>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>

            {/* ── RIGHT: My Clubs ── */}
            <div className="flex flex-col gap-5">

              {/* Quick stats */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.07 }}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { label: 'Clubs joined', value: user.joinedClubs.length, icon: <Users size={13} />, color: 'var(--primary)' },
                  { label: 'Pending', value: user.pendingClubs.length, icon: <Hourglass size={13} />, color: 'var(--accent)' },
                ].map(({ label, value, icon, color }) => (
                  <div
                    key={label}
                    className="p-4 rounded-2xl flex flex-col gap-1"
                    style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
                      <span style={{ color: `hsl(${color})` }}>{icon}</span>
                    </div>
                    <span className="text-[26px] font-bold" style={{ color: 'hsl(var(--foreground))', fontFamily: "'DM Mono', monospace" }}>
                      {value}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* Clubs I'm in */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-3.5"
                  style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
                >
                  <CheckCircle2 size={14} style={{ color: 'hsl(var(--primary))' }} />
                  <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Clubs I'm in</span>
                </div>

                {user.joinedClubs.length === 0 ? (
                  <div className="px-4 py-5 text-center">
                    <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>You haven't joined any clubs yet.</p>
                    <Link
                      to="/bentley/discover"
                      className="inline-block mt-2 text-[12px] font-medium underline underline-offset-2"
                      style={{ color: 'hsl(var(--primary))' }}
                    >
                      Explore clubs
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {user.joinedClubs.map((club, i) => (
                      <motion.div
                        key={club.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.12 + i * 0.05 }}
                        className="flex items-center gap-3 px-4 py-3"
                        style={{ borderBottom: i < user.joinedClubs.length - 1 ? '0.5px solid hsl(var(--border))' : 'none' }}
                      >
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{ background: `hsl(${club.color} 65% 45%)`, color: 'hsl(var(--primary-foreground))' }}
                        >
                          {club.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>{club.name}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{club.role}</span>
                            <span className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>·</span>
                            <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{club.joinedSemester}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            to={`/bentley/clubs/${club.id}`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150"
                            style={{ color: 'hsl(var(--muted-foreground))' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            title="View club"
                          >
                            <ExternalLink size={12} />
                          </Link>
                          <button
                            onClick={() => setLeaveConfirm(club.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150"
                            style={{ color: 'hsl(var(--muted-foreground))' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'hsl(var(--destructive) / 0.1)';
                              e.currentTarget.style.color = 'hsl(var(--destructive))';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                            }}
                            title="Leave club"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Pending requests */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.14 }}
                className="rounded-2xl overflow-hidden"
                style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
              >
                <div
                  className="flex items-center gap-2 px-4 py-3.5"
                  style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
                >
                  <Hourglass size={14} style={{ color: 'hsl(var(--accent))' }} />
                  <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>Requested to join</span>
                </div>

                {user.pendingClubs.length === 0 ? (
                  <div className="px-4 py-5 text-center">
                    <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>No pending requests.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {user.pendingClubs.map((club, i) => (
                      <motion.div
                        key={club.id}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: 0.16 + i * 0.05 }}
                        className="flex items-center gap-3 px-4 py-3"
                        style={{ borderBottom: i < user.pendingClubs.length - 1 ? '0.5px solid hsl(var(--border))' : 'none' }}
                      >
                        {/* Avatar */}
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
                          style={{ background: `hsl(${club.color} 55% 88%)`, color: `hsl(${club.color} 55% 30%)` }}
                        >
                          {club.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>{club.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ background: 'hsl(var(--accent) / 0.15)', color: 'hsl(var(--accent))' }}
                            >
                              Pending
                            </span>
                            <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              Requested {club.requestedDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            to={`/bentley/clubs/${club.id}`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150"
                            style={{ color: 'hsl(var(--muted-foreground))' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                            title="View club"
                          >
                            <ExternalLink size={12} />
                          </Link>
                          <button
                            onClick={() => leaveClub(club.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150"
                            style={{ color: 'hsl(var(--muted-foreground))' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'hsl(var(--destructive) / 0.1)';
                              e.currentTarget.style.color = 'hsl(var(--destructive))';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
                            }}
                            title="Cancel request"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Discover CTA */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
              >
                <Link
                  to="/bentley/discover"
                  className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl transition-all duration-150 group"
                  style={{ background: 'hsl(var(--primary) / 0.08)', border: '0.5px solid hsl(var(--primary) / 0.2)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--primary) / 0.14)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'hsl(var(--primary) / 0.08)')}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp size={15} style={{ color: 'hsl(var(--primary))' }} />
                    <span className="text-[13px] font-medium" style={{ color: 'hsl(var(--primary))' }}>Discover more clubs</span>
                  </div>
                  <ChevronRight size={14} style={{ color: 'hsl(var(--primary))' }} />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Leave club confirm dialog ── */}
      <AnimatePresence>
        {leaveConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
              style={{ background: 'hsl(var(--foreground) / 0.4)' }}
              onClick={() => setLeaveConfirm(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.18 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[320px] p-6 rounded-2xl"
              style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
            >
              <h3 className="text-[16px] font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>Leave this club?</h3>
              <p className="text-[13px] mb-5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                You'll lose access to club events and announcements. You can request to rejoin later.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLeaveConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
                  style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => { leaveClub(leaveConfirm); setLeaveConfirm(null); }}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150"
                  style={{ background: 'hsl(var(--destructive))', color: 'hsl(var(--destructive-foreground))' }}
                >
                  Leave club
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
