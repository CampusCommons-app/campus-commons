import { discover } from 'virtual:content';
import { useState, useMemo } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Search, Users, Calendar, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'motion/react';
import ClubDrawer, { type Club } from '@/components/ClubDrawer';

// ─── Mock club data ───────────────────────────────────────────────────────────
const CLUBS = [
  { id: '1', name: 'Finance Club', category: 'Business', members: 142, events: 18, description: 'Exploring markets, investments, and careers in finance through speaker events and case competitions.' },
  { id: '2', name: 'Entrepreneurship Society', category: 'Business', members: 98, events: 12, description: 'Connecting student founders with mentors, resources, and pitch opportunities.' },
  { id: '3', name: 'Data Analytics Club', category: 'Technology', members: 76, events: 9, description: 'Hands-on workshops in Python, SQL, and data visualization for business applications.' },
  { id: '4', name: 'Marketing Association', category: 'Business', members: 115, events: 14, description: 'Brand strategy, digital marketing, and real-world campaign projects with local businesses.' },
  { id: '5', name: 'Accounting Society', category: 'Business', members: 88, events: 11, description: 'CPA exam prep, networking with Big 4 firms, and accounting career development.' },
  { id: '6', name: 'Robotics & AI Club', category: 'Technology', members: 54, events: 7, description: 'Building autonomous systems and exploring machine learning applications.' },
  { id: '7', name: 'Investment Banking Club', category: 'Finance', members: 63, events: 8, description: 'Technical interview prep, deal analysis, and connections to Wall Street professionals.' },
  { id: '8', name: 'Sustainability Initiative', category: 'Social Impact', members: 71, events: 10, description: 'Driving campus sustainability projects and connecting students with green careers.' },
  { id: '9', name: 'Pre-Law Society', category: 'Academic', members: 45, events: 6, description: 'LSAT prep, law school applications, and networking with legal professionals.' },
  { id: '10', name: 'Cultural Exchange Club', category: 'Social', members: 89, events: 15, description: 'Celebrating diversity through cultural events, food festivals, and international speaker series.' },
  { id: '11', name: 'Consulting Club', category: 'Business', members: 107, events: 13, description: 'Case interview prep, strategy frameworks, and connections to top consulting firms.' },
  { id: '12', name: 'Photography Society', category: 'Arts', members: 38, events: 5, description: 'Campus photography walks, editing workshops, and an annual showcase.' },
];

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

// Deterministic hue per club name for avatar background
function clubHue(name: string): number {
  const hues = [15, 215, 262, 142, 32, 340];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return hues[Math.abs(hash) % hues.length];
}

export default function DiscoverPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('most-active');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeClub, setActiveClub] = useState<Club | null>(null);

  const filtered = useMemo(() => {
    let list = CLUBS.filter((c) => {
      const matchesQuery =
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.description.toLowerCase().includes(query.toLowerCase());
      const matchesCat = category === 'All' || c.category === category;
      return matchesQuery && matchesCat;
    });
    if (sort === 'most-active') list = [...list].sort((a, b) => b.events - a.events);
    else if (sort === 'most-members') list = [...list].sort((a, b) => b.members - a.members);
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [query, category, sort]);

  return (
    <>
      <Helmet>
        <title>Discover Clubs — Campus Commons</title>
        <meta name="description" content="Browse and discover student clubs at Bentley University. Filter by category, see event activity, and join the clubs that match your interests." />
        <link rel="canonical" href="https://campuscommons.app/bentley/discover" />
        <meta property="og:title" content="Discover Clubs — Campus Commons" />
        <meta property="og:description" content="Browse student clubs at Bentley University." />
        <meta property="og:type" content="website" />
      </Helmet>

      <main style={{ background: 'hsl(var(--background))', minHeight: '100vh' }}>
        {/* Page header */}
        <div className="pt-24 pb-10 px-4" style={{ borderBottom: '0.5px solid hsl(var(--border))' }}>
          <div className="max-w-6xl mx-auto">
            <h1 className="text-[22px] font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
              Discover clubs
            </h1>
            <p className="text-[14px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {CLUBS.length} clubs at Bentley University
            </p>

            {/* Search + sort row */}
            <div className="flex items-center gap-3 mt-6">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted-foreground))' }} />
                <input
                  type="search"
                  placeholder="Search clubs…"
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

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="hidden md:block px-3 py-2.5 text-[13px] rounded-lg outline-none cursor-pointer"
                style={{
                  background: 'hsl(var(--card))',
                  border: '0.5px solid hsl(var(--border))',
                  color: 'hsl(var(--foreground))',
                  fontFamily: 'inherit',
                }}
              >
                {discover.SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="md:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-[13px] font-medium"
                style={{
                  background: filtersOpen ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--card))',
                  border: `0.5px solid ${filtersOpen ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                  color: filtersOpen ? 'hsl(var(--primary))' : 'hsl(var(--foreground))',
                }}
              >
                <SlidersHorizontal size={14} />
                Filters
              </button>
            </div>

            {/* Category chips */}
            <div className={`flex flex-wrap gap-2 mt-4 ${!filtersOpen ? 'hidden md:flex' : 'flex'}`}>
              {discover.CATEGORIES.map((cat) => (
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
              {(query || category !== 'All') && (
                <button
                  onClick={() => { setQuery(''); setCategory('All'); }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-medium"
                  style={{ color: 'hsl(var(--muted-foreground))', border: '0.5px solid hsl(var(--border))' }}
                >
                  <X size={11} />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Club grid */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'hsl(var(--muted))' }}>
                <Search size={24} style={{ color: 'hsl(var(--muted-foreground))' }} />
              </div>
              <p className="text-[15px] font-medium mb-1" style={{ color: 'hsl(var(--foreground))' }}>No clubs found</p>
              <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>Try a different search or category.</p>
            </div>
          ) : (
            <>
              <p className="text-[12px] mb-5" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: "'DM Mono', monospace" }}>
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((club, i) => (
                  <motion.div
                    key={club.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04, ease: 'easeOut' as const }}
                  >
                    <button
                      onClick={() => setActiveClub(club)}
                      className="group flex flex-col h-full w-full text-left rounded-xl p-5 transition-all duration-150"
                      style={{
                        background: 'hsl(var(--card))',
                        border: '0.5px solid hsl(var(--border))',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--primary) / 0.5)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'hsl(var(--border))')}
                    >
                      {/* Avatar + name */}
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0"
                          style={{
                            background: `hsl(${clubHue(club.name)} 65% 45%)`,
                            color: 'hsl(var(--primary-foreground))',
                          }}
                        >
                          {initials(club.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-semibold leading-snug" style={{ color: 'hsl(var(--foreground))' }}>
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

                      {/* Description */}
                      <p className="text-[13px] leading-relaxed flex-1 mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {club.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-3" style={{ borderTop: '0.5px solid hsl(var(--border))' }}>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            <Users size={12} />
                            <span style={{ fontFamily: "'DM Mono', monospace" }}>{club.members}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                            <Calendar size={12} />
                            <span style={{ fontFamily: "'DM Mono', monospace" }}>{club.events}</span>
                            <span>events</span>
                          </span>
                        </div>
                        <ChevronRight
                          size={14}
                          className="transition-transform duration-150 group-hover:translate-x-0.5"
                          style={{ color: 'hsl(var(--muted-foreground))' }}
                        />
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <ClubDrawer club={activeClub} onClose={() => setActiveClub(null)} />
    </>
  );
}
