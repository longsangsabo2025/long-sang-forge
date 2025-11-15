import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Zap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const isDev = import.meta.env.DEV;

export function LoginModal({ open, onOpenChange, onSuccess }: LoginModalProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [authMethod, setAuthMethod] = useState<'magiclink' | 'password'>(isDev ? 'password' : 'magiclink');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMethod === 'password') {
        // Password-based authentication (dev mode)
        if (mode === 'signin') {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          toast.success('Welcome back!', {
            description: 'You have successfully signed in.',
          });
          
          onOpenChange(false);
          onSuccess?.();
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
            },
          });

          if (error) throw error;

          toast.success('Account created!', {
            description: 'You can now sign in with your credentials.',
          });
          
          setMode('signin');
        }
      } else {
        // Magic link authentication
        if (mode === 'signin') {
          const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: window.location.origin,
            },
          });

          if (error) throw error;

          toast.success('Check your email!', {
            description: 'We sent you a magic link to sign in.',
          });
          
          setEmail('');
          onOpenChange(false);
        } else {
          const { error } = await supabase.auth.signUp({
            email,
            password: 'magic-link-signup', // Required by Supabase but not used for OTP
            options: {
              emailRedirectTo: window.location.origin,
            },
          });

          if (error) throw error;

          toast.success('Check your email!', {
            description: 'We sent you a confirmation link.',
          });
          
          setEmail('');
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      toast.error('Authentication failed', {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async () => {
    setLoading(true);
    try {
      // Use real Supabase auth in dev mode
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@test.com',
        password: 'admin123',
      });

      if (error) {
        // Try to sign up first if user doesn't exist
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'admin@test.com',
          password: 'admin123',
          options: {
            data: {
              full_name: 'Test Admin',
              role: 'admin',
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        // Try sign in again after signup
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: 'admin@test.com',
          password: 'admin123',
        });

        if (retryError) {
          throw retryError;
        }
      }

      toast.success('Quick login successful!', {
        description: 'Logged in as admin@test.com',
      });
      
      onOpenChange(false);
      onSuccess?.();
      
      // Reload to update UI
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      toast.error('Quick login failed', {
        description: 'Visit /dev-setup to create admin account',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === 'signin' ? 'Sign in to your account' : 'Create an account'}
          </DialogTitle>
          <DialogDescription>
            {authMethod === 'password' 
              ? 'Enter your email and password'
              : mode === 'signin' 
                ? 'Enter your email to receive a magic link'
                : 'Sign up to access the automation dashboard'}
          </DialogDescription>
        </DialogHeader>

        {/* Quick Login Button (Dev Mode Only) */}
        {isDev && (
          <>
            <Button
              type="button"
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Zap className="mr-2 h-4 w-4" />
              Quick Login as Admin (Dev)
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {authMethod === 'password' && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {authMethod === 'password' ? 'Signing in...' : 'Sending magic link...'}
              </>
            ) : (
              <>
                {authMethod === 'password' ? (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    {mode === 'signin' ? 'Sign in' : 'Sign up'}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {mode === 'signin' ? 'Send magic link' : 'Sign up with email'}
                  </>
                )}
              </>
            )}
          </Button>

          <div className="space-y-2">
            <div className="text-center text-sm">
              {mode === 'signin' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-primary hover:underline"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-primary hover:underline"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>

            {isDev && (
              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => setAuthMethod(authMethod === 'password' ? 'magiclink' : 'password')}
                  className="text-muted-foreground hover:text-primary hover:underline"
                >
                  {authMethod === 'password' ? 'Use magic link instead' : 'Use password instead'}
                </button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
