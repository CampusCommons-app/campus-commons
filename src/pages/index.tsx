import { useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion, useInView } from 'motion/react';
import { ArrowRight, Users, TrendingUp, Clock } from 'lucide-react';
import { home } from 'virtual:content';
import { getSegmentColor, getScoreColor } from '@/components/HealthBar';

const SEGMENTS = 10; // health bar segment count

function InlineHealthBar({ score, size = 'md', showLabel = true }: { score: number; size?: 'sm' | 'md' | 'lg'; showLabel?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const filledSegments = Math.round((score / 100) * SEGMENTS);
  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' };
  const gaps = { sm: 'gap-0.5', md: 'gap-1', lg: 'gap-1' };
  return (
    <div ref={ref} className="flex flex-col gap-1">
      <div className={`flex ${gaps[size]}`}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <motion.div
            key={i}
            className={`flex-1 rounded-sm ${heights[size]}`}
            style={{ background: i < filledSegments ? getSegmentColor(i) : 'hsl(var(--border))' }}
            initial={{ scaleY: 0, opacity: 0 }}
            animate={inView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.25, delay: inView ? i * 0.04 : 0, ease: 'easeOut' as const }}
          />
        ))}
      </div>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Health Score</span>
          <span className="text-xs font-bold" style={{ color: getScoreColor(score) }}>{score}/100</span>
        </div>
      )}
    </div>
  );
}

const tagColors: Record<string, string> = {
  blue: 'hsl(var(--primary))',
  purple: '#7c3aed',
  green: '#16a34a',
  teal: '#0d9488',
  orange: '#ea580c',
  Finance: '#16a34a',
  Business: 'hsl(var(--primary))',
  Arts: '#7c3aed',
  Environment: '#0d9488',
  Gaming: '#ea580c',
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const site = 'https://campuscommons.app';

  return (
    <>
      <Helmet>
        <title>Campus Commons — Club Life at Bentley University</title>
        <meta name="description" content="See which clubs are thriving at Bentley University. Real attendance data, live health scores, and a daily news feed — Campus Commons is the campus platform students actually want." />
        <link rel="canonical" href={`${site}/`} />
        <meta property="og:title" content="Campus Commons — Club Life at Bentley University" />
        <meta property="og:description" content="Real attendance data, live health scores, and a daily news feed. Campus Commons is the campus platform students actually want." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${site}/`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'WebSite', '@id': `${site}/#website`, name: 'Campus Commons', url: `${site}/` },
            { '@type': 'Organization', '@id': `${site}/#organization`, name: 'Campus Commons', url: `${site}/` },
            { '@type': 'WebPage', '@id': `${site}/#webpage`, url: `${site}/`, isPartOf: { '@id': `${site}/#website` }, about: { '@id': `${site}/#organization` }, datePublished: '2026-08-22', dateModified: '2026-08-22' },
          ],
        })}</script>
      </Helmet>

      <main>
        {/* ── HERO ── */}
        <section
          className="relative min-h-screen flex items-center pt-20 pb-16 overflow-hidden bg-primary"
          aria-label="Hero"
        >
          {/* Grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary-foreground) / 0.04) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground) / 0.04) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
          {/* Gold accent blob */}
          <div
            className="absolute top-1/4 right-0 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'hsl(var(--accent) / 0.08)', filter: 'blur(80px)', transform: 'translateX(30%)' }}
          />
          {/* Bentley logo watermark */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
            aria-hidden="true"
          >
            <img
              src="/airo-assets/images/hero/bentley-watermark"
              alt=""
              className="object-contain"
              style={{
                width: 'clamp(480px, 70vw, 900px)',
                opacity: 0.13,
                filter: 'brightness(0) invert(1)',
                mixBlendMode: 'screen',
              }}
            />
          </div>


          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left */}
              <motion.div
                className="flex flex-col gap-6"
                initial="hidden"
                animate="visible"
                variants={stagger}
              >
                <motion.div variants={fadeUp}>
                  <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-accent/20 text-accent mb-4">
                    Now live at Bentley University
                  </span>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight tracking-tight">
                    {home.hero.headline}
                  </h1>
                </motion.div>
                <motion.p variants={fadeUp} className="text-lg text-primary-foreground/70 max-w-lg leading-relaxed">
                  {home.hero.subhead}
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-wrap gap-3">
                  <a
                    href="#signin"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm bg-accent text-primary hover:brightness-110 transition-all duration-150 active:scale-95"
                  >
                    {home.hero.ctaPrimary}
                    <ArrowRight size={16} />
                  </a>
                  <a
                    href="#explore"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm border border-primary-foreground/30 text-primary-foreground hover:border-primary-foreground/60 hover:bg-primary-foreground/5 transition-all duration-150"
                  >
                    {home.hero.ctaSecondary}
                  </a>
                </motion.div>
              </motion.div>

              {/* Right — mock club card */}
              <motion.div
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' as const }}
                className="relative"
              >
                <div className="rounded-2xl border border-primary-foreground/10 bg-primary-foreground/5 backdrop-blur-sm p-6 flex flex-col gap-5 shadow-2xl">
                  {/* Club header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        <span className="text-xs font-medium text-accent">{home.mockClub.tag}</span>
                      </div>
                      <h3 className="text-lg font-bold text-primary-foreground">{home.mockClub.name}</h3>
                    </div>
                    <span className="text-2xl font-extrabold text-primary-foreground/90">{home.mockClub.healthScore}</span>
                  </div>

                  {/* Health bar */}
                  <InlineHealthBar score={87} size="lg" />

                  {/* Attendance */}
                  <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                    <Users size={14} className="text-accent" />
                    <span>
                      <span className="font-semibold text-primary-foreground">{home.mockClub.attendance}</span>
                      {' '}attended last meeting
                    </span>
                    <span className="ml-auto text-xs font-bold text-green-400">{home.mockClub.attendancePercent}%</span>
                  </div>

                  {/* Mini news post */}
                  <div className="border-t border-primary-foreground/10 pt-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Clock size={12} className="text-primary-foreground/40" />
                      <span className="text-xs text-primary-foreground/40">{home.mockClub.postedAgo}</span>
                    </div>
                    <p className="text-sm text-primary-foreground/80 leading-relaxed line-clamp-3">
                      {home.mockClub.lastPost}
                    </p>
                  </div>
                </div>

                {/* Decorative floating stat */}
                <motion.div
                  className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-4 py-3 shadow-lg hidden sm:flex items-center gap-3"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <TrendingUp size={18} className="text-green-500" />
                  <div>
                    <div className="text-xs text-muted-foreground">This week</div>
                    <div className="text-sm font-bold text-foreground">+12 new members</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── LIVE FEED + LEADERBOARD ── */}
        <section id="explore" className="py-20 bg-background" aria-label="Live club feed and leaderboard">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* News Feed */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <h2 className="text-xl font-bold text-foreground">{home.newsFeed.sectionTitle}</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {home.newsFeed.posts.map((post) => (
                    <motion.div
                      key={post.id}
                      className="bg-card border border-border rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer"
                      style={{ borderLeft: `3px solid ${tagColors[post.tagColor] || tagColors[post.tag] || 'hsl(var(--primary))'}` }}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, ease: 'easeOut' as const }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{post.clubName}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: `${tagColors[post.tagColor] || tagColors[post.tag] || 'hsl(var(--primary))'}20`, color: tagColors[post.tagColor] || tagColors[post.tag] || 'hsl(var(--primary))' }}
                          >
                            {post.tag}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">{post.postedAgo}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{post.text}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp size={18} className="text-accent" />
                  <h2 className="text-xl font-bold text-foreground">{home.leaderboard.sectionTitle}</h2>
                </div>
                <div className="flex flex-col gap-3">
                  {home.leaderboard.clubs.map((club) => (
                    <motion.div
                      key={club.id}
                      className="bg-card border border-border rounded-xl p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer"
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: club.rank * 0.06, ease: 'easeOut' as const }}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className="text-2xl font-extrabold w-8 shrink-0 leading-none"
                          style={{ color: club.rank === 1 ? 'hsl(var(--accent))' : club.rank === 2 ? '#94a3b8' : club.rank === 3 ? '#cd7f32' : 'hsl(var(--muted-foreground))' }}
                        >
                          #{club.rank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground truncate">{club.name}</span>
                            <span className="text-xs text-muted-foreground ml-2 shrink-0">{club.memberCount} members</span>
                          </div>
                          {/* Inline health bar segments — score is a static display number */}
                          <div className="flex gap-0.5">
                            {Array.from({ length: SEGMENTS }).map((_, i) => {
                              const filled = i < Math.round((club.rank === 1 ? 94 : club.rank === 2 ? 87 : club.rank === 3 ? 81 : club.rank === 4 ? 76 : 71) / 100 * SEGMENTS);
                              return (
                                <motion.div
                                  key={i}
                                  className="flex-1 rounded-sm h-2"
                                  style={{ background: filled ? getSegmentColor(i) : 'hsl(var(--border))' }}
                                  initial={{ scaleY: 0, opacity: 0 }}
                                  whileInView={{ scaleY: 1, opacity: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.2, delay: i * 0.03, ease: 'easeOut' as const }}
                                />
                              );
                            })}
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-xs text-muted-foreground">{club.tag}</span>
                            <span className="text-xs font-bold text-green-500">
                              {club.attendancePercent}% attendance
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HEALTH SCORE EXPLAINER ── */}
        <section
          id="how-it-works"
          className="py-24 bg-primary relative overflow-hidden"
          aria-label="Health score explainer"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary-foreground) / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground) / 0.03) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-primary-foreground mb-4">
                {home.healthExplainer.headline}
              </motion.h2>
              <motion.p variants={fadeUp} className="text-xl font-semibold text-accent mb-4">
                {home.healthExplainer.subhead}
              </motion.p>
              <motion.p variants={fadeUp} className="text-base text-primary-foreground/60 max-w-2xl mx-auto">
                {home.healthExplainer.description}
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {home.healthExplainer.stats.map((stat) => (
                <motion.div
                  key={stat.id}
                  variants={fadeUp}
                  className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-8 flex flex-col gap-3"
                >
                  <span className="text-5xl font-extrabold text-accent leading-none">{stat.value}</span>
                  <span className="text-base font-bold text-primary-foreground">{stat.label}</span>
                  <p className="text-sm text-primary-foreground/60 leading-relaxed">{stat.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── ROLES ── */}
        <section className="py-24 bg-background" aria-label="How it works for each role">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
                {home.roles.headline}
              </motion.h2>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {home.roles.columns.map((col, i) => (
                <motion.div
                  key={col.id}
                  variants={fadeUp}
                  className="rounded-2xl border border-border p-8 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                  style={{ borderTop: `3px solid ${i === 0 ? 'hsl(var(--primary))' : i === 1 ? 'hsl(var(--accent))' : '#22c55e'}` }}
                >
                  <div>
                    <span
                      className="text-xs font-semibold uppercase tracking-widest mb-2 block"
                      style={{ color: i === 0 ? 'hsl(var(--primary))' : i === 1 ? 'hsl(var(--accent))' : '#22c55e' }}
                    >
                      {col.role}
                    </span>
                    <h3 className="text-xl font-bold text-foreground">{col.tagline}</h3>
                  </div>
                  <ul className="flex flex-col gap-2.5">
                    {col.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: i === 0 ? 'hsl(var(--primary))' : i === 1 ? 'hsl(var(--accent))' : '#22c55e' }}
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          id="get-started"
          className="py-24 bg-primary relative overflow-hidden"
          aria-label="Sign in call to action"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary-foreground) / 0.03) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground) / 0.03) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
            }}
          />
          <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: 'hsl(var(--accent) / 0.06)', filter: 'blur(80px)', transform: 'translate(-30%, 30%)' }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left text */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <motion.h2 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-primary-foreground leading-tight mb-3">
                  {home.cta.headline}
                </motion.h2>
                <motion.p variants={fadeUp} className="text-3xl sm:text-4xl font-extrabold text-accent mb-6">
                  {home.cta.subhead}
                </motion.p>
                <motion.p variants={fadeUp} className="text-base text-primary-foreground/60 max-w-md">
                  {home.cta.description}
                </motion.p>
              </motion.div>

              {/* Right form */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: 'easeOut' as const }}
                id="signin"
                className="bg-primary-foreground/5 border border-primary-foreground/10 rounded-2xl p-8 flex flex-col gap-5"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-primary-foreground/80" htmlFor="email">
                    University email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@bentley.edu"
                    className="w-full px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/30 text-sm focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
                <a
                  href="#"
                  className="w-full text-center px-6 py-3 rounded-md font-semibold text-sm bg-accent text-primary hover:brightness-110 transition-all duration-150 active:scale-95"
                >
                  {home.cta.buttonLabel}
                </a>
                <div className="relative flex items-center gap-3">
                  <div className="flex-1 h-px bg-primary-foreground/10" />
                  <span className="text-xs text-primary-foreground/30">or</span>
                  <div className="flex-1 h-px bg-primary-foreground/10" />
                </div>
                <a
                  href="#"
                  className="w-full text-center px-6 py-3 rounded-md font-semibold text-sm border border-primary-foreground/20 text-primary-foreground/70 hover:border-primary-foreground/40 hover:text-primary-foreground transition-all duration-150 text-xs"
                >
                  {home.cta.requestLabel}
                </a>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
