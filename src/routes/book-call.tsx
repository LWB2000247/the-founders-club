import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'

export const Route = createFileRoute('/book-call')({
  component: BookCallPage,
})

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  email: z.email('Invalid email'),
  topic: z.string().min(10, 'Please describe your topic (min 10 chars)'),
})

type FormData = z.infer<typeof schema>

function BookCallPage() {
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', data.user.id)
          .single()
          .then(({ data: p }) => {
            if (p?.full_name) setValue('name', p.full_name)
            if (p?.email) setValue('email', p.email)
          })
      }
    })
  }, [setValue])

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from('consulting_bookings').insert({
      name: data.name,
      email: data.email,
      topic: data.topic,
    })
    if (error) {
      toast.error('Something went wrong. Please try again.')
    } else {
      toast.success("Booking submitted! We'll be in touch.")
      reset()
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-lg items-center justify-center px-4 py-12">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Book a 1:1 call</CardTitle>
          <CardDescription>
            Tell us what you'd like to work on and we'll schedule a call.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSubmitSuccessful ? (
            <div className="py-8 text-center">
              <div className="mb-3 text-4xl">✅</div>
              <p className="font-medium">Booking submitted!</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">We'll reach out within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" placeholder="Jane Smith" {...register('name')} />
                {errors.name && <p className="text-xs text-[var(--color-error)]">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email address</Label>
                <Input id="email" type="email" placeholder="jane@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-[var(--color-error)]">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="topic">What do you want to discuss?</Label>
                <Textarea
                  id="topic"
                  placeholder="e.g. Growth strategy, fundraising, product-market fit…"
                  className="min-h-[120px]"
                  {...register('topic')}
                />
                {errors.topic && <p className="text-xs text-[var(--color-error)]">{errors.topic.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Book call'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
