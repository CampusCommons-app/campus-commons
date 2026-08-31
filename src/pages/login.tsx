import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.endsWith('@falcon.bentley.edu') && !email.endsWith('@bentley.edu')) {
      setError('Sign-in is restricted to Bentley University email addresses.');
      return;
    }

    setLoading(true);
    const { error: authError } = await signIn(email, password);
    setLoading(false);

    if (authError) {
      setError(authError);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>Sign In — Campus Commons</title>
        <meta name="description" content="Sign in to Campus Commons with your Bentley University email." />
        <link rel="canonical" href="https://campuscommons.app/login" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--background))' }}>
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/airo-assets/images/logo/horizontal"
              alt="Campus Commons"
              className="h-auto max-h-8 w-auto object-contain"
            />
          </Link>
          <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
            No account?{' '}
            <Link to="/signup" className="font-medium underline underline-offset-2" style={{ color: 'hsl(var(--primary))' }}>
              Sign up
            </Link>
          </span>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' as const }}
            className="w-full max-w-[400px]"
          >
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-[22px] font-semibold mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>
                Welcome back
              </h1>
              <p className="text-[14px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Sign in with your university email to continue.
              </p>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 rounded-lg px-4 py-3 mb-6 text-[13px]"
                style={{ background: 'hsl(var(--destructive) / 0.12)', color: 'hsl(var(--destructive))', border: '0.5px solid hsl(var(--destructive) / 0.3)' }}
              >
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
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

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                    Password
                  </label>
                  <a href="#" className="text-[12px] underline underline-offset-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{
                  background: loading ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px" style={{ background: 'hsl(var(--border))' }} />
              <span className="text-[12px]" style={{ color: 'hsl(var(--muted-foreground))' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'hsl(var(--border))' }} />
            </div>

            {/* SSO placeholder */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150 hover:brightness-110"
              style={{
                background: 'hsl(var(--card))',
                border: '0.5px solid hsl(var(--border))',
                color: 'hsl(var(--foreground))',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google (SSO)
            </button>

            {/* Domain note */}
            <p className="text-center text-[12px] mt-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Access is restricted to{' '}
              <span style={{ fontFamily: "'DM Mono', monospace", color: 'hsl(var(--foreground))' }}>
                @falcon.bentley.edu
              </span>{' '}
              addresses.
            </p>
          </motion.div>
        </div>
      </main>
    </>
  );
}
