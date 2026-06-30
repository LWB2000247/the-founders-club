import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'

export const Route = createFileRoute('/auth')({
  component: AuthPage,
})

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name required'),
  company: z.string().min(1, 'Company / venture required'),
  whatTheyDo: z.string().min(2, 'Required'),
  email: z.email('Invalid email'),
  password: z.string().min(6, 'Minimum 6 characters'),
})

const signinSchema = z.object({
  email: z.email('Invalid email'),
  password: z.string().min(1, 'Required'),
})

type SignupForm = z.infer<typeof signupSchema>
type SigninForm = z.infer<typeof signinSchema>

function AuthPage() {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const signupForm = useForm<SignupForm>({ resolver: zodResolver(signupSchema) })
  const signinForm = useForm<SigninForm>({ resolver: zodResolver(signinSchema) })

  const handleSignup = async (data: SignupForm) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          company_name: data.company,
          what_they_do: data.whatTheyDo,
        },
      },
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome to Founders.Club!')
      navigate({ to: '/dashboard' })
    }
  }

  const handleSignin = async (data: SigninForm) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      navigate({ to: '/dashboard' })
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md items-center justify-center px-4 py-12">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {mode === 'signup' ? 'Join Founders' : 'Welcome back'}
            <span className="text-[var(--color-gold)]">.Club</span>
          </CardTitle>
          <CardDescription>
            {mode === 'signup'
              ? 'Free forever — create your account'
              : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {mode === 'signup' ? (
            <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="fullName">Full name</Label>
                <Input id="fullName" placeholder="Jane Smith" {...signupForm.register('fullName')} />
                {signupForm.formState.errors.fullName && (
                  <p className="text-xs text-[var(--color-error)]">{signupForm.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="company">Company / venture</Label>
                <Input id="company" placeholder="Acme Inc." {...signupForm.register('company')} />
                {signupForm.formState.errors.company && (
                  <p className="text-xs text-[var(--color-error)]">{signupForm.formState.errors.company.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="whatTheyDo">What you do</Label>
                <Input id="whatTheyDo" placeholder="SaaS founder, indie hacker, VC..." {...signupForm.register('whatTheyDo')} />
                {signupForm.formState.errors.whatTheyDo && (
                  <p className="text-xs text-[var(--color-error)]">{signupForm.formState.errors.whatTheyDo.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="jane@example.com" {...signupForm.register('email')} />
                {signupForm.formState.errors.email && (
                  <p className="text-xs text-[var(--color-error)]">{signupForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Min 6 characters" {...signupForm.register('password')} />
                {signupForm.formState.errors.password && (
                  <p className="text-xs text-[var(--color-error)]">{signupForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>
          ) : (
            <form onSubmit={signinForm.handleSubmit(handleSignin)} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email2">Email</Label>
                <Input id="email2" type="email" placeholder="jane@example.com" {...signinForm.register('email')} />
                {signinForm.formState.errors.email && (
                  <p className="text-xs text-[var(--color-error)]">{signinForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password2">Password</Label>
                <Input id="password2" type="password" placeholder="Your password" {...signinForm.register('password')} />
                {signinForm.formState.errors.password && (
                  <p className="text-xs text-[var(--color-error)]">{signinForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>
          )}

          <div className="mt-4 text-center text-sm">
            {mode === 'signup' ? (
              <span className="text-[var(--color-text-muted)]">
                Already a member?{' '}
                <button
                  type="button"
                  className="text-[var(--color-gold)] hover:underline font-medium"
                  onClick={() => setMode('signin')}
                >
                  Sign in
                </button>
              </span>
            ) : (
              <span className="text-[var(--color-text-muted)]">
                Not a member?{' '}
                <button
                  type="button"
                  className="text-[var(--color-gold)] hover:underline font-medium"
                  onClick={() => setMode('signup')}
                >
                  Join free
                </button>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
