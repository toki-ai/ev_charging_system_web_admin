import React, { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input, Label, FormGroup } from '../components/ui/Input.jsx'
import { authService } from '../services/authService.js'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    address: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { isAuthenticated } = useAuth()

  if (isAuthenticated) {
    return <Navigate to='/dashboard' replace />
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await authService.register(formData)

      if (result.success) {
        setSuccess(true)
      } else {
        setError(result.error)
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 py-12 px-6 sm:px-8 lg:px-10'>
        <div className='max-w-md w-full space-y-8'>
          <div className='animate-fade-in'>
            <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-200/50 p-10 text-center'>
              <div className='h-16 w-16 mx-auto mb-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25'>
                <UserPlus className='h-8 w-8 text-white' />
              </div>
              <h2 className='text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4'>
                Đăng ký thành công!
              </h2>
              <p className='text-slate-600 mb-6'>
                Tài khoản của bạn đã được tạo thành công. Bây giờ bạn có thể
                đăng nhập.
              </p>
              <Link to='/login'>
                <Button className='w-full'>Đi đến đăng nhập</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
                Tạo tài khoản
              </h2>
              <p className='mt-2 text-slate-600'>
                Đăng ký để sử dụng SmartEV Charge
              </p>
            </div>

            <form className='space-y-6' onSubmit={handleSubmit}>
              <div className='space-y-4'>
                <FormGroup>
                  <Label htmlFor='fullName'>Họ và tên</Label>
                  <Input
                    id='fullName'
                    name='fullName'
                    type='text'
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder='Nguyễn Văn A'
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder='name@company.com'
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor='phone'>Số điện thoại</Label>
                  <Input
                    id='phone'
                    name='phone'
                    type='tel'
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder='0901234567'
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor='address'>Địa chỉ</Label>
                  <Input
                    id='address'
                    name='address'
                    type='text'
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder='123 Đường ABC, Quận XYZ, TP.HCM'
                  />
                </FormGroup>

                <FormGroup>
                  <Label htmlFor='password'>Mật khẩu</Label>
                  <div className='relative'>
                    <Input
                      id='password'
                      name='password'
                      type={showPassword ? 'text' : 'password'}
                      autoComplete='new-password'
                      required
                      value={formData.password}
                      onChange={handleChange}
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
                  {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                </Button>
              </div>

              <div className='text-center'>
                <p className='text-sm text-slate-600'>
                  Đã có tài khoản?{' '}
                  <Link
                    to='/login'
                    className='font-semibold text-primary-600 hover:text-primary-500 transition-colors duration-200'
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
