import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';

const ROLES = [
  { value: 'member', label: 'Student / Member', desc: 'Browse clubs, check in to events, track your attendance.' },
  { value: 'officer', label: 'Club Officer', desc: 'Manage your club, log events, view analytics.' },
] as const;

type Role = typeof ROLES[number]['value'];

export default function SignupPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<Role>('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.endsWith('@falcon.bentley.edu') && !email.endsWith('@bentley.edu')) {
      setError('Sign-up is restricted to Bentley University email addresses.');
      return;
    }
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const { error: authError } = await signUp(email, password, name);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    navigate('/dashboard');
  };

  const passwordStrength = password.length === 0 ? 0 : password.length < 8 ? 1 : password.length < 12 ? 2 : 3;
  const strengthColors = ['', 'hsl(var(--destructive))', 'hsl(var(--warning))', '#16a34a'];
  const strengthLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <>
      <Helmet>
        <title>Create Account — Campus Commons</title>
        <meta name="description" content="Create your Campus Commons account with your Bentley University email." />
        <link rel="canonical" href="https://campuscommons.app/signup" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--background))' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/airo-assets/images/logo/horizontal"
              alt="Campus Commons"
              className="h-auto max-h-8 w-auto object-contain"
            />
          </Link>
          <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium underline underline-offset-2" style={{ color: 'hsl(var(--primary))' }}>
              Sign in
            </Link>
          </span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' as const }}
            className="w-full max-w-[420px]"
          >
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold transition-all duration-200"
                    style={{
                      background: step >= s ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                      color: step >= s ? 'hsl(var(--primary-foreground))' : 'hsl(var(--muted-foreground))',
                    }}
                  >
                    {step > s ? <CheckCircle2 size={13} /> : s}
                  </div>
                  <span className="text-[12px]" style={{ color: step >= s ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}>
                    {s === 1 ? 'Your email' : 'Your details'}
                  </span>
                  {s < 2 && <div className="w-8 h-px mx-1" style={{ background: 'hsl(var(--border))' }} />}
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h1 className="text-[22px] font-semibold mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>
                {step === 1 ? 'Create your account' : 'Finish setting up'}
              </h1>
              <p className="text-[14px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {step === 1
                  ? 'Use your Bentley University email to get started.'
                  : 'Just a few more details and you\'re in.'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 rounded-lg px-4 py-3 mb-5 text-[13px]"
                style={{ background: 'hsl(var(--destructive) / 0.12)', color: 'hsl(var(--destructive))', border: '0.5px solid hsl(var(--destructive) / 0.3)' }}
              >
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleStep1} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                    University email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@falcon.bentley.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-[14px] rounded-lg outline-none transition-all duration-150"
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

                {/* Role picker */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>I am a…</span>
                  <div className="flex flex-col gap-2">
                    {ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className="flex items-start gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150"
                        style={{
                          background: role === r.value ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--card))',
                          border: `0.5px solid ${role === r.value ? 'hsl(var(--primary))' : 'hsl(var(--border))'}`,
                        }}
                      >
                        <div
                          className="mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                          style={{
                            borderColor: role === r.value ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                          }}
                        >
                          {role === r.value && (
                            <div className="w-2 h-2 rounded-full" style={{ background: 'hsl(var(--primary))' }} />
                          )}
                        </div>
                        <div>
                          <div className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>{r.label}</div>
                          <div className="text-[12px] mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{r.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-1 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 active:scale-[0.98]"
                  style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                >
                  Continue
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleStep2} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 text-[14px] rounded-lg outline-none transition-all duration-150"
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

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 pr-10 text-[14px] rounded-lg outline-none transition-all duration-150"
                      style={{
                        background: 'hsl(var(--card))',
                        border: '0.5px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))',
                        fontFamily: 'inherit',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'hsl(var(--primary))')}
                      onBlur={(e) => (e.target.style.borderColor = 'hsl(var(--border))')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'hsl(var(--muted-foreground))' }}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {/* Strength bar */}
                  {password.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-1 flex-1 rounded-full transition-all duration-200"
                            style={{ background: passwordStrength >= i ? strengthColors[passwordStrength] : 'hsl(var(--border))' }}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: strengthColors[passwordStrength], fontFamily: "'DM Mono', monospace" }}>
                        {strengthLabels[passwordStrength]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(''); }}
                    className="flex-1 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150"
                    style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] flex items-center justify-center gap-2 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 active:scale-[0.98]"
                    style={{
                      background: loading ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--primary))',
                      color: 'hsl(var(--primary-foreground))',
                      cursor: loading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        Creating account…
                      </span>
                    ) : (
                      <>
                        Create account
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            <p className="text-center text-[12px] mt-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
              By signing up you agree to our{' '}
              <Link to="/terms" className="underline underline-offset-2" style={{ color: 'hsl(var(--foreground))' }}>Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="underline underline-offset-2" style={{ color: 'hsl(var(--foreground))' }}>Privacy Policy</Link>.
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
}
