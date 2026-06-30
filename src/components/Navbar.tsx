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

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Founders<span className="text-[var(--color-gold)]">.Club</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-2 sm:flex">
          {user ? (
            <>
              <Link to="/events">
                <Button variant="ghost" size="sm">Events</Button>
              </Link>
              <Link to="/chat">
                <Button variant="ghost" size="sm">Chat</Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              {admin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="text-[var(--color-gold)]">Admin</Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/book-call">
                <Button variant="outline" size="sm">Book a call</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm">Join free</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="block sm:hidden text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 sm:hidden flex flex-col gap-2">
          {user ? (
            <>
              <Link to="/events" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Events</Button>
              </Link>
              <Link to="/chat" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Chat</Button>
              </Link>
              <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
              </Link>
              {admin && (
                <Link to="/admin" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start text-[var(--color-gold)]">Admin</Button>
                </Link>
              )}
              <Button variant="outline" className="w-full" onClick={() => { handleSignOut(); setMenuOpen(false) }}>Sign out</Button>
            </>
          ) : (
            <>
              <Link to="/book-call" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="w-full">Book a call</Button>
              </Link>
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
