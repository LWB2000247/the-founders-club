import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const choice = localStorage.getItem('cookie-consent')
    if (!choice) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const reject = () => {
    localStorage.setItem('cookie-consent', 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-4">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">
          We use cookies to improve your experience. By using Founders.Club you agree to our use of essential cookies.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={reject}>Reject optional</Button>
          <Button size="sm" onClick={accept}>Accept all</Button>
        </div>
      </div>
    </div>
  )
}
