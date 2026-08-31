import { my_club } from 'virtual:content';
import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import {
  Calendar, Clock, MapPin, Bell, BellOff, ChevronRight,
  CheckCircle2, XCircle, TrendingUp, Users, Star, Megaphone,
  ArrowLeft, Lock,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/lib/auth-context';

// ─── Mock data ────────────────────────────────────────────────────────────────

const MEMBER = {
  name: 'Jordan Rivera',
  club: 'Finance Club',
  role: 'Member',
  joinedSemester: 'Fall 2025',
  attendanceRate: 78,
  eventsAttended: 7,
  eventsTotal: 9,
  streak: 3,
};

const UPCOMING_EVENTS = [
  {
    id: 'e1',
    title: 'Stock Pitch Competition',
    date: 'Fri, Sep 5',
    time: '6:00 PM',
    location: 'LaCava 220',
    duration: '2 hrs',
    description: 'Teams of 2–3 students pitch a long or short equity position to a panel of alumni judges. Each team gets 10 minutes to present and 5 minutes of Q&A. This is one of the most competitive events of the semester — great for your resume.',
    agenda: [
      'Team check-in & networking (5:50 PM)',
      'Opening remarks from President (6:00 PM)',
      'Pitch presentations — 6 teams (6:10 PM)',
      'Judge deliberation (7:30 PM)',
      'Awards & closing (7:45 PM)',
    ],
    capacity: 60,
    spotsLeft: 14,
    rsvpd: false,
  },
  {
    id: 'e2',
    title: 'Bloomberg Terminal Workshop',
    date: 'Fri, Sep 12',
    time: '5:30 PM',
    location: 'Adamian 127',
    duration: '1.5 hrs',
    description: "Hands-on session covering Bloomberg's equity and fixed income functions. Ideal for students preparing for finance internship interviews. Laptops not required — terminals are provided.",
    agenda: [
      'Intro to Bloomberg interface (5:30 PM)',
      'Equity screening & analysis (5:50 PM)',
      'Fixed income deep-dive (6:15 PM)',
      'Open practice + Q&A (6:40 PM)',
    ],
    capacity: 24,
    spotsLeft: 6,
    rsvpd: true,
  },
  {
    id: 'e3',
    title: 'Alumni Networking Night',
    date: 'Thu, Sep 18',
    time: '7:00 PM',
    location: 'Rauch 201',
    duration: '1.5 hrs',
    description: 'Meet Bentley alumni working in investment banking, asset management, and fintech. Bring business cards and come with questions. Dress business casual.',
    agenda: [
      'Welcome & introductions (7:00 PM)',
      'Alumni panel — 4 speakers (7:10 PM)',
      'Open networking (7:50 PM)',
    ],
    capacity: 80,
    spotsLeft: 31,
    rsvpd: false,
  },
];

// ─── Calendar helpers ─────────────────────────────────────────────────────────

type EventItem = typeof UPCOMING_EVENTS[0];

const MONTH_MAP: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

function parseEventDt(event: EventItem): { start: string; end: string } {
  const parts = event.date.replace(/^[A-Za-z]+,\s*/, '').split(' ');
  const month = MONTH_MAP[parts[0]] ?? 9;
  const day = parseInt(parts[1], 10);
  const [hourStr, minStr] = event.time.replace(/ [AP]M/, '').split(':');
  let hour = parseInt(hourStr, 10);
  if (event.time.includes('PM') && hour !== 12) hour += 12;
  const fmt = (n: number) => String(n).padStart(2, '0');
  const base = `2026${fmt(month)}${fmt(day)}T${fmt(hour)}${minStr}00`;
  const endH = `2026${fmt(month)}${fmt(day)}T${fmt(hour + 2)}${minStr}00`;
  return { start: base, end: endH };
}

function buildICS(event: EventItem): string {
  const { start, end } = parseEventDt(event);
  const stamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Campus Commons//EN',
    'BEGIN:VEVENT',
    `UID:${event.id}@campuscommons.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`, `DTEND:${end}`,
    `SUMMARY:${event.title} — Finance Club`,
    `LOCATION:${event.location}, Bentley University`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
}

function downloadICS(event: EventItem) {
  const blob = new Blob([buildICS(event)], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/\s+/g, '-').toLowerCase()}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

function googleCalendarUrl(event: EventItem): string {
  const { start, end } = parseEventDt(event);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${event.title} — Finance Club`,
    dates: `${start}/${end}`,
    details: event.description,
    location: `${event.location}, Bentley University`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon }: {
  label: string; value: string | number; sub?: string; icon: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col gap-1 p-4 rounded-2xl"
      style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>{label}</span>
        <span style={{ color: 'hsl(var(--primary))' }}>{icon}</span>
      </div>
      <span className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))', fontFamily: "'DM Mono', monospace" }}>
        {value}
      </span>
      {sub && <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{sub}</span>}
    </div>
  );
}

function EventCard({ event, onClick }: { event: EventItem; onClick: () => void }) {
  const spotsPercent = Math.round(((event.capacity - event.spotsLeft) / event.capacity) * 100);
  const almostFull = event.spotsLeft <= 8;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      className="w-full text-left p-4 rounded-2xl transition-all duration-150"
      style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {event.rsvpd && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}
              >
                RSVP'd
              </span>
            )}
            {almostFull && (
              <span
                className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: 'hsl(var(--accent) / 0.15)', color: 'hsl(var(--accent))' }}
              >
                Almost full
              </span>
            )}
          </div>
          <div className="text-[14px] font-semibold leading-snug mb-2" style={{ color: 'hsl(var(--foreground))' }}>
            {event.title}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1 text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <Clock size={11} />{event.date} · {event.time}
            </span>
            <span className="flex items-center gap-1 text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <MapPin size={11} />{event.location}
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{event.spotsLeft} spots left</span>
              <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{event.capacity} capacity</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${spotsPercent}%`,
                  background: almostFull ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
                }}
              />
            </div>
          </div>
        </div>
        <ChevronRight size={15} className="shrink-0 mt-1" style={{ color: 'hsl(var(--muted-foreground))' }} />
      </div>
    </motion.button>
  );
}

function EventDetail({ event, onBack }: { event: EventItem; onBack: () => void }) {
  const [rsvpd, setRsvpd] = useState(event.rsvpd);
  const [calOpen, setCalOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  function requireAuth(action: () => void) {
    if (!isSignedIn) { navigate('/login'); } else { action(); }
  }

  return (
    <motion.div
      key="detail"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[13px] font-medium transition-opacity hover:opacity-70"
        style={{ color: 'hsl(var(--primary))' }}
      >
        <ArrowLeft size={14} /> Back to events
      </button>

      {/* Header */}
      <div className="p-5 rounded-2xl" style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}>
        <h2 className="text-[18px] font-bold leading-snug mb-3" style={{ color: 'hsl(var(--foreground))' }}>
          {event.title}
        </h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {[
            { icon: <Calendar size={13} />, text: event.date },
            { icon: <Clock size={13} />, text: `${event.time} · ${event.duration}` },
            { icon: <MapPin size={13} />, text: event.location },
            { icon: <Users size={13} />, text: `${event.spotsLeft} of ${event.capacity} spots left` },
          ].map(({ icon, text }, i) => (
            <span key={i} className="flex items-center gap-1.5 text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <span style={{ color: 'hsl(var(--primary))' }}>{icon}</span>
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="p-5 rounded-2xl" style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}>
        <h3 className="text-[12px] font-semibold mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>About this event</h3>
        <p className="text-[14px] leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>{event.description}</p>
      </div>

      {/* Agenda */}
      <div className="p-5 rounded-2xl" style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}>
        <h3 className="text-[12px] font-semibold mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>Agenda</h3>
        <div className="flex flex-col gap-2.5">
          {event.agenda.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
                style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}
              >
                {i + 1}
              </div>
              <span className="text-[13px] leading-snug" style={{ color: 'hsl(var(--foreground))' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RSVP */}
      <button
        onClick={() => requireAuth(() => setRsvpd((v) => !v))}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-150 active:scale-[0.98]"
        style={{
          background: rsvpd ? 'hsl(var(--muted))' : 'hsl(var(--primary))',
          color: rsvpd ? 'hsl(var(--foreground))' : 'hsl(var(--primary-foreground))',
          border: rsvpd ? '0.5px solid hsl(var(--border))' : 'none',
        }}
      >
        {!isSignedIn ? <><Lock size={15} /> Sign in to RSVP</> : rsvpd ? <><BellOff size={15} /> Cancel RSVP</> : <><Bell size={15} /> RSVP for this event</>}
      </button>

      {/* Add to calendar */}
      <div className="relative">
        <button
          onClick={() => requireAuth(() => setCalOpen((v) => !v))}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-150"
          style={{
            background: 'hsl(var(--card))',
            border: '0.5px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          }}
        >
          {isSignedIn ? <Calendar size={15} /> : <Lock size={15} />}
          Add to calendar
          {isSignedIn && (
            <ChevronRight
              size={13}
              style={{ transform: calOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            />
          )}
        </button>
        {calOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 mt-1.5 rounded-2xl overflow-hidden z-10"
            style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
          >
            <a
              href={googleCalendarUrl(event)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-colors duration-100"
              style={{ color: 'hsl(var(--foreground))' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="text-base">📅</span> Google Calendar
            </a>
            <div style={{ height: '0.5px', background: 'hsl(var(--border))' }} />
            <button
              onClick={() => { downloadICS(event); setCalOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-colors duration-100"
              style={{ color: 'hsl(var(--foreground))' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span className="text-base">📥</span> Download .ics (Apple / Outlook)
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = 'events' | 'announcements' | 'attendance';

export default function MyClubPage() {
  const [activeTab, setActiveTab] = useState<Tab>('events');
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Route guard — redirect to login if not signed in
  useEffect(() => {
    if (!isSignedIn) {
      navigate('/login', { replace: true });
    }
  }, [isSignedIn, navigate]);

  return (
    <>
      <Helmet>
        <title>My Club · Finance Club — Campus Commons</title>
        <meta name="description" content="Your club dashboard — upcoming events, announcements, and attendance history." />
        <link rel="canonical" href="https://campuscommons.app/my-club" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen py-8 px-4 sm:px-6" style={{ background: 'hsl(var(--background))' }}>
        <div className="max-w-2xl mx-auto">

          {/* Back */}
          <Link
            to="/bentley/discover"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-6 transition-opacity hover:opacity-70"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <ArrowLeft size={13} /> Discover clubs
          </Link>

          {/* Club header */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
              >
                FC
              </div>
              <div>
                <h1 className="text-[22px] font-bold leading-tight" style={{ color: 'hsl(var(--foreground))' }}>
                  {MEMBER.club}
                </h1>
                <span className="text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {MEMBER.role} · Joined {MEMBER.joinedSemester}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="grid grid-cols-3 gap-3 mb-6"
          >
            <StatCard label="Attendance rate" value={`${MEMBER.attendanceRate}%`} sub="this semester" icon={<TrendingUp size={14} />} />
            <StatCard label="Events attended" value={`${MEMBER.eventsAttended}/${MEMBER.eventsTotal}`} sub="Fall 2026" icon={<CheckCircle2 size={14} />} />
            <StatCard label="Current streak" value={MEMBER.streak} sub="events in a row" icon={<Star size={14} />} />
          </motion.div>

          {/* Tabs + content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div
              className="flex gap-1 p-1 rounded-xl mb-5"
              style={{ background: 'hsl(var(--muted))' }}
              role="group"
              aria-label="Club sections"
            >
              {([
                { id: 'events' as Tab, label: 'Upcoming events' },
                { id: 'announcements' as Tab, label: 'Announcements' },
                { id: 'attendance' as Tab, label: 'My attendance' },
              ]).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as Tab); setSelectedEvent(null); }}
                  className="flex-1 py-2 px-3 rounded-lg text-[12px] font-semibold transition-all duration-150"
                  style={{
                    background: activeTab === tab.id ? 'hsl(var(--background))' : 'transparent',
                    color: activeTab === tab.id ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
                    boxShadow: activeTab === tab.id ? '0 1px 3px hsl(var(--foreground) / 0.08)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Events */}
            {activeTab === 'events' && (
              selectedEvent ? (
                <EventDetail event={selectedEvent} onBack={() => setSelectedEvent(null)} />
              ) : (
                <motion.div
                  key="events-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-3"
                >
                  {UPCOMING_EVENTS.map((ev) => (
                    <EventCard key={ev.id} event={ev} onClick={() => setSelectedEvent(ev)} />
                  ))}
                </motion.div>
              )
            )}

            {/* Announcements */}
            {activeTab === 'announcements' && (
              <motion.div
                key="announcements"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {my_club.ANNOUNCEMENTS.map((a) => (
                  <div
                    key={a.id}
                    className="p-4 rounded-2xl"
                    style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: 'hsl(var(--primary) / 0.1)' }}
                      >
                        <Megaphone size={13} style={{ color: 'hsl(var(--primary))' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                            {a.title}
                          </span>
                          {a.pinned && (
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                              style={{ background: 'hsl(var(--accent) / 0.15)', color: 'hsl(var(--accent))' }}
                            >
                              Pinned
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] leading-relaxed mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {a.body}
                        </p>
                        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          <span>{a.author}</span>
                          <span>·</span>
                          <span>{a.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Attendance */}
            {activeTab === 'attendance' && (
              <motion.div
                key="attendance"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  className="p-4 rounded-2xl mb-4"
                  style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[13px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                      Fall 2026 attendance
                    </span>
                    <span className="text-[13px] font-bold" style={{ color: 'hsl(var(--primary))', fontFamily: "'DM Mono', monospace" }}>
                      {MEMBER.attendanceRate}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'hsl(var(--primary))' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${MEMBER.attendanceRate}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {MEMBER.eventsAttended} of {MEMBER.eventsTotal} events attended this semester
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  {my_club.ATTENDANCE_HISTORY.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
                    >
                      <div className="flex items-center gap-3">
                        {h.attended
                          ? <CheckCircle2 size={15} style={{ color: 'hsl(var(--primary))' }} />
                          : <XCircle size={15} style={{ color: 'hsl(var(--muted-foreground))' }} />
                        }
                        <div>
                          <div className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>{h.title}</div>
                          <div className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{h.date}</div>
                        </div>
                      </div>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: h.attended ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted))',
                          color: h.attended ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                        }}
                      >
                        {h.attended ? 'Attended' : 'Missed'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>
    </>
  );
}
