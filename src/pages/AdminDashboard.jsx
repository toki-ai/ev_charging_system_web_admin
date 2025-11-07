import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card.jsx'
import {
  Activity,
  DollarSign,
  Zap,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { mockStats } from '../constants/mockData.jsx'
import { formatCurrency } from '../utils/helpers.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
}) => {
  const isPositive = trendValue > 0

  return (
    <Card className='group hover:scale-105 transition-all duration-300'>
      <CardContent className='p-8'>
        <div className='flex items-center justify-between space-y-0 pb-4'>
          <h3 className='text-sm font-semibold text-slate-600 group-hover:text-slate-700 transition-colors duration-200'>
            {title}
          </h3>
          <div
            className={`p-3 rounded-2xl bg-gradient-to-r from-${color}-100 to-${color}-200 group-hover:shadow-lg transition-all duration-200`}
          >
            <Icon className={`h-6 w-6 text-${color}-600`} />
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <div className='text-3xl font-bold text-slate-900'>{value}</div>
          {trendValue && (
            <div
              className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${
                isPositive
                  ? 'text-emerald-700 bg-gradient-to-r from-emerald-100 to-emerald-200'
                  : 'text-red-700 bg-gradient-to-r from-red-100 to-red-200'
              }`}
            >
              {isPositive ? (
                <TrendingUp className='h-4 w-4 mr-1' />
              ) : (
                <TrendingDown className='h-4 w-4 mr-1' />
              )}
              {Math.abs(trendValue)}%
            </div>
          )}
        </div>
        {trend && <p className='text-xs text-gray-500 mt-1'>{trend}</p>}
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className='space-y-8'>
      <div className='text-center lg:text-left'>
        <h1 className='text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent'>
          Chào mừng trở lại, {user?.name}!
        </h1>
        <p className='text-slate-600 text-lg mt-2'>
          Tổng quan về mạng lưới trạm sạc của bạn hôm nay.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
        <StatCard
          title='Tổng số phiên sạc'
          value={mockStats.totalSessions.toLocaleString()}
          icon={Activity}
          trend='from last month'
          trendValue={mockStats.monthlyGrowth}
          color='primary'
        />
        <StatCard
          title='Tổng doanh thu'
          value={formatCurrency(mockStats.totalRevenue)}
          icon={DollarSign}
          trend='from last month'
          trendValue={mockStats.revenueGrowth}
          color='emerald'
        />
        <StatCard
          title='Trạm đang hoạt động'
          value={mockStats.activeChargers}
          icon={Zap}
          trend='out of 180 total'
          color='amber'
        />
        <StatCard
          title='Sự cố báo cáo'
          value={mockStats.reportedIssues}
          icon={AlertTriangle}
          trend='needs attention'
          color='red'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        <Card className='lg:col-span-2'>
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='flex items-center space-x-4'>
              <div className='h-3 w-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full animate-pulse'></div>
              <div className='flex-1'>
                <p className='text-sm font-semibold text-slate-900'>
                  Phiên sạc mới bắt đầu
                </p>
                <p className='text-xs text-gray-500'>
                  Downtown Central - 2 min ago
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='h-2 w-2 bg-blue-500 rounded-full'></div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Session completed</p>
                <p className='text-xs text-gray-500'>Airport Hub - 5 min ago</p>
              </div>
            </div>
            <div className='flex items-center space-x-3'>
              <div className='h-2 w-2 bg-red-500 rounded-full'></div>
              <div className='flex-1'>
                <p className='text-sm font-medium'>Issue reported</p>
                <p className='text-xs text-gray-500'>
                  Shopping Mall - 10 min ago
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <button className='w-full text-left p-3 rounded-lg border hover:bg-gray-50'>
              <p className='font-medium'>Add New Station</p>
              <p className='text-sm text-gray-500'>
                Register a new charging station
              </p>
            </button>
            <button className='w-full text-left p-3 rounded-lg border hover:bg-gray-50'>
              <p className='font-medium'>View Reports</p>
              <p className='text-sm text-gray-500'>
                Check usage and revenue reports
              </p>
            </button>
            <button className='w-full text-left p-3 rounded-lg border hover:bg-gray-50'>
              <p className='font-medium'>Manage Users</p>
              <p className='text-sm text-gray-500'>
                Add or edit staff accounts
              </p>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
