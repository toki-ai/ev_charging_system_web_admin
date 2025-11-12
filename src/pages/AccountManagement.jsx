import React, { useState, useEffect } from 'react'
import { Users, Plus, Search, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import { Card } from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Input } from '../components/ui/Input.jsx'
import { Modal } from '../components/ui/Modal.jsx'
import { accountService, stationService } from '../services/apiService.js'

export default function AccountManagement() {
  const [accounts, setAccounts] = useState([])
  const [filteredAccounts, setFilteredAccounts] = useState([])
  const [stations, setStations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [newAccount, setNewAccount] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'CSStaff',
    stationId: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const result = await accountService.getAllUsers()

      if (result.success) {
        setAccounts(result.data)
        setFilteredAccounts(result.data)
        setError('')
      } else {
        const errorMessage =
          typeof result.error === 'string'
            ? result.error
            : 'Failed to load accounts'
        setError(errorMessage)
        console.error('Failed to load accounts:', result.error)
      }
    } catch (error) {
      setError('Failed to load accounts')
      console.error('Load accounts error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStations = async () => {
    try {
      const result = await stationService.getAllStations()
      if (result.success) {
        setStations(result.data)
      } else {
        console.error('Failed to load stations:', result.error)
        // Don't show error for stations, just log it
      }
    } catch (error) {
      console.error('Load stations error:', error)
    }
  }

  useEffect(() => {
    loadAccounts()
    loadStations() // Load stations when component mounts
  }, [])

  useEffect(() => {
    let filtered = accounts

    if (searchTerm) {
      filtered = filtered.filter(
        (account) =>
          account.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.phone.includes(searchTerm)
      )
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter((account) => account.role === selectedRole)
    }

    setFilteredAccounts(filtered)
  }, [accounts, searchTerm, selectedRole])

  const handleCreateAccount = async () => {
    try {
      setLoading(true)
      setError('') // Clear any previous errors
      const result = await accountService.createStaff(newAccount)

      if (result.success) {
        setNewAccount({
          email: '',
          password: '',
          fullName: '',
          phone: '',
          role: 'CSStaff',
          stationId: '',
        })
        setShowCreateModal(false)
        setError('') // Clear any errors on success
        // Reload accounts to get updated list
        await loadAccounts()
      } else {
        // Ensure error is a string
        const errorMessage =
          typeof result.error === 'string'
            ? result.error
            : 'Failed to create account'
        setError(errorMessage)
        console.error('Failed to create account:', result.error)
      }
    } catch (error) {
      setError('Failed to create account')
      console.error('Error creating account:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAccount = async () => {
    if (!editingAccount) return

    try {
      setLoading(true)
      const result = await accountService.updateUser(editingAccount.id, {
        fullName: editingAccount.fullName,
        phone: editingAccount.phone,
        role: editingAccount.role,
        stationId: editingAccount.stationId,
      })

      if (result.success) {
        setShowEditModal(false)
        setEditingAccount(null)
        setError('') // Clear errors on success
        // Reload accounts to get updated list
        await loadAccounts()
      } else {
        const errorMessage =
          typeof result.error === 'string'
            ? result.error
            : 'Failed to edit account'
        setError(errorMessage)
        console.error('Failed to edit account:', result.error)
      }
    } catch (error) {
      setError('Failed to edit account')
      console.error('Error editing account:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        setLoading(true)
        const result = await accountService.deleteUser(accountId)

        if (result.success) {
          setError('') // Clear errors on success
          // Reload accounts to get updated list
          await loadAccounts()
        } else {
          const errorMessage =
            typeof result.error === 'string'
              ? result.error
              : 'Failed to delete account'
          setError(errorMessage)
          console.error('Failed to delete account:', result.error)
        }
      } catch (error) {
        setError('Failed to delete account')
        console.error('Error deleting account:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'Admin':
        return 'bg-red-100 text-red-800'
      case 'StationManager':
        return 'bg-blue-100 text-blue-800'
      case 'CSStaff':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStationName = (stationId) => {
    if (!stationId) return 'N/A'
    const station = stations.find((s) => s.id === parseInt(stationId))
    return station ? station.name : `Station ID: ${stationId}`
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
      {/* Error Display */}
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
          {error}
        </div>
      )}

      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Account Management
          </h1>
          <p className='text-gray-600'>
            Manage system accounts and staff members
          </p>
        </div>
        <Button
          onClick={() => {
            setError('') // Clear errors when opening modal
            setShowCreateModal(true)
          }}
          className='bg-blue-600 hover:bg-blue-700'
        >
          <Plus className='w-4 h-4 mr-2' />
          Create New Account
        </Button>
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
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            <option value='all'>All Roles</option>
            <option value='Admin'>Admin</option>
            <option value='StationManager'>Station Manager</option>
            <option value='CSStaff'>CS Staff</option>
          </select>
        </div>
      </Card>

      {/* Accounts Table */}
      <Card>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Account
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Role
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Station
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Created
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Last Login
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredAccounts.map((account) => (
                <tr key={account.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div>
                      <div className='text-sm font-medium text-gray-900'>
                        {account.fullName}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {account.email}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {account.phone}
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                        account.role
                      )}`}
                    >
                      {account.role}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {getStationName(account.stationId)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {account.createdAt}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {account.lastLogin || 'Never'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => {
                          setEditingAccount(account)
                          setShowEditModal(true)
                        }}
                      >
                        <Edit className='w-4 h-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleDeleteAccount(account.id)}
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

        {filteredAccounts.length === 0 && (
          <div className='text-center py-12'>
            <Users className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-500'>No accounts found</p>
          </div>
        )}
      </Card>

      {/* Create Account Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setError('') // Clear errors when closing modal
          setShowCreateModal(false)
        }}
        title='Create New Account'
      >
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Email
            </label>
            <Input
              type='email'
              placeholder='Enter email'
              value={newAccount.email}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Password <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter password (min 8 characters)'
                value={newAccount.password}
                onChange={(e) =>
                  setNewAccount((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
              />
              <button
                type='button'
                className='absolute right-3 top-3 text-gray-400 hover:text-gray-600'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className='w-4 h-4' />
                ) : (
                  <Eye className='w-4 h-4' />
                )}
              </button>
            </div>
            {newAccount.password && newAccount.password.length < 8 && (
              <p className='text-sm text-red-500 mt-1'>
                Password must be at least 8 characters
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Full Name
            </label>
            <Input
              placeholder='Enter full name'
              value={newAccount.fullName}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Phone
            </label>
            <Input
              placeholder='Enter phone number'
              value={newAccount.phone}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Role
            </label>
            <select
              value={newAccount.role}
              onChange={(e) =>
                setNewAccount((prev) => ({ ...prev, role: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='CSStaff'>CS Staff</option>
              <option value='StationManager'>Station Manager</option>
              <option value='Admin'>Admin</option>
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Station <span className='text-red-500'>*</span>
            </label>
            <select
              value={newAccount.stationId}
              onChange={(e) =>
                setNewAccount((prev) => ({
                  ...prev,
                  stationId: e.target.value,
                }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Select a station</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name} - {station.address}
                </option>
              ))}
            </select>
          </div>

          <div className='flex justify-end space-x-3 pt-4'>
            <Button
              variant='outline'
              onClick={() => {
                setError('') // Clear errors when canceling
                setShowCreateModal(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateAccount}
              disabled={
                !newAccount.email ||
                !newAccount.password ||
                newAccount.password.length < 8 || // Minimum password length
                !newAccount.fullName ||
                !newAccount.phone ||
                !newAccount.stationId ||
                !parseInt(newAccount.stationId) // Ensure stationId is a valid number
              }
            >
              Create Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Account Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title='Edit Account'
      >
        {editingAccount && (
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Full Name
              </label>
              <Input
                placeholder='Enter full name'
                value={editingAccount.fullName}
                onChange={(e) =>
                  setEditingAccount((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Phone
              </label>
              <Input
                placeholder='Enter phone number'
                value={editingAccount.phone}
                onChange={(e) =>
                  setEditingAccount((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Role
              </label>
              <select
                value={editingAccount.role}
                onChange={(e) =>
                  setEditingAccount((prev) => ({
                    ...prev,
                    role: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='CSStaff'>CS Staff</option>
                <option value='StationManager'>Station Manager</option>
                <option value='Admin'>Admin</option>
              </select>
            </div>

            {(editingAccount.role === 'CSStaff' ||
              editingAccount.role === 'StationManager') && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Station
                </label>
                <select
                  value={editingAccount.stationId || ''}
                  onChange={(e) =>
                    setEditingAccount((prev) => ({
                      ...prev,
                      stationId: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>Select a station</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name} - {station.address}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className='flex justify-end space-x-3 pt-4'>
              <Button variant='outline' onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAccount}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
