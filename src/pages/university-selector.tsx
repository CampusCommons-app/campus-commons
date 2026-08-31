import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { ChevronDown, ArrowRight, GraduationCap } from 'lucide-react';

const UNIVERSITIES = [
  {
    id: 'bentley',
    name: 'Bentley University',
    location: 'Waltham, MA',
    clubs: 12,
    active: true,
  },
];

export default function UniversitySelectorPage() {
  const [selected, setSelected] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const chosen = UNIVERSITIES.find((u) => u.id === selected);

  function handleGo() {
    if (chosen) navigate(`/${chosen.id}`);
  }

  return (
    <>
      <Helmet>
        <title>Campus Commons — Select Your University</title>
        <meta name="description" content="Select your university to access Campus Commons — the student club platform built for your campus." />
        <link rel="canonical" href="https://campuscommons.app" />
      </Helmet>

      <main
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: 'hsl(var(--background))' }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' as const }}
          className="mb-10 flex flex-col items-center"
        >
          <img
            src="/airo-assets/images/logo/horizontal"
            alt="Campus Commons"
            className="h-auto max-h-10 w-auto object-contain mb-6"
          />
          <h1
            className="text-[26px] md:text-[32px] font-bold text-center leading-tight"
            style={{ color: 'hsl(var(--foreground))' }}
          >
            Which university are you at?
          </h1>
          <p
            className="text-[14px] mt-2 text-center"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Select your school to get started.
          </p>
        </motion.div>

        {/* Selector card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' as const }}
          className="w-full max-w-sm"
        >
          {/* Dropdown */}
          <div className="relative mb-4">
            <button
              onClick={() => setOpen(!open)}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[14px] transition-all duration-150"
              style={{
                background: 'hsl(var(--card))',
                border: `0.5px solid ${open ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                color: chosen ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              }}
            >
              <span className="flex items-center gap-2.5">
                <GraduationCap size={16} style={{ color: chosen ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }} />
                {chosen ? chosen.name : 'Select your university…'}
              </span>
              <ChevronDown
                size={15}
                style={{
                  color: 'hsl(var(--muted-foreground))',
                  transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s',
                }}
              />
            </button>

            {open && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.12 }}
                className="absolute top-full left-0 right-0 mt-1.5 rounded-xl overflow-hidden z-10"
                style={{
                  background: 'hsl(var(--card))',
                  border: '0.5px solid hsl(var(--border))',
                  boxShadow: '0 8px 24px hsl(var(--foreground) / 0.08)',
                }}
              >
                {UNIVERSITIES.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => { setSelected(u.id); setOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors duration-100"
                    style={{
                      background: selected === u.id ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (selected !== u.id) e.currentTarget.style.background = 'hsl(var(--muted))'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selected === u.id ? 'hsl(var(--primary) / 0.08)' : 'transparent'; }}
                  >
                    <div>
                      <div className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                        {u.name}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        {u.location} · {u.clubs} clubs
                      </div>
                    </div>
                    {u.active && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'hsl(var(--accent) / 0.15)', color: 'hsl(var(--accent))' }}
                      >
                        Live
                      </span>
                    )}
                  </button>
                ))}

                {/* Coming soon placeholder */}
                <div
                  className="px-4 py-3"
                  style={{ borderTop: '0.5px solid hsl(var(--border))' }}
                >
                  <div className="text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    More universities coming soon
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Go button */}
          <button
            onClick={handleGo}
            disabled={!chosen}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold transition-all duration-150 active:scale-[0.98]"
            style={{
              background: chosen ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
              color: chosen ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
              cursor: chosen ? 'pointer' : 'not-allowed',
            }}
          >
            Go to my campus
            <ArrowRight size={15} />
          </button>

          <p
            className="text-center text-[12px] mt-4"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            Don't see your school?{' '}
            <a
              href="mailto:hello@campuscommons.app"
              className="underline"
              style={{ color: 'hsl(var(--primary))' }}
            >
              Request it
            </a>
          </p>
        </motion.div>
      </main>
    </>
  );
}
