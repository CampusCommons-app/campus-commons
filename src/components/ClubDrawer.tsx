import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  X, Users, Calendar, MapPin, Bell, ExternalLink,
  ChevronRight, Clock, CheckCircle2, Lock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export interface Club {
  id: string;
  name: string;
  category: string;
  members: number;
  events: number;
  description: string;
}

interface ClubDrawerProps {
  club: Club | null;
  onClose: () => void;
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

function clubHue(name: string): number {
  const hues = [15, 215, 262, 142, 32, 340];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return hues[Math.abs(hash) % hues.length];
}

// Mock upcoming events per club
const MOCK_EVENTS: Record<string, { title: string; date: string; time: string; location: string }[]> = {
  '1':  [{ title: 'Stock Pitch Competition', date: 'Sep 5', time: '6:00 PM', location: 'LaCava 220' }, { title: 'Bloomberg Terminal Workshop', date: 'Sep 12', time: '5:30 PM', location: 'Adamian 127' }],
  '2':  [{ title: 'Founder Fireside Chat', date: 'Sep 8', time: '7:00 PM', location: 'Rauch 201' }, { title: 'Pitch Night', date: 'Sep 22', time: '6:30 PM', location: 'Rauch 201' }],
  '3':  [{ title: 'Python for Finance', date: 'Sep 6', time: '5:00 PM', location: 'Morison 110' }, { title: 'Tableau Workshop', date: 'Sep 20', time: '5:00 PM', location: 'Morison 110' }],
  '4':  [{ title: 'Brand Strategy Case', date: 'Sep 9', time: '6:00 PM', location: 'Adamian 127' }],
  '5':  [{ title: 'Big 4 Networking Night', date: 'Sep 11', time: '6:30 PM', location: 'LaCava 220' }],
  '6':  [{ title: 'Intro to ROS Workshop', date: 'Sep 7', time: '4:00 PM', location: 'Smith 105' }],
  '7':  [{ title: 'IB Technical Prep', date: 'Sep 10', time: '6:00 PM', location: 'Rauch 201' }, { title: 'Deal Analysis Session', date: 'Sep 24', time: '6:00 PM', location: 'Rauch 201' }],
  '8':  [{ title: 'Campus Cleanup Drive', date: 'Sep 13', time: '10:00 AM', location: 'Dana Center' }],
  '9':  [{ title: 'LSAT Study Group', date: 'Sep 6', time: '3:00 PM', location: 'Adamian 127' }],
  '10': [{ title: 'International Food Festival', date: 'Sep 14', time: '12:00 PM', location: 'Seasons' }, { title: 'Cultural Night', date: 'Oct 3', time: '7:00 PM', location: 'Multipurpose Room' }],
  '11': [{ title: 'Case Cracking Session', date: 'Sep 8', time: '6:00 PM', location: 'Morison 110' }, { title: 'McKinsey Alumni Talk', date: 'Sep 19', time: '6:30 PM', location: 'Rauch 201' }],
  '12': [{ title: 'Campus Photo Walk', date: 'Sep 7', time: '2:00 PM', location: 'Meet at Founders' }],
};

// Mock officer info
const MOCK_OFFICERS: Record<string, { role: string; name: string }[]> = {
  '1':  [{ role: 'President', name: 'Alex Chen' }, { role: 'VP Events', name: 'Maya Patel' }],
  '2':  [{ role: 'President', name: 'Jordan Lee' }, { role: 'Director', name: 'Sam Rivera' }],
  '3':  [{ role: 'President', name: 'Priya Nair' }, { role: 'VP Tech', name: 'Chris Wu' }],
  '4':  [{ role: 'President', name: 'Taylor Brooks' }],
  '5':  [{ role: 'President', name: 'Morgan Kim' }, { role: 'Treasurer', name: 'Dana Scott' }],
  '6':  [{ role: 'President', name: 'Ethan Park' }],
  '7':  [{ role: 'President', name: 'Riley Johnson' }, { role: 'VP', name: 'Casey Nguyen' }],
  '8':  [{ role: 'President', name: 'Avery Martinez' }],
  '9':  [{ role: 'President', name: 'Quinn Adams' }],
  '10': [{ role: 'President', name: 'Zoe Williams' }, { role: 'Events Lead', name: 'Leo Tanaka' }],
  '11': [{ role: 'President', name: 'Blake Turner' }, { role: 'VP', name: 'Nadia Hassan' }],
  '12': [{ role: 'President', name: 'Sage Cooper' }],
};

export default function ClubDrawer({ club, onClose }: ClubDrawerProps) {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  function requireAuth(action: () => void) {
    if (!isSignedIn) {
      onClose();
      navigate('/login');
    } else {
      action();
    }
  }
  // Close on Escape
  useEffect(() => {
    if (!club) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [club, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (club) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [club]);

  const events = club ? (MOCK_EVENTS[club.id] ?? []) : [];
  const officers = club ? (MOCK_OFFICERS[club.id] ?? []) : [];
  const hue = club ? clubHue(club.name) : 0;

  return (
    <AnimatePresence>
      {club && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: 'hsl(var(--foreground) / 0.45)' }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full max-w-[480px] overflow-hidden"
            style={{
              background: 'hsl(var(--background))',
              borderLeft: '0.5px solid hsl(var(--border))',
            }}
          >
            {/* ── Header strip ── */}
            <div
              className="shrink-0 flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0"
                  style={{
                    background: `hsl(${hue} 65% 45%)`,
                    color: 'hsl(var(--primary-foreground))',
                  }}
                >
                  {initials(club.name)}
                </div>
                <div>
                  <div className="text-[15px] font-semibold leading-tight" style={{ color: 'hsl(var(--foreground))' }}>
                    {club.name}
                  </div>
                  <div
                    className="text-[11px] mt-0.5 px-2 py-0.5 rounded-full inline-block"
                    style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                  >
                    {club.category}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-150"
                style={{ color: 'hsl(var(--muted-foreground))' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Scrollable body ── */}
            <div className="flex-1 overflow-y-auto">

              {/* Stats row */}
              <div
                className="flex items-center gap-6 px-5 py-4"
                style={{ borderBottom: '0.5px solid hsl(var(--border))' }}
              >
                <div className="flex items-center gap-2">
                  <Users size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                  <span className="text-[13px] font-semibold" style={{ color: 'hsl(var(--foreground))', fontFamily: "'DM Mono', monospace" }}>
                    {club.members}
                  </span>
                  <span className="text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>members</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} style={{ color: 'hsl(var(--muted-foreground))' }} />
                  <span className="text-[13px] font-semibold" style={{ color: 'hsl(var(--foreground))', fontFamily: "'DM Mono', monospace" }}>
                    {club.events}
                  </span>
                  <span className="text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>events this semester</span>
                </div>
              </div>

              {/* About */}
              <div className="px-5 py-5" style={{ borderBottom: '0.5px solid hsl(var(--border))' }}>
                <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {club.description}
                </p>
              </div>

              {/* Upcoming events */}
              <div className="px-5 py-5" style={{ borderBottom: '0.5px solid hsl(var(--border))' }}>
                <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Upcoming events
                </h2>
                {events.length === 0 ? (
                  <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>No upcoming events scheduled.</p>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {events.map((ev, i) => (
                      <div
                        key={i}
                        onClick={() => requireAuth(() => {})}
                        className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-150"
                        style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.4)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--border))')}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                          style={{ background: `hsl(${hue} 65% 45% / 0.12)` }}
                        >
                          <Calendar size={13} style={{ color: `hsl(${hue} 65% 45%)` }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium leading-snug" style={{ color: 'hsl(var(--foreground))' }}>
                            {ev.title}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              <Clock size={10} />
                              {ev.date} · {ev.time}
                            </span>
                            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              <MapPin size={10} />
                              {ev.location}
                            </span>
                          </div>
                          {!isSignedIn && (
                            <div className="mt-1.5 flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--accent))' }}>
                              <Lock size={9} />
                              Sign in to RSVP
                            </div>
                          )}
                        </div>
                        <ChevronRight size={13} style={{ color: 'hsl(var(--muted-foreground))', marginTop: 2 }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Officers */}
              {officers.length > 0 && (
                <div className="px-5 py-5" style={{ borderBottom: '0.5px solid hsl(var(--border))' }}>
                  <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Leadership
                  </h2>
                  <div className="flex flex-col gap-2">
                    {officers.map((o, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[13px]" style={{ color: 'hsl(var(--foreground))' }}>{o.name}</span>
                        <span className="text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{o.role}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What to expect */}
              <div className="px-5 py-5">
                <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  What to expect
                </h2>
                <div className="flex flex-col gap-2">
                  {[
                    'Open to all Bentley students — no application required',
                    'Weekly or bi-weekly meetings during the semester',
                    'Check in at events to build your attendance record',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0" style={{ color: `hsl(${hue} 65% 45%)` }} />
                      <span className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Footer actions ── */}
            <div
              className="shrink-0 flex items-center gap-2.5 px-5 py-4"
              style={{ borderTop: '0.5px solid hsl(var(--border))' }}
            >
              <button
                onClick={() => requireAuth(() => {})}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {isSignedIn ? <Bell size={14} /> : <Lock size={14} />}
                Follow club
              </button>
              <button
                onClick={() => requireAuth(() => navigate(`/bentley/clubs/${club.id}`))}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150"
                style={{
                  background: 'hsl(var(--card))',
                  border: '0.5px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--border))')}
              >
                {isSignedIn ? <ExternalLink size={13} /> : <Lock size={13} />}
                Full page
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
