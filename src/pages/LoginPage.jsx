import React, { useState } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { Zap, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input, Label, FormGroup } from '../components/ui/Input.jsx'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { login, isAuthenticated, error, clearError, loading } = useAuth()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    await login({ email, password })
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-12 px-6 sm:px-8 lg:px-10'>
      <div className='max-w-md w-full space-y-8'>
        <div className='animate-fade-in'>
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200/50 p-10'>
            <div className='text-center mb-8'>
              <div className='h-16 w-16 mx-auto mb-4 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/25'>
                <Zap className='h-8 w-8 text-white' />
              </div>
              <h2 className='text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'>
                SmartEV Charge
              </h2>
              <p className='mt-2 text-slate-600'>
                Đăng nhập vào hệ thống quản lý
              </p>
            </div>

            <form className='space-y-6' onSubmit={handleSubmit}>
              <div className='space-y-4'>
                <FormGroup>
                  <Label htmlFor='email'>Email address</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='name@company.com'
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor='password'>Password</Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='current-password'
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder='••••••••'
                    />
                    <button
                      type='button'
                      className='absolute inset-y-0 right-0 pr-4 flex items-center'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className='h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors duration-200' />
                      ) : (
                        <Eye className='h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors duration-200' />
                      )}
                    </button>
                  </div>
                </FormGroup>
              </div>

              {error && (
                <div className='p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl'>
                  <p className='text-red-800 text-sm font-medium'>{error}</p>
                </div>
              )}

              <div>
                <Button type='submit' className='w-full' disabled={loading}>
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </div>

              <div className='mt-8 pt-6 border-t border-slate-200'>
                <div className='text-center'>
                  <p className='text-sm text-slate-600 font-semibold'>
                    Để test API, hãy đăng ký tài khoản trước hoặc sử dụng:
                  </p>
                  <div className='mt-3 space-y-2'>
                    <p className='text-xs text-slate-500'>
                      Bất kỳ email và password hợp lệ nào
                    </p>
                    <Link
                      to='/register'
                      className='text-xs text-primary-600 hover:text-primary-500 transition-colors duration-200 font-medium'
                    >
                      Hoặc đăng ký tài khoản mới tại đây
                    </Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
