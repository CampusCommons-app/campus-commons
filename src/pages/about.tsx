import { about } from 'virtual:content';
import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { CheckCircle2, ArrowRight, Users, Calendar, TrendingUp, Building2, Send } from 'lucide-react';

const FEATURES = [
  { icon: <Users size={18} />, title: 'Club discovery', desc: 'Students browse every club on campus, filter by category, and follow the ones that match their interests.' },
  { icon: <Calendar size={18} />, title: 'Event management', desc: 'Officers create events, generate QR check-in codes, and track attendance in real time.' },
  { icon: <TrendingUp size={18} />, title: 'Health scores', desc: 'Each club gets a transparent health score based on attendance, activity, and engagement — visible to university staff.' },
  { icon: <Building2 size={18} />, title: 'Dean dashboard', desc: 'University staff see cross-club analytics, identify at-risk clubs early, and make data-driven funding decisions.' },
];

export default function AboutPage() {
  const [form, setForm] = useState({ name: '', email: '', university: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <Helmet>
        <title>About Campus Commons — The Club Management Platform for Universities</title>
        <meta name="description" content="Campus Commons helps universities manage student clubs, track engagement, and give students a better way to find their community on campus." />
        <link rel="canonical" href="https://campuscommons.app/about" />
        <meta property="og:title" content="About Campus Commons" />
        <meta property="og:description" content="The club management platform built for universities." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://campuscommons.app/about" />
      </Helmet>

      <main>
        {/* Hero */}
        <section
          className="pt-32 pb-20 px-4 sm:px-6 text-center"
          style={{ background: 'hsl(var(--secondary))' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto"
          >
            <div
              className="inline-block text-[11px] font-semibold px-3 py-1 rounded-full mb-6"
              style={{ background: 'hsl(var(--accent) / 0.15)', color: 'hsl(var(--accent))' }}
            >
              Bentley University pilot · Fall 2026
            </div>
            <h1 className="text-[36px] sm:text-[44px] font-bold leading-tight mb-5 text-white">
              The campus platform built for students who actually show up.
            </h1>
            <p className="text-[16px] leading-relaxed mb-8" style={{ color: 'hsl(var(--secondary-foreground) / 0.70)' }}>
              Campus Commons gives every student a better way to find their community — and gives universities the data they need to support it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/bentley/discover"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-semibold transition-all duration-150 active:scale-[0.98]"
                style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--secondary))' }}
              >
                Explore clubs <ArrowRight size={14} />
              </Link>
              <a
                href="#contact"
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[14px] font-medium transition-all duration-150"
                style={{ background: 'hsl(var(--secondary-foreground) / 0.10)', color: 'hsl(var(--secondary-foreground))' }}
              >
                Bring it to your university
              </a>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 sm:px-6" style={{ background: 'hsl(var(--background))' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[24px] font-bold text-center mb-10" style={{ color: 'hsl(var(--foreground))' }}>
              Everything a campus needs in one place
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="p-5 rounded-2xl"
                  style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}
                  >
                    {f.icon}
                  </div>
                  <h3 className="text-[15px] font-semibold mb-1.5" style={{ color: 'hsl(var(--foreground))' }}>{f.title}</h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles */}
        <section className="py-16 px-4 sm:px-6" style={{ background: 'hsl(var(--muted))' }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-[24px] font-bold text-center mb-10" style={{ color: 'hsl(var(--foreground))' }}>
              Built for everyone on campus
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {about.ROLES.map((r, i) => (
                <motion.div
                  key={r.label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className="p-5 rounded-2xl"
                  style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
                >
                  <h3 className="text-[15px] font-semibold mb-3" style={{ color: 'hsl(var(--foreground))' }}>{r.label}</h3>
                  <div className="flex flex-col gap-2">
                    {r.points.map((p) => (
                      <div key={p} className="flex items-start gap-2">
                        <CheckCircle2 size={13} className="shrink-0 mt-0.5" style={{ color: 'hsl(var(--primary))' }} />
                        <span className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact form */}
        <section id="contact" className="py-16 px-4 sm:px-6" style={{ background: 'hsl(var(--background))' }}>
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-[24px] font-bold mb-3" style={{ color: 'hsl(var(--foreground))' }}>
                Bring Campus Commons to your university
              </h2>
              <p className="text-[14px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                We're expanding beyond Bentley in 2027. Fill out the form and we'll be in touch.
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 px-6 rounded-2xl"
                style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
              >
                <CheckCircle2 size={36} className="mx-auto mb-4" style={{ color: 'hsl(var(--primary))' }} />
                <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
                  Thanks, we'll be in touch!
                </h3>
                <p className="text-[13px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                  We'll reach out to {form.email} within a few business days.
                </p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 p-6 rounded-2xl"
                style={{ background: 'hsl(var(--card))', border: '0.5px solid hsl(var(--border))' }}
              >
                {[
                  { id: 'name', label: 'Your name', type: 'text', placeholder: 'Alex Johnson', value: form.name, key: 'name' as const },
                  { id: 'email', label: 'Work email', type: 'email', placeholder: 'you@university.edu', value: form.email, key: 'email' as const },
                  { id: 'university', label: 'University', type: 'text', placeholder: 'e.g. Boston University', value: form.university, key: 'university' as const },
                ].map((field) => (
                  <div key={field.id} className="flex flex-col gap-1.5">
                    <label htmlFor={field.id} className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                      {field.label}
                    </label>
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      value={field.value}
                      onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                      required
                      className="w-full px-3.5 py-2.5 text-[14px] rounded-lg outline-none transition-all duration-150"
                      style={{ background: 'hsl(var(--background))', border: '0.5px solid hsl(var(--border))', color: 'hsl(var(--foreground))', fontFamily: 'inherit' }}
                      onFocus={(e) => (e.target.style.borderColor = 'hsl(var(--primary))')}
                      onBlur={(e) => (e.target.style.borderColor = 'hsl(var(--border))')}
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message" className="text-[13px] font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                    Anything you'd like us to know?
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    placeholder="Number of clubs, current pain points, timeline…"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full px-3.5 py-2.5 text-[14px] rounded-lg outline-none transition-all duration-150 resize-none"
                    style={{ background: 'hsl(var(--background))', border: '0.5px solid hsl(var(--border))', color: 'hsl(var(--foreground))', fontFamily: 'inherit' }}
                    onFocus={(e) => (e.target.style.borderColor = 'hsl(var(--primary))')}
                    onBlur={(e) => (e.target.style.borderColor = 'hsl(var(--border))')}
                  />
                </div>

                <button
                  type="submit"
                  className="mt-1 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[14px] font-semibold transition-all duration-150 active:scale-[0.98]"
                  style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
                >
                  <Send size={14} /> Send message
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
