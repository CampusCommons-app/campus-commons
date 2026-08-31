import { discover_events } from 'virtual:content';
import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Search, Calendar, MapPin, Clock, Users, ChevronRight, Download } from 'lucide-react';
import { motion } from 'motion/react';

// ─── Mock events ──────────────────────────────────────────────────────────────
const EVENTS = [
  { id: 'e1', title: 'Finance Club — Weekly Meeting', club: 'Finance Club', clubId: '1', date: '2026-08-22', time: '6:00 PM', duration: '90 min', location: 'LaCava 220', capacity: 60, registered: 38, category: 'Meeting' },
  { id: 'e2', title: 'Startup Pitch Night', club: 'Entrepreneurship Society', clubId: '2', date: '2026-08-24', time: '7:00 PM', duration: '2 hr', location: 'Adamian 127', capacity: 80, registered: 71, category: 'Competition' },
  { id: 'e3', title: 'Python for Data Analysis Workshop', club: 'Data Analytics Club', clubId: '3', date: '2026-08-25', time: '5:30 PM', duration: '2 hr', location: 'Smith 301', capacity: 30, registered: 28, category: 'Workshop' },
  { id: 'e4', title: 'Big 4 Networking Night', club: 'Accounting Society', clubId: '5', date: '2026-08-26', time: '6:30 PM', duration: '2 hr', location: 'Rauch 201', capacity: 100, registered: 54, category: 'Networking' },
  { id: 'e5', title: 'Investment Banking Case Study', club: 'Investment Banking Club', clubId: '7', date: '2026-08-27', time: '7:00 PM', duration: '90 min', location: 'LaCava 310', capacity: 40, registered: 40, category: 'Workshop' },
  { id: 'e6', title: 'Campus Sustainability Fair', club: 'Sustainability Initiative', clubId: '8', date: '2026-08-28', time: '11:00 AM', duration: '3 hr', location: 'Bentley Green', capacity: 200, registered: 87, category: 'Fair' },
  { id: 'e7', title: 'Marketing Strategy Bootcamp', club: 'Marketing Association', clubId: '4', date: '2026-08-29', time: '10:00 AM', duration: '4 hr', location: 'Adamian 218', capacity: 50, registered: 33, category: 'Workshop' },
  { id: 'e8', title: 'International Food Festival', club: 'Cultural Exchange Club', clubId: '10', date: '2026-08-30', time: '12:00 PM', duration: '3 hr', location: 'Student Center', capacity: 300, registered: 142, category: 'Social' },
  { id: 'e9', title: 'Consulting Case Prep Session', club: 'Consulting Club', clubId: '11', date: '2026-09-02', time: '6:00 PM', duration: '2 hr', location: 'LaCava 220', capacity: 35, registered: 22, category: 'Workshop' },
  { id: 'e10', title: 'AI & Robotics Demo Day', club: 'Robotics & AI Club', clubId: '6', date: '2026-09-04', time: '4:00 PM', duration: '2 hr', location: 'Smith 101', capacity: 60, registered: 31, category: 'Demo' },
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function capacityColor(registered: number, capacity: number): string {
  const pct = registered / capacity;
  if (pct >= 1) return 'hsl(var(--destructive))';
  if (pct >= 0.85) return 'hsl(38 92% 50%)';
  return 'hsl(142 60% 40%)';
}

function capacityLabel(registered: number, capacity: number): string {
  if (registered >= capacity) return 'Full';
  if (registered / capacity >= 0.85) return 'Almost full';
  return `${capacity - registered} spots left`;
}

export default function DiscoverEventsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filtered = useMemo(() => {
    return EVENTS.filter((e) => {
      const matchesQuery =
        e.title.toLowerCase().includes(query.toLowerCase()) ||
        e.club.toLowerCase().includes(query.toLowerCase()) ||
        e.location.toLowerCase().includes(query.toLowerCase());
      const matchesCat = category === 'All' || e.category === category;
      return matchesQuery && matchesCat;
    });
  }, [query, category]);

  // Group by date
  const grouped = useMemo(() => {
    const map = new Map<string, typeof EVENTS>();
    for (const e of filtered) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <>
      <Helmet>
        <title>Campus Events — Campus Commons</title>
        <meta name="description" content="Discover upcoming student events at Bentley University. Browse by category, check capacity, and register — no account required." />
        <link rel="canonical" href="https://campuscommons.app/discover/events" />
        <meta property="og:title" content="Campus Events — Campus Commons" />
        <meta property="og:description" content="Upcoming student events at Bentley University." />
        <meta property="og:type" content="website" />
      </Helmet>

      <main style={{ background: 'hsl(var(--background))', minHeight: '100vh' }}>
        {/* Header */}
        <div className="pt-24 pb-10 px-4" style={{ borderBottom: '0.5px solid hsl(var(--border))' }}>
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[12px] mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
              <Link to="/discover" style={{ color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--muted-foreground))')}
              >
                Discover
              </Link>
              <span>/</span>
              <span style={{ color: 'hsl(var(--foreground))' }}>Events</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
                  Campus events
                </h1>
                <p className="text-[14px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Upcoming events across all clubs
                </p>
              </div>
              {/* .ics export placeholder */}
              <button
                className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 shrink-0"
                style={{
                  background: 'hsl(var(--card))',
                  border: '0.5px solid hsl(var(--border))',
                  color: 'hsl(var(--muted-foreground))',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--muted-foreground))')}
              >
                <Download size={13} />
                Export .ics
              </button>
            </div>

            {/* Search */}
            <div className="relative mt-6 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted-foreground))' }} />
              <input
                type="search"
                placeholder="Search events, clubs, locations…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-[14px] rounded-lg outline-none transition-all duration-150"
                style={{
                  background: 'hsl(var(--card))',
                  border: '0.5px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'hsl(var(--primary))')}
                onBlur={(e) => (e.target.style.borderColor = 'hsl(var(--border))')}
              />
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              {discover_events.EVENT_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-150"
                  style={{
                    background: category === cat ? 'hsl(var(--primary))' : 'hsl(var(--card))',
                    border: `0.5px solid ${category === cat ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                    color: category === cat ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Event list grouped by date */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {grouped.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'hsl(var(--muted))' }}>
                <Calendar size={24} style={{ color: 'hsl(var(--muted-foreground))' }} />
              </div>
              <p className="text-[15px] font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>No events found</p>
              <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>Try a different search or category.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {grouped.map(([date, events]) => (
                <div key={date}>
                  {/* Date header */}
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[13px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                      {formatDate(date)}
                    </span>
                    <div className="flex-1 h-px" style={{ background: 'hsl(var(--border))' }} />
                    <span className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: "'DM Mono', monospace" }}>
                      {events.length} event{events.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Events for this date */}
                  <div className="flex flex-col gap-2.5">
                    {events.map((event, i) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.22, delay: i * 0.05, ease: 'easeOut' as const }}
                      >
                        <div
                          className="group flex items-start gap-4 rounded-xl p-4 transition-all duration-150 cursor-pointer"
                          style={{
                            background: 'hsl(var(--card))',
                            border: '0.5px solid hsl(var(--border))',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.4)')}
                          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--border))')}
                        >
                          {/* Time column */}
                          <div className="shrink-0 w-16 text-right hidden sm:block">
                            <div className="text-[12px] font-medium" style={{ color: 'hsl(var(--foreground))', fontFamily: "'DM Mono', monospace" }}>
                              {event.time}
                            </div>
                            <div className="text-[11px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: "'DM Mono', monospace" }}>
                              {event.duration}
                            </div>
                          </div>

                          {/* Divider */}
                          <div className="hidden sm:block w-px self-stretch" style={{ background: 'hsl(var(--border))' }} />

                          {/* Main content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-[14px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                                  {event.title}
                                </div>
                                <Link
                                  to={`/clubs/${event.clubId}`}
                                  className="text-[12px] mt-0.5 inline-block transition-colors"
                                  style={{ color: 'hsl(var(--primary))', textDecoration: 'none' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {event.club}
                                </Link>
                              </div>
                              {/* Category badge */}
                              <div
                                className="shrink-0 px-2 py-0.5 rounded-full text-[11px] font-medium"
                                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                              >
                                {event.category}
                              </div>
                            </div>

                            {/* Meta row */}
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                <Clock size={11} />
                                <span style={{ fontFamily: "'DM Mono', monospace" }}>{event.time}</span>
                                <span className="sm:hidden">· {event.duration}</span>
                              </span>
                              <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                <MapPin size={11} />
                                {event.location}
                              </span>
                              <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                                <Users size={11} />
                                <span style={{ fontFamily: "'DM Mono', monospace" }}>{event.registered}</span>
                                <span>/ {event.capacity}</span>
                              </span>
                            </div>

                            {/* Capacity bar */}
                            <div className="mt-2.5 flex items-center gap-2">
                              <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'hsl(var(--muted))' }}>
                                <div
                                  className="h-full rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(100, (event.registered / event.capacity) * 100)}%`,
                                    background: capacityColor(event.registered, event.capacity),
                                  }}
                                />
                              </div>
                              <span
                                className="text-[11px] shrink-0"
                                style={{ color: capacityColor(event.registered, event.capacity), fontFamily: "'DM Mono', monospace" }}
                              >
                                {capacityLabel(event.registered, event.capacity)}
                              </span>
                            </div>
                          </div>

                          <ChevronRight
                            size={14}
                            className="shrink-0 self-center transition-transform duration-150 group-hover:translate-x-0.5"
                            style={{ color: 'hsl(var(--muted-foreground))' }}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
