import React, { useState } from 'react'
import { Modal } from './ui/Modal.jsx'
import { Button } from './ui/Button.jsx'
import { Input } from './ui/Input.jsx'
import { CreditCard, Smartphone, Wallet, DollarSign } from 'lucide-react'

export default function PaymentDialog({
  isOpen,
  onClose,
  onPaymentSuccess,
  amount,
  subscriptionInfo,
  paymentPurpose = 'subscription', // 'subscription' or 'session'
  sessionData = null, // For session payments
}) {
  // State management
  const [selectedMethod, setSelectedMethod] = useState('')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [formData, setFormData] = useState({
    // Card payment
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolderName: '',

    // Banking
    bankAccount: '',
    bankCode: '',
    pin: '',

    // E-wallet
    phoneNumber: '',
    otp: '',
  })

  // Valid test data for payments
  const validTestData = {
    // Valid card data
    cards: [
      {
        number: '1234567890123456',
        cvv: '123',
        name: 'NGUYEN VAN A',
        pin: '123456',
      },
      {
        number: '4111111111111111',
        cvv: '456',
        name: 'TRAN THI B',
        pin: '654321',
      },
      {
        number: '5555555555554444',
        cvv: '789',
        name: 'LE VAN C',
        pin: '111111',
      },
    ],
    // Valid e-wallet data
    wallets: [
      { phone: '0901234567', otp: '123456' },
      { phone: '0987654321', otp: '654321' },
      { phone: '0912345678', otp: '111111' },
    ],
  }

  const validatePaymentData = () => {
    setPaymentError('')

    if (selectedMethod === 'card') {
      // Remove spaces from card number for validation
      const cardNumber = formData.cardNumber.replace(/\s/g, '')

      // Check if card data matches any valid test data
      const isValidCard = validTestData.cards.some(
        (card) =>
          card.number === cardNumber &&
          card.cvv === formData.cvv &&
          card.name.toUpperCase() === formData.cardHolderName.toUpperCase() &&
          card.pin === formData.pin
      )

      if (!isValidCard) {
        setPaymentError('Thông tin thẻ không chính xác. Vui lòng kiểm tra lại.')
        return false
      }
    }

    if (selectedMethod === 'momo' || selectedMethod === 'zalopay') {
      // Check if wallet data matches any valid test data
      const isValidWallet = validTestData.wallets.some(
        (wallet) =>
          wallet.phone === formData.phoneNumber && wallet.otp === formData.otp
      )

      if (!isValidWallet) {
        setPaymentError('Số điện thoại hoặc mã OTP không chính xác.')
        return false
      }
    }

    return true
  }

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Tiền mặt',
      icon: DollarSign,
      description: 'Thanh toán trực tiếp bằng tiền mặt',
    },
    {
      id: 'card',
      name: 'Thẻ tín dụng/ghi nợ',
      icon: CreditCard,
      description: 'Thanh toán bằng thẻ Visa, MasterCard',
    },
    {
      id: 'momo',
      name: 'MoMo',
      icon: Wallet,
      description: 'Thanh toán qua ví MoMo',
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: Smartphone,
      description: 'Thanh toán qua ví ZaloPay',
    },
  ]

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const createPaymentData = (method, transactionId) => {
    const basePaymentData = {
      method,
      amount,
      status: 'Completed',
      transactionId,
    }

    let paymentData
    if (paymentPurpose === 'session' && sessionData) {
      // For session payments
      paymentData = {
        ...basePaymentData,
        sessionId: sessionData.id.toString(), // Ensure sessionId is string
        userId: sessionData.userId,
        description: `Thanh toán phiên sạc #${sessionData.id}`,
        paymentType: 'ChargingSession',
      }
      console.log('💳 Creating SESSION payment data:', paymentData)
    } else {
      // For subscription payments (default)
      paymentData = {
        ...basePaymentData,
        sessionId: subscriptionInfo?.userId?.toString() || null, // Use userId as sessionId for subscription, ensure string
        userId: subscriptionInfo?.userId,
        description: `Upgrade subscription from ${subscriptionInfo?.currentType} to ${subscriptionInfo?.newType}`,
        paymentType: 'SubscriptionUpgrade',
      }
      console.log('💳 Creating SUBSCRIPTION payment data:', paymentData)
    }

    return paymentData
  }

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId)
    if (methodId === 'cash') {
      handleCashPayment()
    } else {
      setShowPaymentForm(true)
    }
  }

  const handleCashPayment = async () => {
    setLoading(true)
    // Simulate processing time for cash payment
    setTimeout(() => {
      setLoading(false)

      const transactionId = `CASH_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase()}`

      const paymentData = createPaymentData('cash', transactionId)

      console.log('Cash payment completed successfully')
      console.log('Calling onPaymentSuccess with:', paymentData)

      // Call parent success handler with payment data
      onPaymentSuccess(paymentData)

      alert(
        `✅ Thanh toán tiền mặt thành công!\nSố tiền: ${formatCurrency(
          amount
        )}\nPhương thức: Tiền mặt\nTrạng thái: Hoàn thành`
      )

      handleClose()
    }, 1000)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setPaymentError('')

    console.log('=== PaymentDialog: Form submitted ===')
    console.log('Selected method:', selectedMethod)
    console.log('Amount:', amount)
    console.log('Form data:', formData)

    // Validate payment data first
    if (!validatePaymentData()) {
      console.log('Payment validation failed')
      return // Stop here if validation fails
    }

    console.log('Payment validation passed, processing...')
    setLoading(true)

    // Simulate payment processing with correct data = immediate completion
    setTimeout(() => {
      setLoading(false)
      const methodName = paymentMethods.find(
        (m) => m.id === selectedMethod
      )?.name

      const transactionId = `TXN_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)
        .toUpperCase()}`

      const paymentData = createPaymentData(selectedMethod, transactionId)

      console.log('Payment completed successfully with valid data')
      console.log('Calling onPaymentSuccess with:', paymentData)

      // Call parent success handler with payment data
      onPaymentSuccess(paymentData)

      alert(
        `✅ Thanh toán thành công!\nSố tiền: ${formatCurrency(
          amount
        )}\nPhương thức: ${methodName}\nTrạng thái: Hoàn thành`
      )

      handleClose()
    }, 1500) // Reduced time since validation passed
  }

  const handleClose = () => {
    setSelectedMethod('')
    setShowPaymentForm(false)
    setPaymentError('')
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolderName: '',
      bankAccount: '',
      bankCode: '',
      pin: '',
      phoneNumber: '',
      otp: '',
    })
    onClose()
  }

  const renderPaymentForm = () => {
    if (selectedMethod === 'card') {
      return (
        <form onSubmit={handleFormSubmit} className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900'>Thông tin thẻ</h3>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Số thẻ
            </label>
            <Input
              placeholder='1234 5678 9012 3456'
              value={formData.cardNumber}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cardNumber: e.target.value }))
              }
              required
              maxLength={19}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Ngày hết hạn
              </label>
              <Input
                placeholder='MM/YY'
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expiryDate: e.target.value,
                  }))
                }
                required
                maxLength={5}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                CVV
              </label>
              <Input
                placeholder='123'
                type='password'
                value={formData.cvv}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cvv: e.target.value }))
                }
                required
                maxLength={4}
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Tên chủ thẻ
            </label>
            <Input
              placeholder='NGUYEN VAN A'
              value={formData.cardHolderName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  cardHolderName: e.target.value,
                }))
              }
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Mã PIN
            </label>
            <Input
              placeholder='****'
              type='password'
              value={formData.pin}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, pin: e.target.value }))
              }
              required
              maxLength={6}
            />
          </div>

          {/* Error Message */}
          {paymentError && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
              {paymentError}
            </div>
          )}

          <div className='flex space-x-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              className='flex-1'
            >
              Hủy
            </Button>
            <Button type='submit' disabled={loading} className='flex-1'>
              {loading
                ? 'Đang hoàn tất thanh toán...'
                : `Thanh toán ${formatCurrency(amount)}`}
            </Button>
          </div>
        </form>
      )
    }

    if (selectedMethod === 'momo' || selectedMethod === 'zalopay') {
      const walletName = selectedMethod === 'momo' ? 'MoMo' : 'ZaloPay'

      return (
        <form onSubmit={handleFormSubmit} className='space-y-4'>
          <h3 className='text-lg font-semibold text-gray-900'>
            Thanh toán {walletName}
          </h3>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Số điện thoại
            </label>
            <Input
              placeholder='0901234567'
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phoneNumber: e.target.value,
                }))
              }
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Mã OTP
            </label>
            <Input
              placeholder='123456'
              value={formData.otp}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, otp: e.target.value }))
              }
              required
              maxLength={6}
            />
            <p className='text-xs text-gray-500 mt-1'>
              Nhập mã OTP được gửi về điện thoại của bạn
            </p>
          </div>

          {/* Error Message */}
          {paymentError && (
            <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
              {paymentError}
            </div>
          )}

          <div className='flex space-x-3 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              className='flex-1'
            >
              Hủy
            </Button>
            <Button type='submit' disabled={loading} className='flex-1'>
              {loading
                ? 'Đang hoàn tất thanh toán...'
                : `Thanh toán ${formatCurrency(amount)}`}
            </Button>
          </div>
        </form>
      )
    }

    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        paymentPurpose === 'session'
          ? 'Thanh toán phiên sạc'
          : 'Thanh toán nâng cấp subscription'
      }
    >
      <div className='space-y-6'>
        {/* Payment Summary */}
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h4 className='font-medium text-gray-900 mb-2'>
            Thông tin thanh toán
          </h4>
          <div className='space-y-1 text-sm'>
            <div className='flex justify-between'>
              <span>Khách hàng:</span>
              <span className='font-medium'>
                {subscriptionInfo?.customerName}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Gói cũ:</span>
              <span>{subscriptionInfo?.currentType}</span>
            </div>
            <div className='flex justify-between'>
              <span>Gói mới:</span>
              <span className='font-medium text-green-600'>
                {subscriptionInfo?.newType}
              </span>
            </div>
            <div className='flex justify-between font-semibold text-lg border-t pt-2'>
              <span>Số tiền:</span>
              <span className='text-blue-600'>{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>

        {!showPaymentForm ? (
          /* Payment Method Selection */
          <div className='space-y-3'>
            <h4 className='font-medium text-gray-900'>
              Chọn phương thức thanh toán
            </h4>

            {/* Test Data Info */}
            <div className='bg-blue-50 p-4 rounded-lg'>
              <h5 className='font-medium text-blue-900 mb-2'>
                🧪 Dữ liệu test (Sandbox)
              </h5>
              <div className='text-sm text-blue-800 space-y-1'>
                <p>
                  <strong>Thẻ hợp lệ:</strong> 1234567890123456, CVV: 123, PIN:
                  123456
                </p>
                <p>
                  <strong>Ví điện tử:</strong> 0901234567, OTP: 123456
                </p>
                <p>Nhập sai thông tin sẽ hiển thị lỗi thanh toán</p>
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3'>
              {paymentMethods.map((method) => {
                const IconComponent = method.icon
                return (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    disabled={loading}
                    className='flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left disabled:opacity-50'
                  >
                    <IconComponent className='w-6 h-6 text-gray-600 mr-3' />
                    <div className='flex-1'>
                      <div className='font-medium text-gray-900'>
                        {method.name}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {method.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          /* Payment Form */
          <div>
            <button
              onClick={() => setShowPaymentForm(false)}
              className='text-blue-600 text-sm mb-4 hover:underline'
            >
              ← Quay lại chọn phương thức khác
            </button>
            {renderPaymentForm()}
          </div>
        )}

        {loading && selectedMethod === 'cash' && (
          <div className='text-center py-4'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto'></div>
            <p className='text-gray-600 mt-2'>
              Đang hoàn tất thanh toán tiền mặt...
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
