import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Button, Input, Alert } from '../components/ui'

// Check if Supabase is configured
const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

export default function Auth() {
  const [mode, setMode] = useState('login') // 'login', 'signup', 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { login, register, forgotPassword, loading } = useAuth()
  const navigate = useNavigate()

  // Allow bypassing auth for local testing
  const handleContinueWithoutAccount = () => {
    // Store a flag in localStorage to indicate guest mode
    localStorage.setItem('guestMode', 'true')
    navigate('/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (mode === 'signup' && password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Use "Continue without account" for local testing, or set up Supabase credentials in your .env file.')
      return
    }

    try {
      if (mode === 'login') {
        const result = await login(email, password)
        if (result.success) {
          navigate('/dashboard')
        } else {
          setError(result.error?.message || 'Invalid email or password')
        }
      } else if (mode === 'signup') {
        const result = await register(email, password, { name })
        if (result.success) {
          if (result.requiresConfirmation) {
            setSuccess('Check your email to confirm your account!')
            setMode('login')
          } else {
            navigate('/dashboard')
          }
        } else {
          setError(result.error?.message || 'Failed to create account')
        }
      } else if (mode === 'forgot') {
        const result = await forgotPassword(email)
        if (result.success) {
          setSuccess('Check your email for password reset instructions')
          setMode('login')
        } else {
          setError(result.error?.message || 'Failed to send reset email')
        }
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex justify-center items-center space-x-2 mb-6">
          <span className="text-4xl">🎯</span>
        </Link>
        <h2 className="text-center text-3xl font-bold text-gray-900">
          {mode === 'login' && 'Welcome back'}
          {mode === 'signup' && 'Create your account'}
          {mode === 'forgot' && 'Reset your password'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {mode === 'login' && (
            <>
              Don't have an account?{' '}
              <button 
                onClick={() => setMode('signup')} 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up for free
              </button>
            </>
          )}
          {mode === 'signup' && (
            <>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('login')} 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </button>
            </>
          )}
          {mode === 'forgot' && (
            <>
              Remember your password?{' '}
              <button 
                onClick={() => setMode('login')} 
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <Alert variant="danger" className="mb-6" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-6" dismissible onDismiss={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            )}

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            {mode !== 'forgot' && (
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                hint={mode === 'signup' ? 'At least 6 characters' : undefined}
              />
            )}

            {mode === 'signup' && (
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
            >
              {mode === 'login' && 'Sign in'}
              {mode === 'signup' && 'Create account'}
              {mode === 'forgot' && 'Send reset link'}
            </Button>

            {/* Continue without account option */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              fullWidth
              size="lg"
              onClick={handleContinueWithoutAccount}
            >
              Continue without account
            </Button>
            
            {!isSupabaseConfigured && (
              <p className="text-xs text-amber-600 text-center mt-2">
                ⚠️ Supabase not configured. Data will be saved locally only.
              </p>
            )}
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Secure & encrypted
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                256-bit encryption
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure login
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
