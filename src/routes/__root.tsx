import { createRootRoute, Outlet } from '@tanstack/react-router'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { CookieBanner } from '@/components/CookieBanner'
import { Toaster } from 'sonner'

export const Route = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <Toaster theme="dark" position="top-right" richColors />
    </div>
  ),
})
