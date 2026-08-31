import { Link } from 'react-router';

export default function Footer() {
  return (
    <footer style={{ background: 'hsl(var(--primary))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <img
              src="/airo-assets/images/logo/horizontal/dark"
              alt="Campus Commons"
              className="block h-auto max-h-8 w-auto object-contain self-start"
            />
            <p className="text-sm max-w-xs" style={{ color: 'hsl(var(--primary-foreground) / 0.60)' }}>
              The campus platform built for students who actually show up.
            </p>
            <span
              className="inline-block text-xs font-medium px-2.5 py-1 rounded-full w-fit"
              style={{ background: 'hsl(var(--accent) / 0.20)', color: 'hsl(var(--accent))' }}
            >
              Powered for Bentley University
            </span>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer links" className="flex flex-col sm:flex-row gap-6 sm:gap-12">
            <div className="flex flex-col gap-2">
              <span
                className="text-xs font-semibold mb-1"
                style={{ color: 'hsl(var(--primary-foreground) / 0.40)', letterSpacing: '0.08em' }}
              >
                Platform
              </span>
              <Link
                to="/bentley/discover"
                className="text-sm transition-colors duration-150"
                style={{ color: 'hsl(var(--primary-foreground) / 0.70)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground) / 0.70)')}
              >
                Explore Clubs
              </Link>
              <Link
                to="/bentley/discover/events"
                className="text-sm transition-colors duration-150"
                style={{ color: 'hsl(var(--primary-foreground) / 0.70)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground) / 0.70)')}
              >
                Events
              </Link>
              <Link
                to="/about"
                className="text-sm transition-colors duration-150"
                style={{ color: 'hsl(var(--primary-foreground) / 0.70)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground) / 0.70)')}
              >
                About
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span
                className="text-xs font-semibold mb-1"
                style={{ color: 'hsl(var(--primary-foreground) / 0.40)', letterSpacing: '0.08em' }}
              >
                For
              </span>
              <Link
                to="/signup"
                className="text-sm transition-colors duration-150"
                style={{ color: 'hsl(var(--primary-foreground) / 0.70)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground) / 0.70)')}
              >
                Students
              </Link>
              <Link
                to="/signup"
                className="text-sm transition-colors duration-150"
                style={{ color: 'hsl(var(--primary-foreground) / 0.70)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground) / 0.70)')}
              >
                Club Officers
              </Link>
              <Link
                to="/about"
                className="text-sm transition-colors duration-150"
                style={{ color: 'hsl(var(--primary-foreground) / 0.70)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground) / 0.70)')}
              >
                University Staff
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span
                className="text-xs font-semibold mb-1"
                style={{ color: 'hsl(var(--primary-foreground) / 0.40)', letterSpacing: '0.08em' }}
              >
                Legal
              </span>
              <Link
                to="/terms"
                className="text-sm transition-colors duration-150"
                style={{ color: 'hsl(var(--primary-foreground) / 0.70)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground) / 0.70)')}
              >
                Terms of Use
              </Link>
              <Link
                to="/privacy"
                className="text-sm transition-colors duration-150"
                style={{ color: 'hsl(var(--primary-foreground) / 0.70)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground))')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'hsl(var(--primary-foreground) / 0.70)')}
              >
                Privacy Policy
              </Link>
            </div>
          </nav>
        </div>

        <div
          className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: '0.5px solid hsl(var(--primary-foreground) / 0.10)' }}
        >
          <p className="text-xs" style={{ color: 'hsl(var(--primary-foreground) / 0.40)' }}>
            © {new Date().getFullYear()} Campus Commons. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ background: 'hsl(var(--accent))' }}
            />
            <span className="text-xs" style={{ color: 'hsl(var(--primary-foreground) / 0.40)' }}>
              Bentley University pilot · Aug 31 – Dec 15, 2026
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
