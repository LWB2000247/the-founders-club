import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import { MapPin, Calendar, Users } from 'lucide-react'
import { toast } from 'sonner'
import type { Database } from '@/integrations/supabase/types'

export const Route = createFileRoute('/_authenticated/events')({
  component: EventsPage,
})

type Event = Database['public']['Tables']['events']['Row']

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [rsvps, setRsvps] = useState<Set<string>>(new Set())
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({})
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [eventsRes, rsvpsRes] = await Promise.all([
        supabase.from('events').select('*').order('starts_at', { ascending: true }),
        supabase.from('event_rsvps').select('event_id').eq('user_id', user.id),
      ])

      setEvents(eventsRes.data ?? [])
      setRsvps(new Set(rsvpsRes.data?.map((r) => r.event_id) ?? []))

      // Fetch counts
      const ids = eventsRes.data?.map((e) => e.id) ?? []
      if (ids.length) {
        const counts: Record<string, number> = {}
        await Promise.all(
          ids.map(async (id) => {
            const { count } = await supabase
              .from('event_rsvps')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', id)
            counts[id] = count ?? 0
          })
        )
        setRsvpCounts(counts)
      }
      setLoading(false)
    }
    load()
  }, [])

  const toggleRsvp = async (eventId: string) => {
    if (!userId) return
    if (rsvps.has(eventId)) {
      await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('user_id', userId)
      setRsvps((prev) => { const s = new Set(prev); s.delete(eventId); return s })
      setRsvpCounts((prev) => ({ ...prev, [eventId]: (prev[eventId] ?? 1) - 1 }))
      toast.info('RSVP cancelled')
    } else {
      const { error } = await supabase.from('event_rsvps').insert({ event_id: eventId, user_id: userId })
      if (error) { toast.error('Failed to RSVP'); return }
      setRsvps((prev) => new Set([...prev, eventId]))
      setRsvpCounts((prev) => ({ ...prev, [eventId]: (prev[eventId] ?? 0) + 1 }))
      toast.success("You're going! 🎉")
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">Loading…</div>

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Upcoming Events</h1>

      {events.length === 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-12 text-center text-[var(--color-text-muted)]">
          No events scheduled yet. Check back soon!
        </div>
      )}

      <div className="flex flex-col gap-4">
        {events.map((event) => {
          const going = rsvps.has(event.id)
          const count = rsvpCounts[event.id] ?? 0
          const full = event.capacity !== null && count >= event.capacity && !going

          return (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{event.title}</CardTitle>
                    {event.description && (
                      <CardDescription className="mt-1">{event.description}</CardDescription>
                    )}
                  </div>
                  {going && <Badge variant="success">Going</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-wrap gap-4 text-sm text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />{formatDate(event.starts_at)}
                  </span>
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} />{event.location}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users size={14} />{count} going
                    {event.capacity && ` / ${event.capacity} capacity`}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant={going ? 'outline' : 'default'}
                  onClick={() => toggleRsvp(event.id)}
                  disabled={full}
                >
                  {going ? 'Cancel RSVP' : full ? 'Sold out' : 'RSVP'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
