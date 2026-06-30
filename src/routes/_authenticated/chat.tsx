import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Send, Trash2, Hash, MessageSquarePlus, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import type { Database } from '@/integrations/supabase/types'

export const Route = createFileRoute('/_authenticated/chat')({
  component: ChatPage,
})

type Channel = Database['public']['Tables']['channels']['Row']
type Message = Database['public']['Tables']['messages']['Row']

function ChatPage() {
  const [channels, setChannels] = useState<Channel[]>([])
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [loadingMsgs, setLoadingMsgs] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Suggestion dialog state
  const [suggOpen, setSuggOpen] = useState(false)
  const [suggKind, setSuggKind] = useState<'change' | 'channel'>('change')
  const [suggTitle, setSuggTitle] = useState('')
  const [suggDetails, setSuggDetails] = useState('')
  const [suggLoading, setSuggLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null))
    supabase.from('channels').select('*').order('name').then(({ data }) => {
      setChannels(data ?? [])
      if (data && data.length > 0) setActiveChannel(data[0].id)
    })
  }, [])

  useEffect(() => {
    if (!activeChannel) return
    setLoadingMsgs(true)

    supabase
      .from('messages')
      .select('*, profiles(full_name, company_name)')
      .eq('channel_id', activeChannel)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        setMessages((data as Message[]) ?? [])
        setLoadingMsgs(false)
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
      })

    const sub = supabase
      .channel(`messages:${activeChannel}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel}` },
        async (payload) => {
          const newMsg = payload.new as Message
          // Fetch profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, company_name')
            .eq('id', newMsg.user_id)
            .single()
          const enriched = { ...newMsg, profiles: profile } as Message
          setMessages((prev) => [...prev, enriched])
          setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannel}` },
        (payload) => {
          setMessages((prev) => prev.filter((m) => m.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => { void supabase.removeChannel(sub) }
  }, [activeChannel])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !activeChannel || !userId) return
    setInput('')
    const { error } = await supabase.from('messages').insert({
      channel_id: activeChannel,
      user_id: userId,
      content: text,
    })
    if (error) toast.error('Failed to send message')
  }

  const deleteMessage = async (id: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', id)
    if (error) toast.error('Failed to delete message')
  }

  const submitSuggestion = async () => {
    if (!userId || !suggTitle.trim()) return
    setSuggLoading(true)
    const { error } = await supabase.from('suggestions').insert({
      user_id: userId,
      kind: suggKind,
      title: suggTitle,
      details: suggDetails || null,
    })
    setSuggLoading(false)
    if (error) {
      toast.error('Failed to submit suggestion')
    } else {
      toast.success('Suggestion submitted!')
      setSuggOpen(false)
      setSuggTitle('')
      setSuggDetails('')
      setSuggKind('change')
    }
  }

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <aside className="flex w-52 shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <div className="p-3 text-xs font-semibold uppercase tracking-widest text-[var(--color-text-subtle)]">
          Channels
        </div>
        <div className="flex-1 overflow-y-auto">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                activeChannel === ch.id
                  ? 'bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-medium'
                  : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-muted)]'
              }`}
            >
              <Hash size={14} />
              {ch.name}
            </button>
          ))}
        </div>

        {/* Suggestion buttons */}
        <div className="border-t border-[var(--color-border)] p-3 flex flex-col gap-2">
          <Dialog open={suggOpen} onOpenChange={setSuggOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
                <Lightbulb size={13} />Suggest a change
              </button>
            </DialogTrigger>
            <DialogTrigger asChild>
              <button
                onClick={() => setSuggKind('channel')}
                className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              >
                <MessageSquarePlus size={13} />Request channel
              </button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {suggKind === 'change' ? 'Suggest a change' : 'Request a channel'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={suggKind} onValueChange={(v) => setSuggKind(v as 'change' | 'channel')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="change">Suggest a change</SelectItem>
                      <SelectItem value="channel">Request a channel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input
                    placeholder={suggKind === 'channel' ? '#channel-name' : 'What would you like to change?'}
                    value={suggTitle}
                    onChange={(e) => setSuggTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Details (optional)</Label>
                  <Textarea
                    placeholder="Any additional context…"
                    value={suggDetails}
                    onChange={(e) => setSuggDetails(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={submitSuggestion} disabled={suggLoading || !suggTitle.trim()}>
                  {suggLoading ? 'Submitting…' : 'Submit'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      {/* Chat area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-[var(--color-border)] px-4 py-3">
          <span className="font-medium text-[var(--color-text-muted)]">
            #{channels.find((c) => c.id === activeChannel)?.name ?? 'general'}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {loadingMsgs ? (
            <div className="text-center text-sm text-[var(--color-text-muted)]">Loading…</div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-[var(--color-text-muted)]">
              No messages yet. Say hello!
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.user_id === userId
              const profile = (msg as any).profiles as { full_name: string | null; company_name: string | null } | null
              return (
                <div key={msg.id} className="group flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-gold)]/20 text-xs font-bold text-[var(--color-gold)]">
                    {(profile?.full_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{profile?.full_name ?? 'Member'}</span>
                      {profile?.company_name && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{profile.company_name}</Badge>
                      )}
                      <span className="text-[11px] text-[var(--color-text-subtle)]">{formatDate(msg.created_at)}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-[var(--color-text)]">{msg.content}</p>
                  </div>
                  {isOwn && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 text-[var(--color-text-subtle)] hover:text-[var(--color-error)] transition-all"
                      aria-label="Delete message"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[var(--color-border)] p-3">
          <div className="flex gap-2">
            <Input
              placeholder={`Message #${channels.find((c) => c.id === activeChannel)?.name ?? 'channel'}…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            />
            <Button onClick={sendMessage} size="icon" disabled={!input.trim()}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
