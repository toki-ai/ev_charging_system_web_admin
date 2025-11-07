import React, { useState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card.jsx'
import { Button } from '../components/ui/Button.jsx'
import { Badge } from '../components/ui/Badge.jsx'
import { Modal, ModalBody, ModalFooter } from '../components/ui/Modal.jsx'
import { Input, Label, FormGroup } from '../components/ui/Input.jsx'
import { Activity, Calendar, Plus, FileText, ShoppingCart } from 'lucide-react'
import { mockSessions } from '../constants/mockData.jsx'
import {
  formatCurrency,
  formatDate,
  getStatusColor,
} from '../utils/helpers.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const StatCard = ({ title, value, icon: Icon, color = 'emerald' }) => {
  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between space-y-0 pb-2'>
          <h3 className='text-sm font-medium text-gray-600'>{title}</h3>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div>
        <div className='text-2xl font-bold'>{value}</div>
      </CardContent>
    </Card>
  )
}

export default function StaffDashboard() {
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const staffSessions = mockSessions.filter(
    (session) =>
      session.createdBy === user?.email || session.stationId === user?.stationId
  )

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Welcome back, {user?.name}!
        </h1>
        <p className='text-gray-600'>
          Manage charging sessions at your station.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <StatCard title="Today's Sessions" value='12' icon={Activity} />
        <StatCard title='Active Now' value='3' icon={Activity} color='blue' />
        <StatCard
          title="Today's Revenue"
          value={formatCurrency(2450000)}
          icon={Activity}
          color='green'
        />
        <StatCard
          title='Pending Reports'
          value='2'
          icon={FileText}
          color='red'
        />
      </div>

      <div className='flex space-x-4'>
        <Button
          onClick={() => setShowCreateModal(true)}
          className='flex items-center'
        >
          <Plus className='h-4 w-4 mr-2' />
          Create Session
        </Button>
        <Button
          variant='outline'
          onClick={() => setShowReportModal(true)}
          className='flex items-center'
        >
          <FileText className='h-4 w-4 mr-2' />
          Report Issue
        </Button>
        <Button variant='outline' className='flex items-center'>
          <Calendar className='h-4 w-4 mr-2' />
          View Calendar
        </Button>
        <Button variant='outline' className='flex items-center'>
          <ShoppingCart className='h-4 w-4 mr-2' />
          Manage Packages
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {staffSessions.map((session) => (
              <div
                key={session.id}
                className='flex items-center justify-between p-4 border rounded-lg'
              >
                <div>
                  <p className='font-medium'>
                    #{session.id} - {session.userName}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {session.chargerId} • {formatDate(session.startTime)}
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <Badge className={getStatusColor(session.status)}>
                    {session.status}
                  </Badge>
                  {session.status === 'Active' && (
                    <Button size='sm' variant='outline'>
                      Stop
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Session Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title='Create New Session'
      >
        <ModalBody>
          <div className='space-y-4'>
            <FormGroup>
              <Label htmlFor='chargerId'>Charger ID</Label>
              <Input placeholder='e.g., DC-001' />
            </FormGroup>
            <FormGroup>
              <Label htmlFor='userName'>Customer Name</Label>
              <Input placeholder='Enter customer name' />
            </FormGroup>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowCreateModal(false)}>
            Create Session
          </Button>
        </ModalFooter>
      </Modal>

      {/* Report Issue Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title='Report Issue'
      >
        <ModalBody>
          <div className='space-y-4'>
            <FormGroup>
              <Label htmlFor='issueType'>Issue Type</Label>
              <select className='flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm'>
                <option value='Technical'>Technical Issue</option>
                <option value='Maintenance'>Maintenance Required</option>
                <option value='Safety'>Safety Concern</option>
              </select>
            </FormGroup>
            <FormGroup>
              <Label htmlFor='description'>Description</Label>
              <textarea
                className='flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm'
                placeholder='Describe the issue...'
              />
            </FormGroup>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant='outline' onClick={() => setShowReportModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => setShowReportModal(false)}>
            Submit Report
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
