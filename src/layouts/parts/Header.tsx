import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Menu, X, Moon, Sun, LogOut, LayoutDashboard, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, isSignedIn, signOut } = useAuth();

  const isBentleyHome = location.pathname === '/bentley';
  const navLinks = isBentleyHome
    ? [
        { label: 'Explore', href: '#explore' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Discover', href: '/bentley/discover' },
      ]
    : location.pathname === '/'
    ? []
    : [
        { label: 'Home', href: '/bentley' },
        { label: 'Discover', href: '/bentley/discover' },
        { label: 'Events', href: '/bentley/discover/events' },
      ];

  const textMuted = 'hsl(var(--secondary-foreground) / 0.70)';
  const textFull  = 'hsl(var(--secondary-foreground))';
  const dividerColor = 'hsl(var(--secondary-foreground) / 0.12)';

  function handleSignOut() {
    signOut();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate('/bentley');
  }

  // Initials avatar from user name
  function initials(name: string) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  }

  const isUniversitySelector = location.pathname === '/';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: 'hsl(var(--secondary))',
        borderBottom: `0.5px solid ${dividerColor}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 min-w-0">
            <img
              src="/airo-assets/images/logo/horizontal/dark"
              alt="Campus Commons"
              className="block h-auto max-h-9 md:max-h-10 w-auto max-w-full object-contain self-center"
            />
          </Link>

          {/* Desktop Nav */}
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-7">
            {navLinks.map((link) =>
              link.href.startsWith('#') ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[13px] font-medium transition-colors duration-150"
                  style={{ color: textMuted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = textFull)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-[13px] font-medium transition-colors duration-150"
                  style={{ color: textMuted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = textFull)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to night mode'}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
              style={{ color: textMuted, background: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = textFull;
                e.currentTarget.style.background = 'hsl(var(--secondary-foreground) / 0.10)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = textMuted;
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {!isUniversitySelector && isSignedIn && user ? (
              /* ── Signed-in: avatar + dropdown ── */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-150"
                  style={{ color: textFull }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--secondary-foreground) / 0.10)')}
                  onMouseLeave={(e) => !userMenuOpen && (e.currentTarget.style.background = 'transparent')}
                  aria-label="User menu"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--secondary))' }}
                  >
                    {initials(user.name)}
                  </div>
                  <span className="text-[13px] font-medium max-w-[120px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      {/* Backdrop */}
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden z-20"
                        style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))', boxShadow: '0 8px 24px hsl(var(--foreground) / 0.10)' }}
                      >
                        {/* User info */}
                        <div className="px-4 py-3" style={{ borderBottom: '0.5px solid hsl(var(--border))' }}>
                          <div className="text-[13px] font-semibold" style={{ color: 'hsl(var(--foreground))' }}>{user.name}</div>
                          <div className="text-[11px] truncate mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>{user.email}</div>
                          <div
                            className="text-[10px] font-semibold mt-1.5 px-1.5 py-0.5 rounded-full w-fit"
                            style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}
                          >
                            {user.role === 'officer' ? 'Club Officer' : 'Member'}
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="py-1">
                          <Link
                            to={user.role === 'officer' ? '/officer' : '/dashboard'}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors duration-100"
                            style={{ color: 'hsl(var(--foreground))' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            {user.role === 'officer' ? <LayoutDashboard size={14} /> : <User size={14} />}
                            {user.role === 'officer' ? 'Club dashboard' : 'My dashboard'}
                          </Link>
                          <Link
                            to="/bentley/discover"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors duration-100"
                            style={{ color: 'hsl(var(--foreground))' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <LayoutDashboard size={14} />
                            Discover clubs
                          </Link>
                        </div>

                        <div style={{ borderTop: '0.5px solid hsl(var(--border))' }} className="py-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] transition-colors duration-100"
                            style={{ color: 'hsl(var(--destructive))' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'hsl(var(--muted))')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <LogOut size={14} />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : !isUniversitySelector ? (
              /* ── Guest: Sign in + Get started ── */
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all duration-150"
                  style={{ color: textMuted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = textFull)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = textMuted)}
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 active:scale-95"
                  style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--secondary-foreground))' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Get started
                </Link>
              </>
            ) : null}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 transition-colors"
            style={{ color: textFull }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{ background: 'hsl(var(--secondary))', borderTop: `0.5px solid ${dividerColor}` }}
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-[14px] font-medium py-1"
                    style={{ color: textMuted }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="text-[14px] font-medium py-1"
                    style={{ color: textMuted }}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}

              <div className="flex gap-2 pt-2 border-t" style={{ borderColor: dividerColor }}>
                {!isUniversitySelector && isSignedIn && user ? (
                  <>
                    <Link
                      to={user.role === 'officer' ? '/officer' : '/dashboard'}
                      className="flex-1 py-2 rounded-lg text-[13px] font-medium text-center"
                      style={{ background: 'hsl(var(--secondary-foreground) / 0.10)', color: 'hsl(var(--secondary-foreground))' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      {user.role === 'officer' ? 'Club dashboard' : 'Dashboard'}
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex-1 py-2 rounded-lg text-[13px] font-medium text-center"
                      style={{ background: 'hsl(var(--secondary-foreground) / 0.10)', color: 'hsl(var(--secondary-foreground))' }}
                    >
                      Sign out
                    </button>
                  </>
                ) : !isUniversitySelector ? (
                  <>
                    <Link
                      to="/login"
                      className="flex-1 py-2 rounded-lg text-[13px] font-medium text-center"
                      style={{ background: 'hsl(var(--secondary-foreground) / 0.10)', color: 'hsl(var(--secondary-foreground))' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-center"
                      style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--secondary-foreground))' }}
                      onClick={() => setMenuOpen(false)}
                    >
                      Get started
                    </Link>
                  </>
                ) : null}
                <button
                  onClick={toggleTheme}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to night mode'}
                  className="w-10 flex items-center justify-center rounded-lg"
                  style={{ background: 'hsl(var(--secondary-foreground) / 0.10)', color: 'hsl(var(--secondary-foreground))' }}
                >
                  {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </div>

              {/* Signed-in user info on mobile */}
              {isSignedIn && user && (
                <div className="pt-1 pb-1 text-[12px]" style={{ color: 'hsl(var(--secondary-foreground) / 0.50)' }}>
                  Signed in as {user.email}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
