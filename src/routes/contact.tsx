import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Phone, Mail } from 'lucide-react'

export const Route = createFileRoute('/contact')({
  component: ContactPage,
})

const PHONE = '+351 965 272 058'
const PHONE_HREF = '+351965272058'
const EMAIL = 'Leon@Baldridge.info'

function ContactPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-lg items-center justify-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Get in touch</CardTitle>
          <CardDescription>
            Reach out directly — no forms, no waiting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <a
            href={`tel:${PHONE_HREF}`}
            className="flex items-center gap-4 border-2 border-[var(--color-border)] px-4 py-4 transition-colors hover:bg-[var(--color-bg-muted)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[var(--color-border)] bg-[var(--color-gold)] text-black">
              <Phone size={18} />
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-subtle)]">Phone</span>
              <span className="block text-lg font-semibold">{PHONE}</span>
            </span>
          </a>

          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center gap-4 border-2 border-[var(--color-border)] px-4 py-4 transition-colors hover:bg-[var(--color-bg-muted)]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-[var(--color-border)] bg-[var(--color-gold)] text-black">
              <Mail size={18} />
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-widest text-[var(--color-text-subtle)]">Email</span>
              <span className="block text-lg font-semibold">{EMAIL}</span>
            </span>
          </a>
        </CardContent>
      </Card>
    </div>
  )
}
