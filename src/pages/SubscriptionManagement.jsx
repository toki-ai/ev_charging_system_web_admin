import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  User,
  ArrowUp,
} from 'lucide-react'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { subscriptionService, paymentService } from '../services/apiService.js'
import PaymentDialog from '../components/PaymentDialog.jsx'
import { showToast } from '../utils/toast.js'

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState([])
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState(null)
  const [upgradeSubscription, setUpgradeSubscription] = useState(null)
  const [newSubscription, setNewSubscription] = useState({
    userId: '',
    customerEmail: '',
    customerName: '',
    type: 'Basic',
    startDate: '',
    endDate: '',
    price: '',
  })

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await subscriptionService.getAllSubscriptions()

      if (result.success) {
        setSubscriptions(result.data)
      } else {
        setError(result.error)
        console.error('Failed to load subscriptions:', result.error)
      }
    } catch (error) {
      setError('Failed to load subscriptions')
      console.error('Error loading subscriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  useEffect(() => {
    let filtered = subscriptions

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.customerPhone.includes(searchTerm)
      )
    }

    if (selectedStatus !== 'all') {
      const isActive = selectedStatus === 'active'
      filtered = filtered.filter((sub) => sub.isActive === isActive)
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((sub) => sub.type === selectedType)
    }

    setFilteredSubscriptions(filtered)
  }, [subscriptions, searchTerm, selectedStatus, selectedType])

  const handleCreateSubscription = async () => {
    try {
      setLoading(true)
      const result = await subscriptionService.createSubscription(
        newSubscription
      )

      if (result.success) {
        setNewSubscription({
          userId: '',
          customerEmail: '',
          customerName: '',
          type: 'Basic',
          startDate: '',
          endDate: '',
          price: '',
        })
        setShowCreateModal(false)
        // Reload subscriptions to get updated list
        await loadSubscriptions()
      } else {
        setError(result.error)
        console.error('Failed to create subscription:', result.error)
      }
    } catch (error) {
      setError('Failed to create subscription')
      console.error('Error creating subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditSubscription = async () => {
    if (!editingSubscription) return

    try {
      setLoading(true)
      const result = await subscriptionService.updateSubscription(
        editingSubscription.id,
        {
          userId: editingSubscription.userId,
          customerEmail: editingSubscription.customerEmail,
          customerName: editingSubscription.customerName,
          type: editingSubscription.type,
          startDate: editingSubscription.startDate,
          endDate: editingSubscription.endDate,
          price: editingSubscription.price,
          isActive: editingSubscription.isActive,
        }
      )

      if (result.success) {
        setShowEditModal(false)
        setEditingSubscription(null)
        // Reload subscriptions to get updated list
        await loadSubscriptions()
      } else {
        setError(result.error)
        console.error('Failed to edit subscription:', result.error)
      }
    } catch (error) {
      setError('Failed to edit subscription')
      console.error('Error editing subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSubscription = async (subscriptionId) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        setLoading(true)
        const result = await subscriptionService.deleteSubscription(
          subscriptionId
        )

        if (result.success) {
          // Reload subscriptions to get updated list
          await loadSubscriptions()
        } else {
          setError(result.error)
          console.error('Failed to delete subscription:', result.error)
        }
      } catch (error) {
        setError('Failed to delete subscription')
        console.error('Error deleting subscription:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const getStatusBadge = (isActive, endDate) => {
    const now = new Date()
    const end = new Date(endDate)

    if (!isActive) {
      return <Badge variant='secondary'>Inactive</Badge>
    } else if (end < now) {
      return <Badge variant='destructive'>Expired</Badge>
    } else {
      return <Badge variant='success'>Active</Badge>
    }
  }

  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'Basic':
        return 'bg-gray-100 text-gray-800'
      case 'Premium':
        return 'bg-blue-100 text-blue-800'
      case 'Pro':
        return 'bg-green-100 text-green-800'
      case 'Enterprise':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getNextSubscriptionLevel = (currentType) => {
    const levels = {
      Basic: { next: 'Premium', price: 500000 }, // 500k VND
      Premium: { next: 'Pro', price: 750000 }, // 750k VND
      Pro: { next: 'Enterprise', price: 999000 }, // 999k VND (under 1M limit)
      Enterprise: null, // Already at highest level
    }
    return levels[currentType]
  }

  const handleUpgradeSubscription = async (subscription) => {
    console.log('=== Starting upgrade process ===')
    console.log('Subscription to upgrade:', subscription)

    const nextLevel = getNextSubscriptionLevel(subscription.type)
    console.log('Next level calculated:', nextLevel)

    if (!nextLevel) {
      console.log('No next level available - already at highest')
      alert('Subscription is already at the highest level!')
      return
    }

    // Calculate new end date: current end date + 30 days
    const currentEndDate = new Date(subscription.endDate)
    const newEndDate = new Date(currentEndDate)
    newEndDate.setDate(newEndDate.getDate() + 30)

    const upgradeData = {
      ...subscription,
      nextLevel,
      newEndDate: newEndDate.toISOString().split('T')[0],
    }

    console.log('Setting upgrade subscription data:', upgradeData)

    // Set upgrade data and show payment dialog
    setUpgradeSubscription(upgradeData)
    setShowPaymentDialog(true)
    console.log('Payment dialog should now be visible')
  }

  const handlePaymentSuccess = async (paymentData) => {
    if (!upgradeSubscription) return

    try {
      setLoading(true)
      console.log('=== PAYMENT PROCESS STARTED ===')
      console.log('Upgrade subscription:', upgradeSubscription)
      console.log('Payment data received:', paymentData)

      // Step 1: Create payment record
      const paymentId = `${upgradeSubscription.userId}-${upgradeSubscription.id}`

      const paymentPayload = {
        sessionId: paymentData.sessionId || paymentId, // Use PaymentDialog sessionId if available
        userId: paymentData.userId || upgradeSubscription.userId,
        userEmail: upgradeSubscription.customerEmail || 'admin@evcharging.com', // Fallback email
        amount: upgradeSubscription.nextLevel.price,
        paymentMethod: getPaymentMethodName(paymentData.method),
        paymentGateway:
          paymentData.method === 'cash' ? 'cash' : paymentData.method,
        description:
          paymentData.description ||
          `Upgrade subscription từ ${upgradeSubscription.type} lên ${upgradeSubscription.nextLevel.next}`, // Use PaymentDialog description if available
        // Subscription specific data
        subscriptionId: upgradeSubscription.id.toString(),
        subscriptionType: upgradeSubscription.nextLevel.next,
        previousSubscriptionType: upgradeSubscription.type,
      }

      console.log('Payment payload to send:', paymentPayload)
      console.log('User token exists:', !!localStorage.getItem('token'))

      const paymentResult = await paymentService.createPayment(paymentPayload)

      console.log('Payment result received:', paymentResult)

      if (!paymentResult.success) {
        setError(`Lỗi tạo payment: ${paymentResult.error}`)
        return
      }

      // Step 2: Update subscription after payment success
      const result = await subscriptionService.updateSubscription(
        upgradeSubscription.id,
        {
          userId: upgradeSubscription.userId,
          customerEmail: upgradeSubscription.customerEmail,
          customerName: upgradeSubscription.customerName,
          type: upgradeSubscription.nextLevel.next,
          startDate: upgradeSubscription.startDate,
          endDate: upgradeSubscription.newEndDate,
          price: upgradeSubscription.nextLevel.price,
          isActive: upgradeSubscription.isActive,
        }
      )

      if (result.success) {
        await loadSubscriptions()
        // Show success notification
        showToast.success(
          `✅ Nâng cấp subscription thành công! Payment ID: ${paymentResult.data.transactionId}`
        )
      } else {
        setError(result.error)
        console.error('Failed to upgrade subscription:', result.error)
      }
    } catch (error) {
      console.error('=== PAYMENT PROCESS ERROR ===')
      console.error('Full error object:', error)
      console.error('Error message:', error.message)
      console.error('Error response:', error.response)
      console.error('Upgrade subscription at error:', upgradeSubscription)

      setError(
        'Failed to upgrade subscription: ' + (error.message || 'Unknown error')
      )
      console.error('Error upgrading subscription:', error)
    } finally {
      setLoading(false)
      setShowPaymentDialog(false)
      setUpgradeSubscription(null)
    }
  }

  const getPaymentMethodName = (method) => {
    const methods = {
      cash: 'Tiền mặt',
      card: 'Thẻ tín dụng',
      momo: 'MoMo',
      zalopay: 'ZaloPay',
    }
    return methods[method] || method
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Subscription Management
          </h1>
          <p className='text-gray-600'>
            Manage customer subscriptions and plans
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className='bg-green-600 hover:bg-green-700'
        >
          <Plus className='w-4 h-4 mr-2' />
          Create Subscription
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <Card className='p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <CreditCard className='w-8 h-8 text-green-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>Total Active</p>
              <p className='text-2xl font-bold text-gray-900'>
                {subscriptions.filter((s) => s.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Calendar className='w-8 h-8 text-blue-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>Expired</p>
              <p className='text-2xl font-bold text-gray-900'>
                {
                  subscriptions.filter((s) => new Date(s.endDate) < new Date())
                    .length
                }
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <User className='w-8 h-8 text-purple-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>Total Revenue</p>
              <p className='text-2xl font-bold text-gray-900'>
                {formatCurrency(
                  subscriptions.reduce((sum, s) => sum + s.price, 0)
                )}
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <CreditCard className='w-8 h-8 text-orange-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-500'>This Month</p>
              <p className='text-2xl font-bold text-gray-900'>
                {
                  subscriptions.filter((s) => {
                    const created = new Date(s.createdAt)
                    const now = new Date()
                    return (
                      created.getMonth() === now.getMonth() &&
                      created.getFullYear() === now.getFullYear()
                    )
                  }).length
                }
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className='p-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='w-4 h-4 absolute left-3 top-3 text-gray-400' />
              <Input
                placeholder='Search by name, email or phone...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All Types</option>
            <option value='Basic'>Basic</option>
            <option value='Premium'>Premium</option>
            <option value='Pro'>Pro</option>
            <option value='Enterprise'>Enterprise</option>
          </select>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Customer
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Period
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Price
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created By
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredSubscriptions.map((subscription) => (
                <tr key={subscription.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {subscription.customerName}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {subscription.customerEmail}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {subscription.customerPhone}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                        subscription.type
                      )}`}
                    >
                      {subscription.type}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    <div>
                      <div>{subscription.startDate}</div>
                      <div className='text-gray-500'>
                        to {subscription.endDate}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {formatCurrency(subscription.price)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {getStatusBadge(
                      subscription.isActive,
                      subscription.endDate
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {subscription.createdBy}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      {getNextSubscriptionLevel(subscription.type) && (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            handleUpgradeSubscription(subscription)
                          }
                          className='text-blue-600 hover:text-blue-700'
                          title={`Upgrade to ${
                            getNextSubscriptionLevel(subscription.type)?.next
                          }`}
                        >
                          <ArrowUp className='w-4 h-4' />
                        </Button>
                      )}
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setEditingSubscription(subscription)
                          setShowEditModal(true)
                        }}
                      >
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          handleDeleteSubscription(subscription.id)
                        }
                        className='text-red-600 hover:text-red-700'
                      >
                        <Trash2 className='w-4 h-4' />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscriptions.length === 0 && (
          <div className='text-center py-12'>
            <CreditCard className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500'>No subscriptions found</p>
          </div>
        )}
      </Card>

      {/* Create Subscription Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Create New Subscription'
      >
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Customer Email
            </label>
            <Input
              type='email'
              placeholder='Enter customer email'
              value={newSubscription.customerEmail}
              onChange={(e) =>
                setNewSubscription((prev) => ({
                  ...prev,
                  customerEmail: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Customer Name
            </label>
            <Input
              placeholder='Enter customer name'
              value={newSubscription.customerName}
              onChange={(e) =>
                setNewSubscription((prev) => ({
                  ...prev,
                  customerName: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Subscription Type
            </label>
            <select
              value={newSubscription.type}
              onChange={(e) =>
                setNewSubscription((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='Basic'>Basic - 600,000 VND/year</option>
              <option value='Premium'>Premium - 1,200,000 VND/year</option>
              <option value='Pro'>Pro - 1,800,000 VND/year</option>
              <option value='Enterprise'>
                Enterprise - 2,400,000 VND/year
              </option>
            </select>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Start Date
              </label>
              <Input
                type='date'
                value={newSubscription.startDate}
                onChange={(e) =>
                  setNewSubscription((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                End Date
              </label>
              <Input
                type='date'
                value={newSubscription.endDate}
                onChange={(e) =>
                  setNewSubscription((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Price (VND)
            </label>
            <Input
              type='number'
              placeholder='Enter price'
              value={newSubscription.price}
              onChange={(e) =>
                setNewSubscription((prev) => ({
                  ...prev,
                  price: e.target.value,
                }))
              }
            />
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button variant='outline' onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubscription}
              disabled={
                !newSubscription.customerEmail ||
                !newSubscription.customerName ||
                !newSubscription.startDate ||
                !newSubscription.endDate ||
                !newSubscription.price
              }
            >
              Create Subscription
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Subscription Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='Edit Subscription'
      >
        {editingSubscription && (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Subscription Type
              </label>
              <select
                value={editingSubscription.type}
                onChange={(e) =>
                  setEditingSubscription((prev) => ({
                    ...prev,
                    type: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='Basic'>Basic</option>
                <option value='Premium'>Premium</option>
                <option value='Pro'>Pro</option>
                <option value='Enterprise'>Enterprise</option>
              </select>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Start Date
                </label>
                <Input
                  type='date'
                  value={editingSubscription.startDate}
                  onChange={(e) =>
                    setEditingSubscription((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  End Date
                </label>
                <Input
                  type='date'
                  value={editingSubscription.endDate}
                  onChange={(e) =>
                    setEditingSubscription((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Price (VND)
              </label>
              <Input
                type='number'
                value={editingSubscription.price}
                onChange={(e) =>
                  setEditingSubscription((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value),
                  }))
                }
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Status
              </label>
              <select
                value={editingSubscription.isActive}
                onChange={(e) =>
                  setEditingSubscription((prev) => ({
                    ...prev,
                    isActive: e.target.value === 'true',
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='true'>Active</option>
                <option value='false'>Inactive</option>
              </select>
            </div>

            <div className='flex justify-end space-x-3 pt-4'>
              <Button variant='outline' onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditSubscription}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => {
          setShowPaymentDialog(false)
          setUpgradeSubscription(null)
        }}
        onPaymentSuccess={handlePaymentSuccess}
        amount={upgradeSubscription?.nextLevel?.price || 0}
        subscriptionInfo={
          upgradeSubscription
            ? {
                userId: upgradeSubscription.userId, // Add userId for PaymentDialog
                customerName: upgradeSubscription.customerName,
                currentType: upgradeSubscription.type,
                newType: upgradeSubscription.nextLevel.next,
              }
            : null
        }
      />
    </div>
  )
}
