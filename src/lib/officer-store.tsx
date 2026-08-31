/**
 * Officer club store — all mutable state for the officer's club.
 * Lives outside auth-context so it stays focused and tree-shakeable.
 * Replace with Supabase calls when real DB is wired.
 */
import { createContext, useContext, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClubEvent {
  id: string;
  title: string;
  date: string;       // "YYYY-MM-DD"
  time: string;       // "6:00 PM"
  location: string;
  description: string;
  capacity: number;
  rsvpCount: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  postedAt: string;   // ISO string
  pinned: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;       // "Member" | "VP Events" | etc.
  joinedSemester: string;
  eventsAttended: number;
  eventsTotal: number;
  status: 'active' | 'pending';
}

export interface HealthInputs {
  meetingsHeld: number;         // this semester
  meetingsPlanned: number;
  avgAttendance: number;        // percent 0–100
  memberCount: number;
  newMembersThisSemester: number;
  eventsHosted: number;
  budgetUsedPct: number;        // 0–100
  officerVacancies: number;     // 0 = fully staffed
}

export interface OfficerClub {
  id: string;
  name: string;
  category: string;
  color: string;      // hsl hue
  founded: string;
  description: string;
  meetingSchedule: string;
  location: string;
  events: ClubEvent[];
  announcements: Announcement[];
  members: Member[];
  healthInputs: HealthInputs;
}

// ─── Health score formula (client-safe summary only; real formula server-side) ─

export function computeHealthScore(h: HealthInputs): { score: number; tier: string; color: string } {
  const meetingRate   = h.meetingsPlanned > 0 ? (h.meetingsHeld / h.meetingsPlanned) * 100 : 0;
  const attendancePct = Math.min(h.avgAttendance, 100);
  const growthBonus   = Math.min(h.newMembersThisSemester * 2, 20);
  const eventBonus    = Math.min(h.eventsHosted * 3, 15);
  const budgetPenalty = h.budgetUsedPct > 95 ? -10 : 0;
  const vacancyPenalty = h.officerVacancies * -5;

  const raw = (meetingRate * 0.35) + (attendancePct * 0.35) + growthBonus + eventBonus + budgetPenalty + vacancyPenalty;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  let tier = 'At-Risk';
  let color = '#EF4444';
  if (score >= 80) { tier = 'Thriving'; color = '#22C55E'; }
  else if (score >= 60) { tier = 'Healthy'; color = '#3B82F6'; }
  else if (score >= 40) { tier = 'Declining'; color = '#F59E0B'; }

  return { score, tier, color };
}

// ─── Mock seed data ───────────────────────────────────────────────────────────

const today = new Date();
const Y = today.getFullYear();
const M = today.getMonth();
function dKey(d: number) {
  return `${Y}-${String(M + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
const d = today.getDate();

const SEED_CLUB: OfficerClub = {
  id: '1',
  name: 'Finance Club',
  category: 'Business',
  color: '215',
  founded: 'Fall 2018',
  description: 'Exploring markets, investments, and careers in finance through speaker events and case competitions.',
  meetingSchedule: 'Fridays at 6 PM',
  location: 'LaCava 220',

  events: [
    { id: 'ev1', title: 'Stock Pitch Competition',    date: dKey(Math.min(d + 2, 28)), time: '6:00 PM', location: 'LaCava 220',    description: 'Teams pitch a long or short equity position to alumni judges.',          capacity: 60, rsvpCount: 46 },
    { id: 'ev2', title: 'Bloomberg Terminal Workshop', date: dKey(Math.min(d + 5, 28)), time: '5:30 PM', location: 'Adamian 127',   description: 'Hands-on Bloomberg session covering equity and fixed income functions.', capacity: 24, rsvpCount: 18 },
    { id: 'ev3', title: 'Alumni Networking Night',     date: dKey(Math.min(d + 9, 28)), time: '7:00 PM', location: 'Rauch 201',     description: 'Connect with Bentley alumni working in finance and investment banking.', capacity: 80, rsvpCount: 55 },
    { id: 'ev4', title: 'Weekly Meeting',              date: dKey(Math.min(d + 12, 28)), time: '6:00 PM', location: 'LaCava 220',   description: 'Regular weekly meeting — agenda TBD.',                                  capacity: 50, rsvpCount: 31 },
  ],

  announcements: [
    { id: 'an1', title: 'Welcome to Fall 2026!',           body: "We're kicking off the semester strong. Check the events tab for our full lineup — Stock Pitch Competition is back and bigger than ever. Make sure to RSVP early, spots fill fast.", author: 'Alex Chen', postedAt: new Date(Y, M, Math.max(d - 1, 1)).toISOString(), pinned: true },
    { id: 'an2', title: 'Bloomberg Terminal access update', body: 'We now have access to 8 terminals in Adamian 127 for workshop sessions. Members who want individual practice time outside of events should email the VP of Education.', author: 'Maya Patel', postedAt: new Date(Y, M, Math.max(d - 3, 1)).toISOString(), pinned: false },
    { id: 'an3', title: 'Officer applications open',        body: 'We are looking for a VP of Marketing and a VP of Education for Spring 2027. Applications close Oct 15. See the linked form for details.', author: 'Alex Chen', postedAt: new Date(Y, M, Math.max(d - 5, 1)).toISOString(), pinned: false },
  ],

  members: [
    { id: 'm1',  name: 'Alex Chen',      email: 'achen@bentley.edu',    role: 'President',    joinedSemester: 'Fall 2023',   eventsAttended: 12, eventsTotal: 12, status: 'active' },
    { id: 'm2',  name: 'Maya Patel',     email: 'mpatel@bentley.edu',   role: 'VP Events',    joinedSemester: 'Spring 2024', eventsAttended: 11, eventsTotal: 12, status: 'active' },
    { id: 'm3',  name: 'Jordan Kim',     email: 'jkim@bentley.edu',     role: 'Treasurer',    joinedSemester: 'Fall 2024',   eventsAttended: 10, eventsTotal: 12, status: 'active' },
    { id: 'm4',  name: 'Riley Johnson',  email: 'rjohnson@bentley.edu', role: 'Member',       joinedSemester: 'Fall 2025',   eventsAttended: 7,  eventsTotal: 9,  status: 'active' },
    { id: 'm5',  name: 'Casey Nguyen',   email: 'cnguyen@bentley.edu',  role: 'Member',       joinedSemester: 'Fall 2025',   eventsAttended: 6,  eventsTotal: 9,  status: 'active' },
    { id: 'm6',  name: 'Dana Scott',     email: 'dscott@bentley.edu',   role: 'Member',       joinedSemester: 'Spring 2026', eventsAttended: 4,  eventsTotal: 6,  status: 'active' },
    { id: 'm7',  name: 'Morgan Lee',     email: 'mlee@bentley.edu',     role: 'Member',       joinedSemester: 'Spring 2026', eventsAttended: 5,  eventsTotal: 6,  status: 'active' },
    { id: 'm8',  name: 'Sam Rivera',     email: 'srivera@bentley.edu',  role: 'Member',       joinedSemester: 'Spring 2026', eventsAttended: 3,  eventsTotal: 6,  status: 'active' },
    // Pending
    { id: 'm9',  name: 'Taylor Brooks',  email: 'tbrooks@bentley.edu',  role: 'Member',       joinedSemester: '—',           eventsAttended: 0,  eventsTotal: 0,  status: 'pending' },
    { id: 'm10', name: 'Avery Stone',    email: 'astone@bentley.edu',   role: 'Member',       joinedSemester: '—',           eventsAttended: 0,  eventsTotal: 0,  status: 'pending' },
    { id: 'm11', name: 'Quinn Adams',    email: 'qadams@bentley.edu',   role: 'Member',       joinedSemester: '—',           eventsAttended: 0,  eventsTotal: 0,  status: 'pending' },
  ],

  healthInputs: {
    meetingsHeld: 3,
    meetingsPlanned: 14,
    avgAttendance: 72,
    memberCount: 142,
    newMembersThisSemester: 18,
    eventsHosted: 4,
    budgetUsedPct: 38,
    officerVacancies: 2,
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

interface OfficerStoreCtx {
  club: OfficerClub;
  addEvent: (ev: Omit<ClubEvent, 'id' | 'rsvpCount'>) => void;
  updateEvent: (id: string, patch: Partial<ClubEvent>) => void;
  deleteEvent: (id: string) => void;
  addAnnouncement: (a: Omit<Announcement, 'id' | 'postedAt'>) => void;
  deleteAnnouncement: (id: string) => void;
  togglePin: (id: string) => void;
  approveMember: (id: string) => void;
  denyMember: (id: string) => void;
  removeMember: (id: string) => void;
  updateHealthInputs: (patch: Partial<HealthInputs>) => void;
}

const OfficerStoreContext = createContext<OfficerStoreCtx | null>(null);

export function OfficerStoreProvider({ children }: { children: React.ReactNode }) {
  const [club, setClub] = useState<OfficerClub>(SEED_CLUB);

  const addEvent = useCallback((ev: Omit<ClubEvent, 'id' | 'rsvpCount'>) => {
    setClub((c) => ({ ...c, events: [...c.events, { ...ev, id: `ev-${Date.now()}`, rsvpCount: 0 }] }));
  }, []);

  const updateEvent = useCallback((id: string, patch: Partial<ClubEvent>) => {
    setClub((c) => ({ ...c, events: c.events.map((e) => e.id === id ? { ...e, ...patch } : e) }));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setClub((c) => ({ ...c, events: c.events.filter((e) => e.id !== id) }));
  }, []);

  const addAnnouncement = useCallback((a: Omit<Announcement, 'id' | 'postedAt'>) => {
    setClub((c) => ({
      ...c,
      announcements: [{ ...a, id: `an-${Date.now()}`, postedAt: new Date().toISOString() }, ...c.announcements],
    }));
  }, []);

  const deleteAnnouncement = useCallback((id: string) => {
    setClub((c) => ({ ...c, announcements: c.announcements.filter((a) => a.id !== id) }));
  }, []);

  const togglePin = useCallback((id: string) => {
    setClub((c) => ({ ...c, announcements: c.announcements.map((a) => a.id === id ? { ...a, pinned: !a.pinned } : a) }));
  }, []);

  const approveMember = useCallback((id: string) => {
    setClub((c) => ({
      ...c,
      members: c.members.map((m) => m.id === id ? { ...m, status: 'active', joinedSemester: 'Fall 2026' } : m),
    }));
  }, []);

  const denyMember = useCallback((id: string) => {
    setClub((c) => ({ ...c, members: c.members.filter((m) => m.id !== id) }));
  }, []);

  const removeMember = useCallback((id: string) => {
    setClub((c) => ({ ...c, members: c.members.filter((m) => m.id !== id) }));
  }, []);

  const updateHealthInputs = useCallback((patch: Partial<HealthInputs>) => {
    setClub((c) => ({ ...c, healthInputs: { ...c.healthInputs, ...patch } }));
  }, []);

  return (
    <OfficerStoreContext.Provider value={{
      club, addEvent, updateEvent, deleteEvent,
      addAnnouncement, deleteAnnouncement, togglePin,
      approveMember, denyMember, removeMember, updateHealthInputs,
    }}>
      {children}
    </OfficerStoreContext.Provider>
  );
}

export function useOfficerStore() {
  const ctx = useContext(OfficerStoreContext);
  if (!ctx) throw new Error('useOfficerStore must be used inside OfficerStoreProvider');
  return ctx;
}
