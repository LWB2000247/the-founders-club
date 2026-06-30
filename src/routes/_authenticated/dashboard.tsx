import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Database } from '@/integrations/supabase/types'

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
})

type Profile = Database['public']['Tables']['profiles']['Row']

const schema = z.object({
  full_name: z.string().min(2, 'Name required'),
  company_name: z.string().min(1, 'Required'),
  what_they_do: z.string().min(2, 'Required'),
})

type FormData = z.infer<typeof schema>

function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
        .then(({ data: p }) => {
          setProfile(p)
          if (p) {
            reset({
              full_name: p.full_name ?? '',
              company_name: p.company_name ?? '',
              what_they_do: p.what_they_do ?? '',
            })
          }
          setLoading(false)
        })
    })
  }, [reset])

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id)
    setSaving(false)
    if (error) {
      toast.error('Failed to save profile')
    } else {
      toast.success('Profile updated!')
      setProfile((prev) => prev ? { ...prev, ...data } : prev)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center text-[var(--color-text-muted)]">Loading…</div>

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-sm text-[var(--color-text-muted)]">{profile?.email}</p>
        </div>
        <Badge variant="secondary" className="ml-auto">Member</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Edit profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label>Full name</Label>
              <Input {...register('full_name')} />
              {errors.full_name && <p className="text-xs text-[var(--color-error)]">{errors.full_name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Company / venture</Label>
              <Input {...register('company_name')} />
              {errors.company_name && <p className="text-xs text-[var(--color-error)]">{errors.company_name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>What you do</Label>
              <Input {...register('what_they_do')} placeholder="SaaS founder, designer…" />
              {errors.what_they_do && <p className="text-xs text-[var(--color-error)]">{errors.what_they_do.message}</p>}
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
