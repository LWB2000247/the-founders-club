import { Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { isAdmin, signOut } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) isAdmin(data.user.id).then(setAdmin)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) isAdmin(session.user.id).then(setAdmin)
      else setAdmin(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }

  const navLinkClass =
    'text-xs font-bold uppercase tracking-widest text-[var(--color-text-inverse)]/70 transition-colors hover:text-[var(--color-gold)]'

  return (
    <nav className="sticky top-0 z-40 w-full border-b-2 border-[var(--color-bg-inverse)] bg-[var(--color-bg-inverse)] text-[var(--color-text-inverse)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="text-lg font-black uppercase tracking-tight">
          Founders<span className="text-[var(--color-gold)]">.Club</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-7 sm:flex">
          {user ? (
            <>
              <Link to="/events" className={navLinkClass}>Events</Link>
              <Link to="/chat" className={navLinkClass}>Chat</Link>
              <Link to="/dashboard" className={navLinkClass}>Dashboard</Link>
              {admin && (
                <Link to="/admin" className={`${navLinkClass} !text-[var(--color-gold)]`}>Admin</Link>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="border-[var(--color-text-inverse)] text-[var(--color-text-inverse)] hover:bg-[var(--color-text-inverse)] hover:text-[var(--color-bg-inverse)]"
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/book-call" className={navLinkClass}>Book a call</Link>
              <Link to="/auth">
                <Button size="sm">Join free</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="block sm:hidden text-[var(--color-text-inverse)]"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t-2 border-[var(--color-text-inverse)]/20 bg-[var(--color-bg-inverse)] px-4 py-4 sm:hidden flex flex-col gap-4">
          {user ? (
            <>
              <Link to="/events" className={navLinkClass} onClick={() => setMenuOpen(false)}>Events</Link>
              <Link to="/chat" className={navLinkClass} onClick={() => setMenuOpen(false)}>Chat</Link>
              <Link to="/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {admin && (
                <Link to="/admin" className={`${navLinkClass} !text-[var(--color-gold)]`} onClick={() => setMenuOpen(false)}>Admin</Link>
              )}
              <Button
                variant="outline"
                className="w-full border-[var(--color-text-inverse)] text-[var(--color-text-inverse)] hover:bg-[var(--color-text-inverse)] hover:text-[var(--color-bg-inverse)]"
                onClick={() => { handleSignOut(); setMenuOpen(false) }}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/book-call" className={navLinkClass} onClick={() => setMenuOpen(false)}>Book a call</Link>
              <Link to="/auth" onClick={() => setMenuOpen(false)}>
                <Button className="w-full">Join free</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
