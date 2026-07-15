import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

const stats = [
  { value: '$0', label: 'Membership fee — forever' },
  { value: '4+', label: 'Channels to start networking in' },
  { value: '1:1', label: 'Calls with the team, on request' },
]

const reasons = [
  {
    n: '01',
    title: 'Free to join',
    desc: 'No subscriptions, no hidden fees, no "premium tier." Founders.Club is free forever for every member.',
  },
  {
    n: '02',
    title: 'Private channels',
    desc: 'A members-only space split into topic channels — intros, marketing, tech, and more — to discuss ideas, share wins, and find collaborators.',
  },
  {
    n: '03',
    title: 'In-person events',
    desc: 'Once the room fills up, we organize meetups and events for members to trade war stories offline.',
  },
]

function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b-2 border-[var(--color-border)] px-4 pt-16 pb-14 sm:px-6 sm:pt-24 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-[var(--color-gold)]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              Est. 2026 — membership is free
            </span>
          </div>

          <h1 className="text-6xl font-black uppercase leading-[0.95] tracking-tight sm:text-8xl">
            The club
            <br />
            for people who
            <br />
            <span className="text-[var(--color-gold)]">build.</span>
          </h1>

          <p className="mt-8 max-w-lg text-lg text-[var(--color-text-muted)]">
            A private community of founders, makers, and entrepreneurs. Connect,
            share, and grow together — no dues, ever.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">Join the club</Button>
            </Link>
            <Link to="/book-call">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Book a call</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stat grid */}
      <section className="grid grid-cols-1 border-b-2 border-[var(--color-border)] sm:grid-cols-3">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`px-6 py-10 sm:px-8 ${
              i > 0 ? 'border-t-2 sm:border-t-0 sm:border-l-2 border-[var(--color-border)]' : ''
            }`}
          >
            <div className="text-5xl font-black tracking-tight text-[var(--color-gold)] sm:text-6xl">
              {s.value}
            </div>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              {s.label}
            </p>
          </div>
        ))}
      </section>

      {/* Reasons / manifesto list */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
        <h2 className="mb-10 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-subtle)]">
          Why join
        </h2>

        <div className="border-t-2 border-[var(--color-border)]">
          {reasons.map((r) => (
            <div
              key={r.n}
              className="grid grid-cols-1 gap-3 border-b-2 border-[var(--color-border)] py-8 sm:grid-cols-12 sm:gap-6"
            >
              <div className="sm:col-span-2">
                <span className="text-sm font-bold text-[var(--color-text-subtle)]">{r.n}</span>
              </div>
              <div className="sm:col-span-4">
                <h3 className="text-2xl font-black uppercase tracking-tight">{r.title}</h3>
              </div>
              <div className="sm:col-span-6">
                <p className="text-[var(--color-text-muted)]">{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA band */}
      <section className="border-t-2 border-[var(--color-border)] bg-[var(--color-bg-inverse)] px-4 py-16 text-[var(--color-text-inverse)] sm:px-6 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
          <h2 className="text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl">
            Join free.
            <br />
            No catch.
          </h2>
          <Link to="/auth">
            <Button size="lg" className="w-full sm:w-auto">Create your account</Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
