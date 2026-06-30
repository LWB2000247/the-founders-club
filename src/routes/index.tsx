import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Users, Lock, User } from 'lucide-react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.18) 0%, transparent 70%), var(--color-bg)',
          }}
        />

        {/* Hero image (abstract placeholder with SVG pattern) */}
        <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 sm:pt-32 sm:pb-24 text-center">
          <div className="mx-auto mb-8 max-w-3xl">
            <div
              className="mx-auto mb-10 h-56 sm:h-72 w-full max-w-2xl rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-2xl"
              aria-hidden="true"
              style={{
                background:
                  'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
              }}
            >
              <svg
                className="h-full w-full opacity-60"
                viewBox="0 0 800 288"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="xMidYMid slice"
              >
                <defs>
                  <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <rect width="800" height="288" fill="url(#glow)" />
                {/* Abstract network of entrepreneurs */}
                {[
                  [200, 100], [400, 60], [600, 110], [300, 180], [500, 200],
                  [150, 220], [650, 170], [400, 144],
                ].map(([cx, cy], i) => (
                  <g key={i}>
                    <circle cx={cx} cy={cy} r={i === 7 ? 22 : 16} fill="#f59e0b" fillOpacity={i === 7 ? 0.7 : 0.4} />
                    <circle cx={cx} cy={cy} r={i === 7 ? 8 : 6} fill="#f59e0b" fillOpacity={0.9} />
                  </g>
                ))}
                {/* Lines connecting nodes */}
                {[
                  [200, 100, 400, 60], [400, 60, 600, 110], [200, 100, 300, 180],
                  [400, 60, 400, 144], [600, 110, 500, 200], [300, 180, 500, 200],
                  [150, 220, 300, 180], [650, 170, 600, 110], [400, 144, 300, 180],
                  [400, 144, 500, 200],
                ].map(([x1, y1, x2, y2], i) => (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f59e0b" strokeOpacity="0.25" strokeWidth="1.5" />
                ))}
              </svg>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            The club for people who{' '}
            <span className="text-[var(--color-gold)]">build.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[var(--color-text-muted)]">
            A private community of founders, makers, and entrepreneurs. Connect,
            share, and grow together.
          </p>
          <p className="mt-2 text-sm font-medium text-[var(--color-text-subtle)]">
            Free forever · No payment required
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link to="/auth">
              <Button size="lg" className="min-w-[160px]">Join the club</Button>
            </Link>
            <Link to="/book-call">
              <Button size="lg" variant="outline" className="min-w-[160px]">Book a call</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Users,
              title: 'Free to join',
              desc: 'No subscriptions, no hidden fees. Founders.Club is free forever for all members.',
            },
            {
              icon: Lock,
              title: 'Private community',
              desc: 'A members-only space to discuss ideas, share wins, and collaborate in private channels.',
            },
            {
              icon: User,
              title: 'Own your profile',
              desc: 'Your profile belongs to you. Showcase your venture and connect with like-minded builders.',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 hover:border-[var(--color-gold)]/40 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-gold)]/10">
                <Icon className="h-5 w-5 text-[var(--color-gold)]" />
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-[var(--color-text-muted)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
