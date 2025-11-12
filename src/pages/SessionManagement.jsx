import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Search, Plus, StopCircle } from 'lucide-react'
import { formatCurrency } from '../utils/helpers'
import { showToast } from '../utils/toast'
import { authService } from '../services/authService'
import {
  sessionService,
  stationService,
  vehicleService,
  paymentService,
} from '../services/apiService'
import PaymentDialog from '../components/PaymentDialog'

const SessionManagement = () => {
  const [sessions, setSessions] = useState([])
  const [stations, setStations] = useState([])
  const [users, setUsers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStation, setSelectedStation] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  // Payment dialog state
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [sessionToStop, setSessionToStop] = useState(null)
  const [sessionCost, setSessionCost] = useState(0)

  // Get current user info
  const currentUser = authService.getStoredUser()
  const isAdmin = currentUser?.role === 'Admin'
  const isStaffOrManager = ['StationManager', 'CSStaff'].includes(
    currentUser?.role
  )

  const [newSession, setNewSession] = useState({
    userId: '',
    stationId: '',
    vehicleId: '',
  })

  // Mock charging stations for dashboard
  const [chargingStations, setChargingStations] = useState([
    {
      id: 1,
      name: 'Station A - Charger 1',
      status: 'charging',
      sessionId: 1,
      power: '50kW',
      timeRemaining: 45,
      user: 'John Doe',
    },
    {
      id: 2,
      name: 'Station A - Charger 2',
      status: 'available',
      power: '50kW',
    },
    {
      id: 3,
      name: 'Station B - Charger 1',
      status: 'charging',
      sessionId: 2,
      power: '150kW',
      timeRemaining: 20,
      user: 'Jane Smith',
    },
    {
      id: 4,
      name: 'Station B - Charger 2',
      status: 'maintenance',
      power: '150kW',
    },
  ])

  useEffect(() => {
    loadSessions()
    loadStations()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Reload sessions when admin changes station filter
  useEffect(() => {
    if (isAdmin) {
      loadSessions()
    }
  }, [selectedStation]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError('')

      let result

      if (isAdmin) {
        // Admin can see all sessions, with optional station filter from UI
        const stationFilter = selectedStation ? parseInt(selectedStation) : null
        result = await sessionService.getSessions(null, stationFilter)
      } else if (isStaffOrManager) {
        // Staff and managers get sessions filtered by their assigned station
        const userStationId = currentUser.stationId
          ? parseInt(currentUser.stationId)
          : null
        result = await sessionService.getSessions(null, userStationId)
      } else {
        // Regular users get their own sessions
        result = await sessionService.getSessions(currentUser.id)
      }

      if (result.success) {
        let sessionsData = result.data || []

        // Transform API data to match component format
        const transformedSessions = sessionsData.map((session) => {
          // Find station info from loaded stations
          const stationInfo = stations.find((s) => s.id === session.stationId)

          return {
            id: session.id,
            userId: session.userId,
            userName: 'User ' + session.userId, // We'll need to fetch user details
            userEmail: session.userId + '@example.com', // Placeholder
            stationId: session.stationId,
            stationName: stationInfo
              ? `Station ${session.stationId} - ${stationInfo.name}`
              : `Station ${session.stationId}`,
            stationLocation: stationInfo
              ? stationInfo.address
              : 'Unknown Location',
            chargerId: `Auto-Generated`, // Backend auto generates this
            status:
              session.status === 'InProgress'
                ? 'Active'
                : session.status === 'Completed'
                ? 'Completed'
                : session.status,
            startTime: session.startTime,
            endTime: session.endTime,
            energyDelivered: session.energyConsumed || 0,
            estimatedDuration: 60, // Default estimate
            currentPower: session.status === 'InProgress' ? 50 : 0, // Assume 50kW when active
            cost: session.cost,
          }
        })

        setSessions(transformedSessions)

        // Update charging stations dashboard with only active sessions
        const activeSessions = transformedSessions.filter(
          (session) => session.status === 'Active'
        )

        console.log(
          '🔋 Active sessions for charging stations dashboard:',
          activeSessions
        )

        // Create charging stations from active sessions only
        const activeChargingStations = activeSessions.map((session, index) => ({
          id: session.stationId + '-' + session.id,
          name: `Station ${session.stationId} - Charger ${index + 1}`,
          status: 'charging',
          sessionId: session.id,
          power: session.currentPower + 'kW',
          timeRemaining: session.estimatedDuration,
          user: session.userName,
        }))

        // Only show active charging stations (no mock available/maintenance stations for now)
        // You can add available/maintenance stations from real station data if needed
        setChargingStations(activeChargingStations)

        console.log(
          '🔌 Updated charging stations dashboard:',
          activeChargingStations
        )
      } else {
        setError(result.error || 'Failed to load sessions')
        console.error('Error loading sessions:', result.error)
      }
    } catch (error) {
      setError('Failed to load sessions')
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStations = async () => {
    try {
      const result = await stationService.getAllStations()

      if (result.success) {
        const stationsData = result.data || []

        // Transform API data to match component format
        const transformedStations = stationsData.map((station) => ({
          id: station.id,
          name: station.name,
          location: station.address || 'Unknown Location',
          address: station.address,
          totalChargers: station.totalChargers || 0,
        }))

        setStations(transformedStations)
      } else {
        console.error('Error loading stations:', result.error)
      }
    } catch (error) {
      console.error('Error loading stations:', error)
    }
  }

  const searchUsers = async (term) => {
    console.log('🔍 Starting user search with term:', term)

    if (term.length < 2) {
      console.log('⚠️ Search term too short, clearing results')
      setUsers([])
      return
    }

    try {
      console.log('🌐 Calling sessionService.searchUsers...')
      const result = await sessionService.searchUsers(term)

      console.log('📊 Search result:', result)

      if (result.success) {
        const usersData = result.data || []
        console.log(`✅ Received ${usersData.length} users from API`)

        // Transform API data to match component format
        const transformedUsers = usersData.map((user) => ({
          id: user.id,
          fullName: user.fullName || user.name || 'Unknown User',
          email: user.email || '',
          phone: user.phone || '',
        }))

        console.log('🔄 Transformed users:', transformedUsers)
        setUsers(transformedUsers)
      } else {
        console.log('❌ Search failed:', result.error)
        setUsers([])
      }
    } catch (error) {
      console.error('💥 Search error:', error)
      setUsers([])
    }
  }

  const handleStopSession = async (sessionId) => {
    try {
      // Find the session to calculate cost
      const session = sessions.find((s) => s.id === sessionId)
      if (!session) {
        showToast.error('Không tìm thấy phiên sạc')
        return
      }

      // Calculate session duration and cost
      const startTime = new Date(session.startTime)
      const currentTime = new Date()
      const durationMs = currentTime - startTime
      const durationMinutes = Math.ceil(durationMs / (1000 * 60)) // Round up to nearest minute
      const costPerMinute = 500 // 500 VND per minute
      const totalCost = durationMinutes * costPerMinute

      console.log('🔋 Session stop calculation:')
      console.log('Start time:', startTime)
      console.log('Current time:', currentTime)
      console.log('Duration (minutes):', durationMinutes)
      console.log('Cost per minute:', costPerMinute)
      console.log('Total cost:', totalCost)

      // Set session data and show payment dialog
      setSessionToStop(session)
      setSessionCost(totalCost)
      setShowPaymentDialog(true)
    } catch (error) {
      showToast.error('Lỗi khi tính toán chi phí phiên sạc')
      console.error('Error calculating session cost:', error)
    }
  }

  const handlePaymentSuccess = async (paymentData) => {
    try {
      console.log('🎉 Payment successful, processing session completion...')
      console.log('Payment data from PaymentDialog:', paymentData)

      if (!sessionToStop) {
        showToast.error('Không tìm thấy thông tin phiên sạc')
        return
      }

      // Create payment record using the data already prepared by PaymentDialog
      const paymentRequestData = {
        sessionId: paymentData.sessionId, // Already set by PaymentDialog
        userId: paymentData.userId, // Already set by PaymentDialog
        userEmail:
          sessionToStop.userEmail || `${sessionToStop.userId}@example.com`,
        amount: sessionCost,
        paymentMethod: getPaymentMethodName(paymentData.method),
        paymentGateway: 'internal',
        description: paymentData.description, // Already set by PaymentDialog
        paymentType: paymentData.paymentType, // Already set by PaymentDialog
      }

      console.log(
        '🔍 Final payment request data to be sent to API:',
        paymentRequestData
      )
      const paymentResult = await paymentService.createPayment(
        paymentRequestData
      )

      if (paymentResult.success) {
        console.log('✅ Payment record created successfully')

        // Update session with completion
        const updateResult = await sessionService.stopSession(
          sessionToStop.id,
          100
        ) // Assume 100% SOC

        if (updateResult.success) {
          console.log('✅ Session updated successfully')

          // Reload sessions to get updated data
          await loadSessions()

          // Close payment dialog and reset state
          setShowPaymentDialog(false)
          setSessionToStop(null)
          setSessionCost(0)

          showToast.success(
            `Phiên sạc đã hoàn thành! Chi phí: ${formatCurrency(sessionCost)}`
          )
        } else {
          showToast.error(updateResult.error || 'Không thể cập nhật phiên sạc')
          console.error('Error updating session:', updateResult.error)
        }
      } else {
        showToast.error(
          paymentResult.error || 'Không thể tạo bản ghi thanh toán'
        )
        console.error('Error creating payment:', paymentResult.error)
      }
    } catch (error) {
      showToast.error('Lỗi khi xử lý thanh toán')
      console.error('Error handling payment success:', error)
    }
  }

  const getPaymentMethodName = (method) => {
    const methodMap = {
      cash: 'Tiền mặt',
      card: 'Thẻ tín dụng',
      momo: 'MoMo',
      zalopay: 'ZaloPay',
    }
    return methodMap[method] || 'Khác'
  }

  const loadUserVehicles = async (userId) => {
    try {
      console.log('🚗 Loading vehicles for user:', userId)
      const result = await vehicleService.getUserVehicles(userId)

      if (result.success) {
        setVehicles(result.data || [])
        console.log('✅ Vehicles loaded:', result.data)
      } else {
        console.error('❌ Error loading vehicles:', result.error)
        setVehicles([])
      }
    } catch (error) {
      console.error('❌ Error loading vehicles:', error)
      setVehicles([])
    }
  }

  const handleCreateSession = async () => {
    try {
      if (!selectedUser || !newSession.stationId || !selectedVehicle) {
        showToast.error('Please select a user, station, and vehicle')
        return
      }

      const sessionData = {
        userId: selectedUser.id,
        stationId: parseInt(newSession.stationId),
        SOCStart: selectedVehicle.currentBattery, // Use vehicle's current battery
      }

      console.log('Creating session:', sessionData)

      const result = await sessionService.startSession(sessionData)

      if (result.success) {
        // Reload sessions to get updated data including the new active session
        await loadSessions()

        // Reset form
        setNewSession({
          userId: '',
          stationId: '',
          vehicleId: '',
        })
        setSelectedUser(null)
        setSelectedVehicle(null)
        setUserSearchTerm('')
        setVehicles([])
        setShowCreateModal(false)

        showToast.success('Session created successfully')
      } else {
        showToast.error(result.error || 'Failed to create session')
        console.error('Error creating session:', result.error)
      }
    } catch (error) {
      showToast.error('Failed to create session')
      console.error('Error creating session:', error)
    }
  }

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.chargerId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStation =
      !selectedStation || session.stationId.toString() === selectedStation

    return matchesSearch && matchesStation
  })

  const getStatusBadge = (status) => {
    const variants = {
      Active: 'bg-green-100 text-green-800',
      Completed: 'bg-blue-100 text-blue-800',
      Cancelled: 'bg-red-100 text-red-800',
    }
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
  }

  const getStationStatusColor = (status) => {
    switch (status) {
      case 'charging':
        return 'bg-green-500'
      case 'available':
        return 'bg-blue-500'
      case 'maintenance':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
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
      {/* Charging Stations Dashboard */}
      <div>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
          Charging Stations Status
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {chargingStations.map((station) => (
            <Card key={station.id} className='p-4'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center space-x-2'>
                  <div
                    className={`w-3 h-3 rounded-full ${getStationStatusColor(
                      station.status
                    )}`}
                  ></div>
                  <span className='font-medium text-sm'>{station.name}</span>
                </div>
                <span className='text-xs text-gray-500'>{station.power}</span>
              </div>

              {station.status === 'charging' && (
                <div className='space-y-2'>
                  <div className='text-xs text-gray-600'>
                    <div>User: {station.user}</div>
                    <div>Time left: {station.timeRemaining}m</div>
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleStopSession(station.sessionId)}
                    className='w-full text-red-600 border-red-600 hover:bg-red-50'
                  >
                    <StopCircle className='w-4 h-4 mr-1' />
                    Stop
                  </Button>
                </div>
              )}

              {station.status === 'available' && (
                <div className='text-xs text-green-600 font-medium'>
                  Available
                </div>
              )}

              {station.status === 'maintenance' && (
                <div className='text-xs text-red-600 font-medium'>
                  Under Maintenance
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Sessions Management */}
      <div>
        <div className='flex justify-between items-center mb-6'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Session Management
          </h1>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className='w-4 h-4 mr-2' />
            Create Session
          </Button>
        </div>

        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4'>
            {error}
          </div>
        )}

        {/* Filters */}
        <Card className='p-4 mb-6'>
          <div className='flex flex-wrap gap-4'>
            <div className='flex-1 min-w-64'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
                <Input
                  placeholder='Search by user name, email, or charger ID...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {isAdmin && (
              <div>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value=''>All Stations</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      Station {station.id} - {station.location}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Sessions Table */}
        <Card>
          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    User
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Station & Charger
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Duration
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Energy
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Cost
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredSessions.map((session) => (
                  <tr key={session.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {session.userName}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {session.userEmail}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {session.stationName}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {session.stationLocation}
                        </div>
                        <div className='text-sm text-gray-500'>
                          Charger: {session.chargerId}
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {getStatusBadge(session.status)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      <div>
                        <div>
                          Start: {new Date(session.startTime).toLocaleString()}
                        </div>
                        {session.endTime && (
                          <div>
                            End: {new Date(session.endTime).toLocaleString()}
                          </div>
                        )}
                        {session.status === 'Active' && (
                          <div className='text-blue-600'>
                            Est: {session.estimatedDuration}min
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      <div>
                        <div>{session.energyDelivered} kWh</div>
                        {session.status === 'Active' && (
                          <div className='text-green-600'>
                            {session.currentPower}kW
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {session.cost ? formatCurrency(session.cost) : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      {session.status === 'Active' && (
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => handleStopSession(session.id)}
                          className='text-red-600 border-red-600 hover:bg-red-50'
                        >
                          <StopCircle className='w-4 h-4 mr-1' />
                          Stop
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Create Session Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Create New Session'
      >
        <div className='space-y-4'>
          {/* User Search */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Search Driver *
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                placeholder='Search by name, email, or phone...'
                value={userSearchTerm}
                onChange={(e) => {
                  setUserSearchTerm(e.target.value)
                  // Clear selected user when user starts typing
                  if (
                    selectedUser &&
                    e.target.value !== selectedUser.fullName
                  ) {
                    setSelectedUser(null)
                  }
                  searchUsers(e.target.value)
                }}
                className='pl-10'
              />
              {/* Clear button when user is selected */}
              {selectedUser && (
                <button
                  type='button'
                  onClick={() => {
                    setSelectedUser(null)
                    setSelectedVehicle(null)
                    setUserSearchTerm('')
                    setUsers([])
                    setVehicles([])
                  }}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  ✕
                </button>
              )}
            </div>

            {/* User search results dropdown */}
            {users.length > 0 && !selectedUser && (
              <div className='mt-2 border border-gray-200 rounded-md max-h-40 overflow-y-auto bg-white shadow-lg z-10'>
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedUser(user)
                      setUserSearchTerm(user.fullName)
                      setUsers([]) // Clear the dropdown
                      loadUserVehicles(user.id) // Auto-load user vehicles
                    }}
                    className='p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors'
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <div className='font-medium text-gray-900'>
                          {user.fullName}
                        </div>
                        <div className='text-sm text-gray-500'>
                          {user.email}
                        </div>
                        <div className='text-xs text-gray-400'>
                          📞 {user.phone}
                        </div>
                      </div>
                      <div className='text-blue-500 text-sm'>Select</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No users found message */}
            {userSearchTerm.length >= 2 &&
              users.length === 0 &&
              !selectedUser && (
                <div className='mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm'>
                  No users found for "{userSearchTerm}". Try searching by name,
                  email, or phone number.
                </div>
              )}

            {/* Selected user display */}
            {selectedUser && (
              <div className='mt-3 p-3 bg-green-50 border border-green-200 rounded-md'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='font-medium text-green-800'>
                      ✓ Selected: {selectedUser.fullName}
                    </div>
                    <div className='text-sm text-green-600'>
                      {selectedUser.email}
                    </div>
                    {selectedUser.phone && (
                      <div className='text-xs text-green-500'>
                        📞 {selectedUser.phone}
                      </div>
                    )}
                  </div>
                  <button
                    type='button'
                    onClick={() => {
                      setSelectedUser(null)
                      setSelectedVehicle(null)
                      setUserSearchTerm('')
                      setUsers([])
                      setVehicles([])
                    }}
                    className='text-green-600 hover:text-green-800 text-sm underline'
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Station Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Station *
            </label>
            <select
              value={newSession.stationId}
              onChange={(e) =>
                setNewSession((prev) => ({
                  ...prev,
                  stationId: e.target.value,
                }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              required
            >
              <option value=''>Select a station</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  Station {station.id} - {station.name || station.address}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Select Vehicle *
            </label>
            {selectedUser ? (
              <div className='space-y-3'>
                {/* Load vehicles button */}
                {vehicles.length === 0 && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => loadUserVehicles(selectedUser.id)}
                    className='w-full'
                  >
                    🚗 Load User Vehicles
                  </Button>
                )}

                {/* Vehicle selection */}
                {vehicles.length > 0 && (
                  <select
                    value={selectedVehicle?.id || ''}
                    onChange={(e) => {
                      const vehicleId = e.target.value
                      const vehicle = vehicles.find(
                        (v) => v.id.toString() === vehicleId
                      )
                      setSelectedVehicle(vehicle || null)
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                    required
                  >
                    <option value=''>Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.model} - Battery: {vehicle.currentBattery}% (
                        {vehicle.batteryCapacity}kWh)
                      </option>
                    ))}
                  </select>
                )}

                {/* Selected vehicle info */}
                {selectedVehicle && (
                  <div className='mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md'>
                    <div className='font-medium text-blue-800'>
                      ✓ Selected: {selectedVehicle.model}
                    </div>
                    <div className='text-sm text-blue-600'>
                      🔋 Current Battery: {selectedVehicle.currentBattery}%
                    </div>
                    <div className='text-xs text-blue-500'>
                      🔌 Connector: {selectedVehicle.connectorType}
                    </div>
                  </div>
                )}

                {/* No vehicles found */}
                {vehicles.length === 0 && selectedUser && (
                  <div className='mt-2 p-3 border border-amber-200 rounded-md bg-amber-50 text-amber-700 text-sm'>
                    No vehicles found for this user. The user needs to add a
                    vehicle first.
                  </div>
                )}
              </div>
            ) : (
              <div className='p-3 border border-gray-200 rounded-md bg-gray-50 text-gray-500 text-sm'>
                Please select a user first to load their vehicles.
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='flex justify-end space-x-4 pt-4'>
            <Button variant='outline' onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession}>Create Session</Button>
          </div>
        </div>
      </Modal>

      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => {
          setShowPaymentDialog(false)
          setSessionToStop(null)
          setSessionCost(0)
        }}
        onPaymentSuccess={handlePaymentSuccess}
        amount={sessionCost}
        paymentPurpose='session'
        sessionData={sessionToStop}
        subscriptionInfo={{
          customerName: sessionToStop?.userName || 'N/A',
          currentType: 'Phiên sạc',
          newType: `Hoàn thành phiên #${sessionToStop?.id}`,
        }}
      />
    </div>
  )
}

export default SessionManagement
