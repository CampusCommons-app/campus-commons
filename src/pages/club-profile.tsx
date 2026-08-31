import { useParams, Link, useNavigate } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import {
  ArrowLeft, Users, Calendar, MapPin, Clock,
  Bell, Lock, TrendingUp, Award, ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

// ─── Shared mock data ─────────────────────────────────────────────────────────

const CLUBS: Record<string, {
  id: string; name: string; category: string; members: number; events: number;
  description: string; longDescription: string; founded: string;
  meetingSchedule: string; location: string;
}> = {
  '1':  { id: '1',  name: 'Finance Club',              category: 'Business',      members: 142, events: 18, description: 'Exploring markets, investments, and careers in finance through speaker events and case competitions.', longDescription: "The Finance Club connects Bentley students with real-world finance through Bloomberg Terminal workshops, stock pitch competitions, alumni networking nights, and partnerships with Big 4 firms. Whether you're eyeing investment banking, asset management, or fintech, this is your launchpad.", founded: 'Fall 2018', meetingSchedule: 'Fridays at 6 PM', location: 'LaCava 220' },
  '2':  { id: '2',  name: 'Entrepreneurship Society',  category: 'Business',      members: 98,  events: 12, description: 'Connecting student founders with mentors, resources, and pitch opportunities.', longDescription: "The Entrepreneurship Society is Bentley's hub for student founders and aspiring entrepreneurs. We host fireside chats with successful founders, run pitch nights with real investor feedback, and connect members with Bentley's startup ecosystem and alumni network.", founded: 'Spring 2019', meetingSchedule: 'Mondays at 7 PM', location: 'Rauch 201' },
  '3':  { id: '3',  name: 'Data Analytics Club',       category: 'Technology',    members: 76,  events: 9,  description: 'Hands-on workshops in Python, SQL, and data visualization for business applications.', longDescription: 'The Data Analytics Club bridges the gap between business and technology. We run hands-on workshops in Python, SQL, Tableau, and Power BI — all applied to real business problems. Great for students pursuing data science, business analytics, or consulting roles.', founded: 'Fall 2020', meetingSchedule: 'Saturdays at 5 PM', location: 'Morison 110' },
  '4':  { id: '4',  name: 'Marketing Association',     category: 'Business',      members: 115, events: 14, description: 'Brand strategy, digital marketing, and real-world campaign projects with local businesses.', longDescription: 'The Marketing Association gives students hands-on experience with brand strategy, digital campaigns, and consumer research. We partner with local businesses on live projects and host guest speakers from top agencies and brands.', founded: 'Spring 2017', meetingSchedule: 'Tuesdays at 6 PM', location: 'Adamian 127' },
  '5':  { id: '5',  name: 'Accounting Society',        category: 'Business',      members: 88,  events: 11, description: 'CPA exam prep, networking with Big 4 firms, and accounting career development.', longDescription: 'The Accounting Society prepares students for careers in public and private accounting. We offer CPA exam study groups, Big 4 networking nights, and mock interview sessions with alumni at Deloitte, PwC, EY, and KPMG.', founded: 'Fall 2016', meetingSchedule: 'Thursdays at 6:30 PM', location: 'LaCava 220' },
  '6':  { id: '6',  name: 'Robotics & AI Club',        category: 'Technology',    members: 54,  events: 7,  description: 'Building autonomous systems and exploring machine learning applications.', longDescription: 'The Robotics & AI Club is for students passionate about building intelligent systems. We work with ROS, Arduino, and Python ML libraries — and compete in regional robotics competitions. No prior experience required.', founded: 'Spring 2021', meetingSchedule: 'Sundays at 4 PM', location: 'Smith 105' },
  '7':  { id: '7',  name: 'Investment Banking Club',   category: 'Finance',       members: 63,  events: 8,  description: 'Technical interview prep, deal analysis, and connections to Wall Street professionals.', longDescription: 'The Investment Banking Club is the most rigorous pre-professional club at Bentley. We run weekly technical interview prep, live deal analysis sessions, and maintain relationships with alumni at Goldman Sachs, Morgan Stanley, and Lazard.', founded: 'Fall 2019', meetingSchedule: 'Wednesdays at 6 PM', location: 'Rauch 201' },
  '8':  { id: '8',  name: 'Sustainability Initiative', category: 'Social Impact', members: 71,  events: 10, description: 'Driving campus sustainability projects and connecting students with green careers.', longDescription: "The Sustainability Initiative leads Bentley's environmental efforts — from campus cleanup drives to green business consulting projects. We connect students with careers in ESG, sustainability consulting, and impact investing.", founded: 'Spring 2020', meetingSchedule: 'Saturdays at 10 AM', location: 'Dana Center' },
  '9':  { id: '9',  name: 'Pre-Law Society',           category: 'Academic',      members: 45,  events: 6,  description: 'LSAT prep, law school applications, and networking with legal professionals.', longDescription: 'The Pre-Law Society supports students on the path to law school. We run LSAT study groups, personal statement workshops, and host attorneys and law school admissions officers for Q&A sessions.', founded: 'Fall 2017', meetingSchedule: 'Saturdays at 3 PM', location: 'Adamian 127' },
  '10': { id: '10', name: 'Cultural Exchange Club',    category: 'Social',        members: 89,  events: 15, description: 'Celebrating diversity through cultural events, food festivals, and international speaker series.', longDescription: "The Cultural Exchange Club celebrates the diversity of Bentley's student body through food festivals, cultural showcases, and international speaker series. We partner with international student organizations and host one of the most popular events on campus each semester.", founded: 'Spring 2016', meetingSchedule: 'Fridays at 7 PM', location: 'Multipurpose Room' },
  '11': { id: '11', name: 'Consulting Club',           category: 'Business',      members: 107, events: 13, description: 'Case interview prep, strategy frameworks, and connections to top consulting firms.', longDescription: 'The Consulting Club is the premier case prep organization at Bentley. We run weekly case cracking sessions, host alumni from McKinsey, BCG, and Bain, and send more students to top consulting firms than any other club on campus.', founded: 'Fall 2015', meetingSchedule: 'Mondays at 6 PM', location: 'Morison 110' },
  '12': { id: '12', name: 'Photography Society',       category: 'Arts',          members: 38,  events: 5,  description: 'Campus photography walks, editing workshops, and an annual showcase.', longDescription: 'The Photography Society is for students who love visual storytelling. We run campus photo walks, Lightroom and Photoshop editing workshops, and host an annual showcase at the end of each semester. All skill levels welcome.', founded: 'Spring 2022', meetingSchedule: 'Sundays at 2 PM', location: 'Meet at Founders' },
};

const MOCK_EVENTS: Record<string, { title: string; date: string; time: string; location: string; spotsLeft: number; capacity: number }[]> = {
  '1':  [{ title: 'Stock Pitch Competition', date: 'Sep 5', time: '6:00 PM', location: 'LaCava 220', spotsLeft: 14, capacity: 60 }, { title: 'Bloomberg Terminal Workshop', date: 'Sep 12', time: '5:30 PM', location: 'Adamian 127', spotsLeft: 6, capacity: 24 }],
  '2':  [{ title: 'Founder Fireside Chat', date: 'Sep 8', time: '7:00 PM', location: 'Rauch 201', spotsLeft: 22, capacity: 50 }, { title: 'Pitch Night', date: 'Sep 22', time: '6:30 PM', location: 'Rauch 201', spotsLeft: 18, capacity: 40 }],
  '3':  [{ title: 'Python for Finance', date: 'Sep 6', time: '5:00 PM', location: 'Morison 110', spotsLeft: 8, capacity: 30 }, { title: 'Tableau Workshop', date: 'Sep 20', time: '5:00 PM', location: 'Morison 110', spotsLeft: 12, capacity: 30 }],
  '4':  [{ title: 'Brand Strategy Case', date: 'Sep 9', time: '6:00 PM', location: 'Adamian 127', spotsLeft: 20, capacity: 45 }],
  '5':  [{ title: 'Big 4 Networking Night', date: 'Sep 11', time: '6:30 PM', location: 'LaCava 220', spotsLeft: 30, capacity: 80 }],
  '6':  [{ title: 'Intro to ROS Workshop', date: 'Sep 7', time: '4:00 PM', location: 'Smith 105', spotsLeft: 10, capacity: 20 }],
  '7':  [{ title: 'IB Technical Prep', date: 'Sep 10', time: '6:00 PM', location: 'Rauch 201', spotsLeft: 5, capacity: 25 }, { title: 'Deal Analysis Session', date: 'Sep 24', time: '6:00 PM', location: 'Rauch 201', spotsLeft: 8, capacity: 25 }],
  '8':  [{ title: 'Campus Cleanup Drive', date: 'Sep 13', time: '10:00 AM', location: 'Dana Center', spotsLeft: 40, capacity: 60 }],
  '9':  [{ title: 'LSAT Study Group', date: 'Sep 6', time: '3:00 PM', location: 'Adamian 127', spotsLeft: 15, capacity: 20 }],
  '10': [{ title: 'International Food Festival', date: 'Sep 14', time: '12:00 PM', location: 'Seasons', spotsLeft: 80, capacity: 200 }, { title: 'Cultural Night', date: 'Oct 3', time: '7:00 PM', location: 'Multipurpose Room', spotsLeft: 50, capacity: 120 }],
  '11': [{ title: 'Case Cracking Session', date: 'Sep 8', time: '6:00 PM', location: 'Morison 110', spotsLeft: 12, capacity: 35 }, { title: 'McKinsey Alumni Talk', date: 'Sep 19', time: '6:30 PM', location: 'Rauch 201', spotsLeft: 25, capacity: 60 }],
  '12': [{ title: 'Campus Photo Walk', date: 'Sep 7', time: '2:00 PM', location: 'Meet at Founders', spotsLeft: 18, capacity: 25 }],
};

const MOCK_OFFICERS: Record<string, { role: string; name: string }[]> = {
  '1':  [{ role: 'President', name: 'Alex Chen' }, { role: 'VP Events', name: 'Maya Patel' }, { role: 'Treasurer', name: 'Jordan Kim' }],
  '2':  [{ role: 'President', name: 'Jordan Lee' }, { role: 'Director', name: 'Sam Rivera' }],
  '3':  [{ role: 'President', name: 'Priya Nair' }, { role: 'VP Tech', name: 'Chris Wu' }],
  '4':  [{ role: 'President', name: 'Taylor Brooks' }, { role: 'VP Marketing', name: 'Avery Stone' }],
  '5':  [{ role: 'President', name: 'Morgan Kim' }, { role: 'Treasurer', name: 'Dana Scott' }],
  '6':  [{ role: 'President', name: 'Ethan Park' }],
  '7':  [{ role: 'President', name: 'Riley Johnson' }, { role: 'VP', name: 'Casey Nguyen' }],
  '8':  [{ role: 'President', name: 'Avery Martinez' }],
  '9':  [{ role: 'President', name: 'Quinn Adams' }],
  '10': [{ role: 'President', name: 'Zoe Williams' }, { role: 'Events Lead', name: 'Leo Tanaka' }],
  '11': [{ role: 'President', name: 'Blake Turner' }, { role: 'VP', name: 'Nadia Hassan' }],
  '12': [{ role: 'President', name: 'Sage Cooper' }],
};

function clubHue(name: string): number {
  const hues = [15, 215, 262, 142, 32, 340];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return hues[Math.abs(hash) % hues.length];
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClubProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const club = id ? CLUBS[id] : null;

  function requireAuth() {
    if (!isSignedIn) navigate('/login');
  }

  if (!club) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ background: 'hsl(var(--background))' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>Club not found</h1>
        <Link to="/bentley/discover" className="text-sm underline" style={{ color: 'hsl(var(--primary))' }}>
          Back to discover
        </Link>
      </main>
    );
  }

  const events = MOCK_EVENTS[club.id] ?? [];
  const officers = MOCK_OFFICERS[club.id] ?? [];
  const hue = clubHue(club.name);

  return (
    <>
      <Helmet>
        <title>{club.name} — Campus Commons · Bentley University</title>
        <meta name="description" content={club.description} />
        <link rel="canonical" href={`https://campuscommons.app/bentley/clubs/${club.id}`} />
      </Helmet>

      <main className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
        {/* Hero strip */}
        <div
          className="pt-24 pb-10 px-4 sm:px-6"
          style={{ background: `hsl(${hue} 55% 18%)` }}
        >
          <div className="max-w-3xl mx-auto">
            <Link
              to="/bentley/discover"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium mb-6 transition-opacity hover:opacity-70"
              style={{ color: `hsl(${hue} 55% 80%)` }}
            >
              <ArrowLeft size={13} /> All clubs
            </Link>

            <div className="flex items-start gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-[18px] font-bold shrink-0"
                style={{ background: `hsl(${hue} 65% 45%)`, color: 'hsl(var(--primary-foreground))' }}
              >
                {initials(club.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-block mb-2"
                  style={{ background: `hsl(${hue} 65% 45% / 0.3)`, color: `hsl(${hue} 55% 80%)` }}
                >
                  {club.category}
                </div>
                <h1 className="text-[28px] font-bold leading-tight mb-1" style={{ color: 'hsl(var(--primary-foreground))' }}>
                  {club.name}
                </h1>
                <p className="text-[14px]" style={{ color: `hsl(${hue} 20% 75%)` }}>{club.description}</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { icon: <Users size={13} />, label: `${club.members} members` },
                { icon: <Calendar size={13} />, label: `${club.events} events this semester` },
                { icon: <Clock size={13} />, label: club.meetingSchedule },
                { icon: <MapPin size={13} />, label: club.location },
              ].map(({ icon, label }, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[13px]" style={{ color: `hsl(${hue} 20% 75%)` }}>
                  {icon} {label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex gap-3"
          >
            <button
              onClick={requireAuth}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-150 active:scale-[0.98]"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
            >
              {isSignedIn ? <Bell size={15} /> : <Lock size={15} />}
              {isSignedIn ? 'Follow this club' : 'Sign in to follow'}
            </button>
            <Link
              to="/bentley/discover"
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-[14px] font-medium transition-all duration-150"
              style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            >
              <ArrowLeft size={14} /> Back
            </Link>
          </motion.div>

          {/* About */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            className="p-5 rounded-2xl"
            style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
          >
            <h2 className="text-[13px] font-semibold mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>About</h2>
            <p className="text-[14px] leading-relaxed" style={{ color: 'hsl(var(--foreground))' }}>{club.longDescription}</p>
            <div className="flex items-center gap-1.5 mt-4 text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <Award size={12} /> Founded {club.founded}
            </div>
          </motion.div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.08 }}
            className="grid grid-cols-3 gap-3"
          >
            {[
              { label: 'Members', value: club.members, icon: <Users size={14} /> },
              { label: 'Events / semester', value: club.events, icon: <Calendar size={14} /> },
              { label: 'Health score', value: '87', icon: <TrendingUp size={14} /> },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
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
              </div>
            ))}
          </motion.div>

          {/* Upcoming events */}
          {events.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.11 }}
              className="p-5 rounded-2xl"
              style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
            >
              <h2 className="text-[13px] font-semibold mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>Upcoming events</h2>
              <div className="flex flex-col gap-2.5">
                {events.map((ev, i) => {
                  const pct = Math.round(((ev.capacity - ev.spotsLeft) / ev.capacity) * 100);
                  const almostFull = ev.spotsLeft <= 8;
                  return (
                    <button
                      key={i}
                      onClick={requireAuth}
                      className="w-full text-left p-3.5 rounded-xl transition-all duration-150"
                      style={{ background: 'hsl(var(--background))', border: '0.5px solid hsl(var(--border))' }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.4)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--border))')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>{ev.title}</span>
                            {almostFull && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'hsl(var(--accent) / 0.15)', color: 'hsl(var(--accent))' }}>
                                Almost full
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1">
                            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              <Clock size={10} />{ev.date} · {ev.time}
                            </span>
                            <span className="flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                              <MapPin size={10} />{ev.location}
                            </span>
                          </div>
                          <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: almostFull ? 'hsl(var(--accent))' : 'hsl(var(--primary))' }}
                            />
                          </div>
                          {!isSignedIn && (
                            <div className="mt-1.5 flex items-center gap-1 text-[11px]" style={{ color: 'hsl(var(--accent))' }}>
                              <Lock size={9} /> Sign in to RSVP
                            </div>
                          )}
                        </div>
                        <ChevronRight size={14} className="shrink-0 mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Leadership */}
          {officers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.14 }}
              className="p-5 rounded-2xl"
              style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
            >
              <h2 className="text-[13px] font-semibold mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>Leadership</h2>
              <div className="flex flex-col gap-2.5">
                {officers.map((o, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                      style={{ background: `hsl(${hue} 55% 88%)`, color: `hsl(${hue} 55% 30%)` }}
                    >
                      {initials(o.name)}
                    </div>
                    <div>
                      <div className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>{o.name}</div>
                      <div className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{o.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </>
  );
}
