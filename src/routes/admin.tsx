import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { isAdmin } from '@/lib/auth'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, downloadCSV } from '@/lib/utils'
import { toast } from 'sonner'
import { Trash2, Download, Search } from 'lucide-react'
import type { Database } from '@/integrations/supabase/types'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession()
    if (!data.session) throw redirect({ to: '/auth' })
    const admin = await isAdmin(data.session.user.id)
    if (!admin) throw redirect({ to: '/dashboard' })
  },
  component: AdminPage,
})

type Profile = Database['public']['Tables']['profiles']['Row']
type Event = Database['public']['Tables']['events']['Row']
type Booking = Database['public']['Tables']['consulting_bookings']['Row']
type Suggestion = Database['public']['Tables']['suggestions']['Row']

/* ── Members Tab ── */
function MembersTab() {
  const [members, setMembers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setMembers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const deleteMember = async (id: string) => {
    if (!confirm('Delete this member? This cannot be undone.')) return
    const { error } = await supabase.from('profiles').delete().eq('id', id)
    if (error) { toast.error('Failed to delete'); return }
    setMembers((prev) => prev.filter((m) => m.id !== id))
    toast.success('Member deleted')
  }

  const filtered = members.filter((m) => {
    const q = search.toLowerCase()
    return (
      (m.full_name ?? '').toLowerCase().includes(q) ||
      (m.company_name ?? '').toLowerCase().includes(q) ||
      (m.what_they_do ?? '').toLowerCase().includes(q)
    )
  })

  const exportCSV = () => downloadCSV(filtered as unknown as Record<string, unknown>[], 'members.csv')

  if (loading) return <LoadingState />

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-subtle)]" />
          <Input
            placeholder="Search by name, company, industry…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download size={14} className="mr-1" />CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] text-left text-xs text-[var(--color-text-subtle)]">
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Company</th>
              <th className="px-4 py-2">What they do</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-muted)] transition-colors">
                <td className="px-4 py-2 font-medium">{m.full_name ?? '—'}</td>
                <td className="px-4 py-2 text-[var(--color-text-muted)]">{m.email ?? '—'}</td>
                <td className="px-4 py-2">{m.company_name ?? '—'}</td>
                <td className="px-4 py-2 text-[var(--color-text-muted)]">{m.what_they_do ?? '—'}</td>
                <td className="px-4 py-2 text-[var(--color-text-subtle)] whitespace-nowrap">{formatDate(m.created_at)}</td>
                <td className="px-4 py-2">
                  <button onClick={() => deleteMember(m.id)} className="text-[var(--color-text-subtle)] hover:text-[var(--color-error)] transition-colors">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No members found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Events Tab ── */
function EventsTab() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ title: '', description: '', location: '', capacity: '', starts_at: '' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const { data } = await supabase.from('events').select('*').order('starts_at', { ascending: true })
    setEvents(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const createEvent = async () => {
    if (!form.title || !form.starts_at) { toast.error('Title and date are required'); return }
    setSaving(true)
    const { error } = await supabase.from('events').insert({
      title: form.title,
      description: form.description || null,
      location: form.location || null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      starts_at: form.starts_at,
    })
    setSaving(false)
    if (error) { toast.error('Failed to create event'); return }
    toast.success('Event created!')
    setForm({ title: '', description: '', location: '', capacity: '', starts_at: '' })
    load()
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents((prev) => prev.filter((e) => e.id !== id))
    toast.success('Event deleted')
  }

  if (loading) return <LoadingState />

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4">
        <h3 className="mb-3 font-semibold">Create event</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <Input placeholder="Location" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          <Input placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Input placeholder="Capacity (optional)" type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} />
          <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))} className="col-span-full sm:col-span-1" />
          <Button onClick={createEvent} disabled={saving} className="sm:col-span-1">{saving ? 'Saving…' : 'Create'}</Button>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] text-left text-xs text-[var(--color-text-subtle)]">
              <th className="px-4 py-2">Title</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Capacity</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-muted)]">
                <td className="px-4 py-2 font-medium">{e.title}</td>
                <td className="px-4 py-2 text-[var(--color-text-muted)] whitespace-nowrap">{formatDate(e.starts_at)}</td>
                <td className="px-4 py-2">{e.location ?? '—'}</td>
                <td className="px-4 py-2">{e.capacity ?? '∞'}</td>
                <td className="px-4 py-2">
                  <button onClick={() => deleteEvent(e.id)} className="text-[var(--color-text-subtle)] hover:text-[var(--color-error)]">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {events.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No events yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ── Bookings Tab ── */
function BookingsTab() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('consulting_bookings').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setBookings(data ?? []); setLoading(false) })
  }, [])

  const updateStatus = async (id: string, status: Booking['status']) => {
    const { error } = await supabase.from('consulting_bookings').update({ status }).eq('id', id)
    if (error) { toast.error('Failed to update'); return }
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
    toast.success('Status updated')
  }

  const deleteBooking = async (id: string) => {
    await supabase.from('consulting_bookings').delete().eq('id', id)
    setBookings((prev) => prev.filter((b) => b.id !== id))
    toast.success('Booking deleted')
  }

  if (loading) return <LoadingState />

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] text-left text-xs text-[var(--color-text-subtle)]">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Topic</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-muted)]">
              <td className="px-4 py-2 font-medium">{b.name}</td>
              <td className="px-4 py-2 text-[var(--color-text-muted)]">{b.email}</td>
              <td className="px-4 py-2 max-w-[200px] truncate">{b.topic}</td>
              <td className="px-4 py-2">
                <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v as Booking['status'])}>
                  <SelectTrigger className="h-7 text-xs w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['pending', 'confirmed', 'done', 'rejected'] as const).map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-2 text-[var(--color-text-subtle)] whitespace-nowrap">{formatDate(b.created_at)}</td>
              <td className="px-4 py-2">
                <button onClick={() => deleteBooking(b.id)} className="text-[var(--color-text-subtle)] hover:text-[var(--color-error)]">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          {bookings.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No bookings yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/* ── Suggestions Tab ── */
function SuggestionsTab() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('suggestions').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setSuggestions(data ?? []); setLoading(false) })
  }, [])

  const updateStatus = async (id: string, status: Suggestion['status']) => {
    const { error } = await supabase.from('suggestions').update({ status }).eq('id', id)
    if (error) { toast.error('Failed to update'); return }
    setSuggestions((prev) => prev.map((s) => s.id === id ? { ...s, status } : s))
    toast.success('Status updated')
  }

  const deleteSuggestion = async (id: string) => {
    await supabase.from('suggestions').delete().eq('id', id)
    setSuggestions((prev) => prev.filter((s) => s.id !== id))
    toast.success('Deleted')
  }

  const kindColor = (kind: string) => kind === 'channel' ? 'secondary' : 'outline'

  if (loading) return <LoadingState />

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-muted)] text-left text-xs text-[var(--color-text-subtle)]">
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Title</th>
            <th className="px-4 py-2">Details</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {suggestions.map((s) => (
            <tr key={s.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-muted)]">
              <td className="px-4 py-2">
                <Badge variant={kindColor(s.kind) as 'secondary' | 'outline'}>{s.kind}</Badge>
              </td>
              <td className="px-4 py-2 font-medium">{s.title}</td>
              <td className="px-4 py-2 text-[var(--color-text-muted)] max-w-[200px] truncate">{s.details ?? '—'}</td>
              <td className="px-4 py-2">
                <Select value={s.status} onValueChange={(v) => updateStatus(s.id, v as Suggestion['status'])}>
                  <SelectTrigger className="h-7 text-xs w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['pending', 'reviewed', 'done', 'rejected'] as const).map((st) => (
                      <SelectItem key={st} value={st}>{st}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-2 text-[var(--color-text-subtle)] whitespace-nowrap">{formatDate(s.created_at)}</td>
              <td className="px-4 py-2">
                <button onClick={() => deleteSuggestion(s.id)} className="text-[var(--color-text-subtle)] hover:text-[var(--color-error)]">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          {suggestions.length === 0 && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-[var(--color-text-muted)]">No suggestions yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function LoadingState() {
  return <div className="flex h-40 items-center justify-center text-[var(--color-text-muted)]">Loading…</div>
}

function AdminPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Admin <span className="text-[var(--color-gold)]">Backoffice</span>
        </h1>
        <p className="text-sm text-[var(--color-text-muted)]">Manage members, events, bookings, and suggestions.</p>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="mb-6">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="members"><MembersTab /></TabsContent>
        <TabsContent value="events"><EventsTab /></TabsContent>
        <TabsContent value="bookings"><BookingsTab /></TabsContent>
        <TabsContent value="suggestions"><SuggestionsTab /></TabsContent>
      </Tabs>
    </div>
  )
}
