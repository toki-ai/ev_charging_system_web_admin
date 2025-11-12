import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import {
  Search,
  AlertTriangle,
  Wrench,
  MapPin,
  Clock,
  Edit,
  Settings,
} from 'lucide-react'
import { stationService, maintenanceService } from '../services/apiService'
import { authService } from '../services/authService'
import { showToast } from '../utils/toast'

const StationManagement = () => {
  const [stations, setStations] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEditStationModal, setShowEditStationModal] = useState(false)
  const [showChargerStatusModal, setShowChargerStatusModal] = useState(false)
  const [selectedCharger, setSelectedCharger] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)

  const [reportForm, setReportForm] = useState({
    issueType: '',
    description: '',
    severity: 'Medium',
  })

  const [editStationForm, setEditStationForm] = useState({
    name: '',
    address: '',
    pricePerKwh: '',
    operatorName: '',
    operatorPhone: '',
    hasParking: false,
    hasRestroom: false,
    hasWifi: false,
    description: '',
  })

  const [chargerStatusForm, setChargerStatusForm] = useState({
    status: '',
  })

  useEffect(() => {
    loadStations()
  }, [])

  const loadStations = async () => {
    try {
      setLoading(true)
      setError('')
      const result = await stationService.getAllStations()

      if (result.success) {
        setStations(result.data)
      } else {
        setError(result.error)
        showToast.error('Failed to load stations: ' + result.error)
      }
    } catch (error) {
      const errorMessage = 'Failed to load stations'
      setError(errorMessage)
      showToast.error(errorMessage)
      console.error('Error loading stations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStation = (station) => {
    setSelectedStation(station)
    setEditStationForm({
      name: station.name || '',
      address: station.address || '',
      pricePerKwh: station.pricePerKwh || '',
      operatorName: station.operatorName || '',
      operatorPhone: station.operatorPhone || '',
      hasParking: station.hasParking || false,
      hasRestroom: station.hasRestroom || false,
      hasWifi: station.hasWifi || false,
      description: station.description || '',
    })
    setShowEditStationModal(true)
  }

  const handleUpdateStation = async () => {
    try {
      if (!editStationForm.name || !editStationForm.address) {
        showToast.error('Please fill in all required fields')
        return
      }

      const result = await stationService.updateStation(
        selectedStation.id,
        editStationForm
      )

      if (result.success) {
        showToast.success('Station updated successfully')
        setShowEditStationModal(false)
        await loadStations()
      } else {
        showToast.error('Failed to update station: ' + result.error)
      }
    } catch (error) {
      showToast.error('Failed to update station')
      console.error('Error updating station:', error)
    }
  }

  const handleChargerStatusChange = (charger, station) => {
    setSelectedCharger({
      ...charger,
      stationName: station.name,
      stationId: station.id,
    })
    setChargerStatusForm({ status: charger.status })
    setShowChargerStatusModal(true)
  }

  const handleUpdateChargerStatus = async () => {
    try {
      // Debug: check current user role
      const userData = JSON.parse(localStorage.getItem('user_data') || '{}')
      const token = localStorage.getItem('auth_token')

      console.log('=== DEBUG UPDATE CHARGER STATUS ===')
      console.log('Current user data:', userData)
      console.log('User role:', userData.role)
      console.log('Token exists:', !!token)
      console.log('Token preview:', token?.substring(0, 50) + '...')

      // Decode JWT to check expiry
      if (token) {
        try {
          const base64Url = token.split('.')[1]
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
              })
              .join('')
          )
          const decoded = JSON.parse(jsonPayload)

          console.log('Decoded token:', decoded)
          console.log('Token exp (timestamp):', decoded.exp)
          console.log(
            'Current time (timestamp):',
            Math.floor(Date.now() / 1000)
          )
          console.log(
            'Token expired:',
            decoded.exp < Math.floor(Date.now() / 1000)
          )

          if (decoded.exp < Math.floor(Date.now() / 1000)) {
            showToast.error('Token expired! Please login again.')
            return
          }
        } catch (e) {
          console.error('Error decoding token:', e)
        }
      }

      console.log(
        'Updating charger:',
        selectedCharger.id,
        'to status:',
        chargerStatusForm.status
      )
      console.log(
        'API URL will be:',
        `${
          process.env.REACT_APP_API_GATEWAY_URL || 'https://localhost:5000/api'
        }/stations/chargers/${selectedCharger.id}/status`
      )

      if (chargerStatusForm.status === 'Maintenance') {
        setShowChargerStatusModal(false)
        handleReportIssue(selectedCharger, {
          id: selectedCharger.stationId,
          name: selectedCharger.stationName,
        })
        return
      }

      const result = await stationService.updateChargerStatus(
        selectedCharger.id,
        chargerStatusForm.status
      )

      console.log('Update result:', result)

      if (result.success) {
        showToast.success('Charger status updated successfully')
        setShowChargerStatusModal(false)
        await loadStations()
      } else {
        showToast.error('Failed to update charger status: ' + result.error)
        // Show detailed error in console
        console.error('Failed to update charger status:', result.error)
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.Error ||
        error.response?.data?.message ||
        error.message ||
        'Unknown error'
      showToast.error(`API Error: ${error.response?.status} - ${errorMsg}`)
      console.error('Error updating charger status:', error)
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
      })
    }
  }

  const handleReportIssue = (charger, station) => {
    setSelectedCharger({
      ...charger,
      stationName: station.name,
      stationId: station.id,
    })
    setReportForm({
      issueType: '',
      description: '',
      severity: 'Medium',
    })
    setShowReportModal(true)
  }

  const submitMaintenanceReport = async () => {
    try {
      if (!reportForm.issueType || !reportForm.description) {
        showToast.error('Please fill all required fields')
        return
      }

      const maintenanceData = {
        StationId: selectedCharger.stationId,
        ChargerId: selectedCharger.id,
        Title: `${reportForm.issueType} - Charger ${selectedCharger.chargerNumber}`,
        Description: reportForm.description,
        Type: reportForm.issueType,
        TechnicianId: 'system',
        TechnicianName: 'System Auto-Generated',
        ScheduledDate: new Date().toISOString(),
        Notes: `Severity: ${reportForm.severity}`,
      }

      const result = await maintenanceService.createMaintenanceLog(
        maintenanceData
      )

      if (result.success) {
        showToast.success('Maintenance report submitted successfully')
        setShowReportModal(false)
        await stationService.updateChargerStatus(
          selectedCharger.id,
          'Maintenance'
        )
        await loadStations()
      } else {
        showToast.error('Failed to submit maintenance report: ' + result.error)
      }
    } catch (error) {
      showToast.error('Failed to submit maintenance report')
      console.error('Error submitting maintenance report:', error)
    }
  }

  const getChargerStatusBadge = (status) => {
    const variants = {
      Available: 'bg-green-100 text-green-800',
      InUse: 'bg-blue-100 text-blue-800',
      Charging: 'bg-blue-100 text-blue-800',
      Offline: 'bg-gray-100 text-gray-800',
      Maintenance: 'bg-yellow-100 text-yellow-800',
      Error: 'bg-red-100 text-red-800',
    }
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
  }

  const getStationStatusBadge = (status) => {
    const variants = {
      Active: 'bg-green-100 text-green-800',
      Maintenance: 'bg-yellow-100 text-yellow-800',
      Inactive: 'bg-red-100 text-red-800',
    }
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
  }

  const filteredStations = stations.filter(
    (station) =>
      station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl font-bold text-gray-900'>Station Management</h1>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      <Card className='p-4'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <Input
            placeholder='Search stations by name or location...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </Card>

      <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
        {filteredStations.map((station) => (
          <Card key={station.id} className='p-6'>
            <div className='flex justify-between items-start mb-4'>
              <div className='flex-1'>
                <div className='flex items-center gap-2 mb-2'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Station {station.id} - {station.name}
                  </h3>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => handleEditStation(station)}
                    className='p-1'
                  >
                    <Edit className='w-4 h-4' />
                  </Button>
                </div>
                <p className='text-sm text-gray-600 flex items-center mt-1'>
                  <MapPin className='w-4 h-4 mr-1' />
                  {station.address}
                </p>
              </div>
              {getStationStatusBadge(station.status)}
            </div>

            <div className='grid grid-cols-2 gap-4 mb-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {station.availableChargers || 0}
                </div>
                <div className='text-xs text-gray-500'>Available</div>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-gray-700'>
                  {station.totalChargers || 0}
                </div>
                <div className='text-xs text-gray-500'>Total Chargers</div>
              </div>
            </div>

            <div>
              <h4 className='font-medium text-gray-900 mb-2'>Chargers</h4>
              <div className='space-y-2 max-h-64 overflow-y-auto'>
                {station.chargers?.map((charger) => (
                  <div
                    key={charger.id}
                    className='flex items-center justify-between p-2 bg-gray-50 rounded'
                  >
                    <div className='flex items-center space-x-3'>
                      <div>
                        <div className='font-medium text-sm'>
                          {charger.chargerNumber}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {charger.connectorType} • {charger.maxPowerKw}kW
                        </div>
                        <div className='text-xs text-gray-400 flex items-center'>
                          <Clock className='w-3 h-3 mr-1' />
                          Last check:{' '}
                          {charger.lastUpdated
                            ? new Date(charger.lastUpdated).toLocaleDateString()
                            : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() =>
                          handleChargerStatusChange(charger, station)
                        }
                        className='flex items-center space-x-1'
                      >
                        {getChargerStatusBadge(charger.status)}
                        <Settings className='w-3 h-3 text-gray-400' />
                      </button>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleReportIssue(charger, station)}
                        className='text-red-600 border-red-600 hover:bg-red-50'
                      >
                        <AlertTriangle className='w-3 h-3 mr-1' />
                        Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-4 pt-4 border-t border-gray-200'>
              <div className='text-xs text-gray-500 grid grid-cols-2 gap-2'>
                <div>
                  Price:{' '}
                  {station.pricePerKwh
                    ? `${station.pricePerKwh} VND/kWh`
                    : 'N/A'}
                </div>
                <div>Operator: {station.operatorName || 'N/A'}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Station Modal */}
      <Modal
        isOpen={showEditStationModal}
        onClose={() => setShowEditStationModal(false)}
        title='Edit Station Information'
      >
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Station Name *
              </label>
              <Input
                value={editStationForm.name}
                onChange={(e) =>
                  setEditStationForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder='Enter station name'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Price per kWh
              </label>
              <Input
                type='number'
                value={editStationForm.pricePerKwh}
                onChange={(e) =>
                  setEditStationForm((prev) => ({
                    ...prev,
                    pricePerKwh: e.target.value,
                  }))
                }
                placeholder='Enter price per kWh'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Address *
            </label>
            <Input
              value={editStationForm.address}
              onChange={(e) =>
                setEditStationForm((prev) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              placeholder='Enter station address'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Operator Name
              </label>
              <Input
                value={editStationForm.operatorName}
                onChange={(e) =>
                  setEditStationForm((prev) => ({
                    ...prev,
                    operatorName: e.target.value,
                  }))
                }
                placeholder='Enter operator name'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Operator Phone
              </label>
              <Input
                value={editStationForm.operatorPhone}
                onChange={(e) =>
                  setEditStationForm((prev) => ({
                    ...prev,
                    operatorPhone: e.target.value,
                  }))
                }
                placeholder='Enter operator phone'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Description
            </label>
            <textarea
              value={editStationForm.description}
              onChange={(e) =>
                setEditStationForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              placeholder='Enter station description'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Amenities
            </label>
            <div className='space-y-2'>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={editStationForm.hasParking}
                  onChange={(e) =>
                    setEditStationForm((prev) => ({
                      ...prev,
                      hasParking: e.target.checked,
                    }))
                  }
                  className='mr-2'
                />
                Parking Available
              </label>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={editStationForm.hasRestroom}
                  onChange={(e) =>
                    setEditStationForm((prev) => ({
                      ...prev,
                      hasRestroom: e.target.checked,
                    }))
                  }
                  className='mr-2'
                />
                Restroom Available
              </label>
              <label className='flex items-center'>
                <input
                  type='checkbox'
                  checked={editStationForm.hasWifi}
                  onChange={(e) =>
                    setEditStationForm((prev) => ({
                      ...prev,
                      hasWifi: e.target.checked,
                    }))
                  }
                  className='mr-2'
                />
                Wi-Fi Available
              </label>
            </div>
          </div>

          <div className='flex justify-end space-x-4 pt-4'>
            <Button
              variant='outline'
              onClick={() => setShowEditStationModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStation}>Update Station</Button>
          </div>
        </div>
      </Modal>

      {/* Charger Status Modal */}
      <Modal
        isOpen={showChargerStatusModal}
        onClose={() => setShowChargerStatusModal(false)}
        title='Update Charger Status'
      >
        {selectedCharger && (
          <div className='space-y-4'>
            <div className='bg-gray-50 p-3 rounded'>
              <div className='font-medium'>{selectedCharger.stationName}</div>
              <div className='text-sm text-gray-600'>
                Charger: {selectedCharger.chargerNumber} (
                {selectedCharger.connectorType} • {selectedCharger.maxPowerKw}
                kW)
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                New Status
              </label>
              <select
                value={chargerStatusForm.status}
                onChange={(e) =>
                  setChargerStatusForm((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='Available'>Available</option>
                <option value='InUse'>In Use</option>
                <option value='Offline'>Offline</option>
                <option value='Maintenance'>Maintenance</option>
              </select>
            </div>

            {chargerStatusForm.status === 'Maintenance' && (
              <div className='bg-yellow-50 border border-yellow-200 p-3 rounded'>
                <p className='text-sm text-yellow-800'>
                  Setting status to "Maintenance" will open a maintenance report
                  form.
                </p>
              </div>
            )}

            <div className='flex justify-end space-x-4 pt-4'>
              <Button
                variant='outline'
                onClick={() => setShowChargerStatusModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateChargerStatus}>Update Status</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Report Maintenance Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title='Report Maintenance Issue'
      >
        {selectedCharger && (
          <div className='space-y-4'>
            <div className='bg-gray-50 p-3 rounded'>
              <div className='font-medium'>{selectedCharger.stationName}</div>
              <div className='text-sm text-gray-600'>
                Charger: {selectedCharger.chargerNumber || selectedCharger.id} (
                {selectedCharger.connectorType || selectedCharger.type} •{' '}
                {selectedCharger.maxPowerKw || selectedCharger.power}kW)
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Issue Type *
              </label>
              <select
                value={reportForm.issueType}
                onChange={(e) =>
                  setReportForm((prev) => ({
                    ...prev,
                    issueType: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              >
                <option value=''>Select issue type</option>
                <option value='Hardware Malfunction'>
                  Hardware Malfunction
                </option>
                <option value='Software Error'>Software Error</option>
                <option value='Connector Issue'>Connector Issue</option>
                <option value='Power Supply Problem'>
                  Power Supply Problem
                </option>
                <option value='Display/Interface Issue'>
                  Display/Interface Issue
                </option>
                <option value='Network Connectivity'>
                  Network Connectivity
                </option>
                <option value='Physical Damage'>Physical Damage</option>
                <option value='Other'>Other</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Severity
              </label>
              <select
                value={reportForm.severity}
                onChange={(e) =>
                  setReportForm((prev) => ({
                    ...prev,
                    severity: e.target.value,
                  }))
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='Low'>Low</option>
                <option value='Medium'>Medium</option>
                <option value='High'>High</option>
                <option value='Critical'>Critical</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description *
              </label>
              <textarea
                value={reportForm.description}
                onChange={(e) =>
                  setReportForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder='Describe the issue in detail...'
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>

            <div className='flex justify-end space-x-4 pt-4'>
              <Button
                variant='outline'
                onClick={() => setShowReportModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={submitMaintenanceReport}>
                <Wrench className='w-4 h-4 mr-2' />
                Submit Report
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StationManagement
