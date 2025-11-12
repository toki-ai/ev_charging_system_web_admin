import React, { useState, useEffect } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Wrench,
  Filter,
} from 'lucide-react'
import { maintenanceService } from '../services/apiService'
import { showToast } from '../utils/toast'

const MaintenanceLog = () => {
  const [maintenanceLogs, setMaintenanceLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedLog, setSelectedLog] = useState(null)
  const [updateForm, setUpdateForm] = useState({
    status: '',
    resolution: '',
    technician: '',
    completedAt: '',
  })

  useEffect(() => {
    loadMaintenanceLogs()
  }, [])

  const loadMaintenanceLogs = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Loading maintenance logs...')
      const result = await maintenanceService.getAllMaintenanceLogs()

      console.log('Maintenance logs result:', result)

      if (result.success) {
        console.log('Maintenance logs data:', result.data)
        setMaintenanceLogs(result.data)
      } else {
        setError(result.error)
        showToast.error('Failed to load maintenance logs: ' + result.error)
      }
    } catch (error) {
      const errorMessage = 'Failed to load maintenance logs'
      setError(errorMessage)
      showToast.error(errorMessage)
      console.error('Error loading maintenance logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (log) => {
    setSelectedLog(log)
    setUpdateForm({
      status: log.status,
      resolution: log.notes || '',
      technician: log.technicianName || '',
      completedAt: log.completedDate || '',
    })
    setShowDetailsModal(true)
  }

  const handleUpdateStatus = async () => {
    try {
      if (!updateForm.status) {
        showToast.error('Please select a status')
        return
      }

      const result = await maintenanceService.updateMaintenanceLog(
        selectedLog.id,
        updateForm
      )

      if (result.success) {
        showToast.success('Maintenance log updated successfully')
        setShowDetailsModal(false)
        await loadMaintenanceLogs()
      } else {
        showToast.error('Failed to update maintenance log: ' + result.error)
      }
    } catch (error) {
      showToast.error('Failed to update maintenance log')
      console.error('Error updating maintenance log:', error)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      Pending: 'bg-yellow-100 text-yellow-800',
      InProgress: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-gray-100 text-gray-800',
    }
    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    )
  }

  const getSeverityBadge = (type) => {
    const variants = {
      Scheduled: 'bg-green-100 text-green-800',
      Emergency: 'bg-red-100 text-red-800',
      Repair: 'bg-orange-100 text-orange-800',
      'Hardware Malfunction': 'bg-red-100 text-red-800',
      'Software Error': 'bg-yellow-100 text-yellow-800',
      'Connector Issue': 'bg-orange-100 text-orange-800',
      'Power Supply Problem': 'bg-red-100 text-red-800',
      'Display/Interface Issue': 'bg-yellow-100 text-yellow-800',
      'Network Connectivity': 'bg-blue-100 text-blue-800',
      'Physical Damage': 'bg-red-100 text-red-800',
      Other: 'bg-gray-100 text-gray-800',
    }
    return (
      <Badge className={variants[type] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className='w-4 h-4 text-yellow-600' />
      case 'InProgress':
        return <Wrench className='w-4 h-4 text-blue-600' />
      case 'Completed':
        return <CheckCircle className='w-4 h-4 text-green-600' />
      default:
        return <AlertTriangle className='w-4 h-4 text-gray-600' />
    }
  }

  // Filter maintenance logs
  const filteredLogs = maintenanceLogs.filter((log) => {
    const matchesSearch =
      log.stationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.chargerId
        ?.toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      log.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.title?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      selectedStatus === 'all' || log.status === selectedStatus
    // Note: Backend doesn't have severity field, using Type instead
    const matchesSeverity =
      selectedSeverity === 'all' || log.type === selectedSeverity

    return matchesSearch && matchesStatus && matchesSeverity
  })

  // Default filter to show only non-successful logs
  const defaultFilteredLogs =
    selectedStatus === 'all' && selectedSeverity === 'all'
      ? filteredLogs.filter((log) => log.status !== 'Completed')
      : filteredLogs

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
        <h1 className='text-3xl font-bold text-gray-900'>Maintenance Log</h1>
      </div>

      {error && (
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      <Card className='p-4'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
          <div className='lg:col-span-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <Input
                placeholder='Search by station, charger, issue type...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>All Statuses</option>
              <option value='Pending'>Pending</option>
              <option value='InProgress'>In Progress</option>
              <option value='Completed'>Completed</option>
            </select>
          </div>

          <div>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>All Severity</option>
              <option value='Low'>Low</option>
              <option value='Medium'>Medium</option>
              <option value='High'>High</option>
              <option value='Critical'>Critical</option>
            </select>
          </div>
        </div>

        <div className='mt-3 flex items-center text-sm text-gray-600'>
          <Filter className='w-4 h-4 mr-2' />
          {selectedStatus === 'all' && selectedSeverity === 'all'
            ? 'Showing non-completed maintenance logs by default'
            : `Filtered by ${
                selectedStatus !== 'all' ? `status: ${selectedStatus}` : ''
              } ${
                selectedSeverity !== 'all'
                  ? `severity: ${selectedSeverity}`
                  : ''
              }`}
          <span className='ml-2 text-gray-400'>
            ({defaultFilteredLogs.length} logs)
          </span>
        </div>
      </Card>

      <div className='space-y-4'>
        {defaultFilteredLogs.length === 0 ? (
          <Card className='p-8 text-center'>
            <AlertTriangle className='w-12 h-12 text-gray-400 mx-auto mb-4' />
            <p className='text-gray-600'>No maintenance logs found.</p>
          </Card>
        ) : (
          defaultFilteredLogs.map((log) => (
            <Card key={log.id} className='p-6'>
              <div className='flex items-start justify-between mb-4'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    {getStatusIcon(log.status)}
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {log.stationName} -{' '}
                      {log.chargerNumber || `Charger ${log.chargerId}`}
                    </h3>
                    {getStatusBadge(log.status)}
                    {getSeverityBadge(log.type)}
                  </div>
                  <p className='text-sm text-gray-600 mb-2'>
                    <span className='font-medium'>Issue:</span> {log.type}
                  </p>
                  <p className='text-sm text-gray-700'>{log.description}</p>
                </div>
                <Button
                  size='sm'
                  onClick={() => handleViewDetails(log)}
                  className='ml-4'
                >
                  <Eye className='w-4 h-4 mr-2' />
                  View Details
                </Button>
              </div>

              <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
                <div>
                  <span className='text-gray-500'>Scheduled:</span>
                  <p className='font-medium'>
                    {log.scheduledDate
                      ? new Date(log.scheduledDate).toLocaleDateString()
                      : 'N/A'}
                  </p>
                  <p className='text-xs text-gray-500'>{log.technicianName}</p>
                </div>
                <div>
                  <span className='text-gray-500'>Assigned To:</span>
                  <p className='font-medium'>
                    {log.technicianName || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <span className='text-gray-500'>Est. Completion:</span>
                  <p className='font-medium'>
                    {log.scheduledDate
                      ? new Date(log.scheduledDate).toLocaleDateString()
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <span className='text-gray-500'>Completed:</span>
                  <p className='font-medium'>
                    {log.completedDate
                      ? new Date(log.completedDate).toLocaleDateString()
                      : 'In Progress'}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Details and Update Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title='Maintenance Details'
      >
        {selectedLog && (
          <div className='space-y-6'>
            {/* Log Information */}
            <div className='bg-gray-50 p-4 rounded-lg'>
              <h4 className='font-semibold text-gray-900 mb-3'>
                Issue Information
              </h4>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-gray-500'>Station:</span>
                  <p className='font-medium'>{selectedLog.stationName}</p>
                </div>
                <div>
                  <span className='text-gray-500'>Charger:</span>
                  <p className='font-medium'>{selectedLog.chargerId}</p>
                </div>
                <div>
                  <span className='text-gray-500'>Issue Type:</span>
                  <p className='font-medium'>{selectedLog.type}</p>
                </div>
                <div>
                  <span className='text-gray-500'>Severity:</span>
                  <div className='mt-1'>
                    {getSeverityBadge(selectedLog.type)}
                  </div>
                </div>
              </div>
              <div className='mt-4'>
                <span className='text-gray-500'>Description:</span>
                <p className='mt-1 text-gray-700'>{selectedLog.description}</p>
              </div>
            </div>

            {/* Update Form */}
            <div className='space-y-4'>
              <h4 className='font-semibold text-gray-900'>Update Status</h4>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Status
                </label>
                <select
                  value={updateForm.status}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  <option value='Pending'>Pending</option>
                  <option value='InProgress'>In Progress</option>
                  <option value='Completed'>Completed</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Assigned Technician
                </label>
                <Input
                  value={updateForm.technician}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      technician: e.target.value,
                    }))
                  }
                  placeholder='Enter technician name'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Resolution Details
                </label>
                <textarea
                  value={updateForm.resolution}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      resolution: e.target.value,
                    }))
                  }
                  placeholder='Describe the resolution or work performed...'
                  rows={4}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              {updateForm.status === 'Completed' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Completion Date
                  </label>
                  <Input
                    type='datetime-local'
                    value={updateForm.completedAt}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        completedAt: e.target.value,
                      }))
                    }
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className='flex justify-end space-x-4 pt-4 border-t'>
              <Button
                variant='outline'
                onClick={() => setShowDetailsModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus}>Update Status</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MaintenanceLog
