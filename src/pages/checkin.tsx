import { useState } from 'react';
import { useParams } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { CheckCircle2, AlertCircle, QrCode, User, Mail, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type CheckInState = 'idle' | 'loading' | 'success' | 'error' | 'expired';

// Mock event data — replaced by real DB lookup when auth/DB is wired
const MOCK_EVENT = {
  name: 'Finance Club — Weekly Meeting',
  club: 'Finance Club',
  date: 'Friday, Aug 22, 2026',
  time: '6:00 PM – 7:30 PM',
  location: 'LaCava 220',
  open: true,
};

// Semantic status colors (status, not brand — from field guide)
const STATUS = {
  thriving: { bg: 'hsl(142 72% 29% / 0.12)', text: 'hsl(142 72% 29%)' },
  atRisk: { bg: 'hsl(var(--destructive) / 0.1)', text: 'hsl(var(--destructive))' },
};

export default function CheckInPage() {
  const { token } = useParams<{ token: string }>();
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [state, setState] = useState<CheckInState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const isExpired = !MOCK_EVENT.open;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!guestName.trim()) { setErrorMsg('Please enter your name.'); return; }
    if (!guestEmail.trim()) { setErrorMsg('Please enter your email.'); return; }
    setState('loading');
    setTimeout(() => setState('success'), 1400);
  };

  return (
    <>
      <Helmet>
        <title>Check In — Campus Commons</title>
        <meta name="description" content="Check in to your campus club event with your name and email. No account required." />
        <link rel="canonical" href="https://campuscommons.app/checkin" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main
        className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
        style={{ background: 'hsl(var(--background))' }}
      >
        <AnimatePresence mode="wait">
          {/* Success */}
          {state === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' as const }}
              className="flex flex-col items-center text-center max-w-sm"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: STATUS.thriving.bg }}>
                <CheckCircle2 size={40} style={{ color: STATUS.thriving.text }} />
              </div>
              <h1 className="text-[22px] font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
                You're checked in!
              </h1>
              <p className="text-[14px] mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {MOCK_EVENT.name}
              </p>
              <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: "'DM Mono', monospace" }}>
                {MOCK_EVENT.date} · {MOCK_EVENT.time}
              </p>
              <div
                className="mt-8 px-5 py-3 rounded-xl text-[13px]"
                style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}
              >
                Your attendance has been recorded. See you there!
              </div>
            </motion.div>
          )}

          {/* Expired */}
          {state !== 'success' && isExpired && (
            <motion.div
              key="expired"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center text-center max-w-sm"
            >
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: STATUS.atRisk.bg }}>
                <AlertCircle size={40} style={{ color: STATUS.atRisk.text }} />
              </div>
              <h1 className="text-[22px] font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
                This QR code has expired
              </h1>
              <p className="text-[14px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Check-in closed 3 hours after the event started. Contact your club officer if you need your attendance recorded manually.
              </p>
            </motion.div>
          )}

          {/* Active form */}
          {state !== 'success' && !isExpired && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' as const }}
              className="w-full max-w-[400px]"
            >
              {/* Event header */}
              <div className="flex flex-col items-center text-center mb-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'hsl(var(--primary) / 0.12)' }}
                >
                  <QrCode size={28} style={{ color: 'hsl(var(--primary))' }} />
                </div>
                <h1 className="text-[20px] font-semibold mb-1" style={{ color: 'hsl(var(--foreground))' }}>
                  {MOCK_EVENT.name}
                </h1>
                <div className="flex items-center gap-3 text-[13px] mt-1" style={{ color: 'hsl(var(--muted-foreground))', fontFamily: "'DM Mono', monospace" }}>
                  <span>{MOCK_EVENT.date}</span>
                  <span>·</span>
                  <span>{MOCK_EVENT.time}</span>
                </div>
                <div className="text-[13px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  {MOCK_EVENT.location}
                </div>
                <div
                  className="mt-3 px-3 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: STATUS.thriving.bg, color: STATUS.thriving.text }}
                >
                  Check-in open
                </div>
              </div>

              {/* Form card */}
              <div
                className="rounded-xl p-6"
                style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
              >
                <p className="text-[13px] mb-5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  Enter your name and email to check in. No account required.
                </p>

                {errorMsg && (
                  <div
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 mb-4 text-[13px]"
                    style={{ background: STATUS.atRisk.bg, color: STATUS.atRisk.text, border: '0.5px solid hsl(var(--destructive) / 0.25)' }}
                  >
                    <AlertCircle size={13} className="shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="guest-name" className="text-[12px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                      Full name
                    </label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted-foreground))' }} />
                      <input
                        id="guest-name"
                        type="text"
                        placeholder="Alex Johnson"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-[14px] rounded-lg outline-none transition-all duration-150"
                        style={{
                          background: 'hsl(var(--background))',
                          border: '0.5px solid hsl(var(--border))',
                          color: 'hsl(var(--foreground))',
                          fontFamily: 'inherit',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'hsl(var(--primary))')}
                        onBlur={(e) => (e.target.style.borderColor = 'hsl(var(--border))')}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="guest-email" className="text-[12px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                      Email
                    </label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'hsl(var(--muted-foreground))' }} />
                      <input
                        id="guest-email"
                        type="email"
                        placeholder="you@falcon.bentley.edu"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 text-[14px] rounded-lg outline-none transition-all duration-150"
                        style={{
                          background: 'hsl(var(--background))',
                          border: '0.5px solid hsl(var(--border))',
                          color: 'hsl(var(--foreground))',
                          fontFamily: 'inherit',
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'hsl(var(--primary))')}
                        onBlur={(e) => (e.target.style.borderColor = 'hsl(var(--border))')}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={state === 'loading'}
                    className="mt-1 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 active:scale-[0.98]"
                    style={{
                      background: state === 'loading' ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      cursor: state === 'loading' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {state === 'loading' ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Checking in…
                      </span>
                    ) : (
                      <>
                        Check in
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <p className="text-center text-[12px] mt-5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Token:{' '}
                <span style={{ fontFamily: "'DM Mono', monospace", color: 'hsl(var(--foreground))' }}>
                  {token ?? '—'}
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
