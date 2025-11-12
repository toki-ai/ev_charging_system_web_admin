import React, { useState, useEffect } from 'react'
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
  BarChart3,
  PieChart,
  MapPin,
  Car,
  Loader2,
} from 'lucide-react'
import { formatCurrency } from '../utils/helpers.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { dashboardService } from '../services/dashboardService.js'

// Mock data cho reports
const mockReports = {
  usageReport: [
    { station: 'Station 1 - Tân Sơn Nhất', usage: 85, sessions: 245 },
    { station: 'Station 2 - Quận 1', usage: 92, sessions: 312 },
    { station: 'Station 3 - Quận 7', usage: 78, sessions: 198 },
    { station: 'Station 4 - Thủ Đức', usage: 88, sessions: 267 },
    { station: 'Station 5 - Bình Thạnh', usage: 75, sessions: 189 },
  ],
  vehicleReport: [
    { model: 'Tesla Model 3', count: 142, percentage: 35.5 },
    { model: 'VinFast VF8', count: 89, percentage: 22.2 },
    { model: 'BMW i3', count: 67, percentage: 16.8 },
    { model: 'Hyundai Kona EV', count: 52, percentage: 13.0 },
    { model: 'Others', count: 50, percentage: 12.5 },
  ],
  revenueReport: {
    daily: [
      { day: 'Mon', amount: 2450000 },
      { day: 'Tue', amount: 3200000 },
      { day: 'Wed', amount: 2800000 },
      { day: 'Thu', amount: 3500000 },
      { day: 'Fri', amount: 4200000 },
      { day: 'Sat', amount: 5100000 },
      { day: 'Sun', amount: 4800000 },
    ],
    monthly: 98500000,
    growth: 12.5,
  },
}

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

// Usage Report Component - Updated to use real data
const UsageReport = ({ dashboardData }) => {
  // If we have real station data, use it; otherwise show fallback message
  if (!dashboardData?.stations?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <BarChart3 className='h-5 w-5 text-blue-600' />
            Báo cáo mức độ sử dụng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <AlertTriangle className='mx-auto h-12 w-12 text-amber-500 mb-4' />
            <p className='text-gray-500'>
              {dashboardData?.stations?.error ||
                'Không thể tải dữ liệu trạm sạc'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const stations = dashboardData.stations.data.stations || []
  const sessionsData = dashboardData?.sessions?.data?.sessionsByStation || {}

  // Create usage report from real data
  const usageReport = stations.slice(0, 5).map((station) => {
    const stationSessions = sessionsData[station.id] || {}
    const usage =
      station.totalChargers > 0
        ? Math.round(
            ((station.totalChargers - station.availableChargers) /
              station.totalChargers) *
              100
          )
        : 0

    return {
      station: `${station.name}`,
      usage: Math.min(usage, 100), // Cap at 100%
      sessions: stationSessions.totalSessions || 0,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <BarChart3 className='h-5 w-5 text-blue-600' />
          Báo cáo mức độ sử dụng (Dữ liệu thực)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {usageReport.length > 0 ? (
            usageReport.map((station, index) => (
              <div key={index} className='flex items-center justify-between'>
                <div className='flex-1'>
                  <div className='font-medium text-sm'>{station.station}</div>
                  <div className='text-xs text-gray-500'>
                    {station.sessions} phiên sạc
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='w-24 bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full'
                      style={{ width: `${station.usage}%` }}
                    ></div>
                  </div>
                  <span className='text-sm font-medium w-12 text-right'>
                    {station.usage}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className='text-center py-4 text-gray-500'>
              Không có dữ liệu trạm sạc
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Vehicle Report Component
const VehicleReport = () => (
  <Card>
    <CardHeader>
      <CardTitle className='flex items-center gap-2'>
        <Car className='h-5 w-5 text-green-600' />
        Loại xe sạc nhiều nhất
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className='space-y-3'>
        {mockReports.vehicleReport.map((vehicle, index) => (
          <div
            key={index}
            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
          >
            <div className='flex items-center gap-3'>
              <div
                className={`w-3 h-3 rounded-full ${
                  index === 0
                    ? 'bg-green-500'
                    : index === 1
                    ? 'bg-blue-500'
                    : index === 2
                    ? 'bg-purple-500'
                    : index === 3
                    ? 'bg-orange-500'
                    : 'bg-gray-400'
                }`}
              ></div>
              <div>
                <div className='font-medium text-sm'>{vehicle.model}</div>
                <div className='text-xs text-gray-500'>
                  {vehicle.count} lượt sạc
                </div>
              </div>
            </div>
            <div className='text-sm font-medium'>{vehicle.percentage}%</div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

// Revenue Report Component - Updated to show payment method breakdown
const RevenueReport = ({ dashboardData }) => {
  if (!dashboardData?.payments?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5 text-emerald-600' />
            Báo cáo doanh thu theo phương thức thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <AlertTriangle className='mx-auto h-12 w-12 text-amber-500 mb-4' />
            <p className='text-gray-500'>
              {dashboardData?.payments?.error ||
                'Không thể tải dữ liệu thanh toán'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const paymentData = dashboardData.payments.data
  const paymentMethodStats = paymentData.paymentMethodStats || []
  const totalRevenue = paymentData.totalRevenue || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <DollarSign className='h-5 w-5 text-emerald-600' />
          Doanh thu theo phương thức thanh toán (Dữ liệu thực)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='flex justify-between items-center mb-4'>
            <span className='text-2xl font-bold text-emerald-600'>
              {formatCurrency(totalRevenue)}
            </span>
            <span className='text-sm text-gray-500'>
              Tổng {paymentData.stats?.totalPayments || 0} giao dịch
            </span>
          </div>

          <div className='space-y-3'>
            {paymentMethodStats.length > 0 ? (
              paymentMethodStats.map((methodStat, index) => {
                const colors = [
                  'bg-emerald-500',
                  'bg-blue-500',
                  'bg-purple-500',
                  'bg-orange-500',
                  'bg-gray-500',
                ]
                const bgColors = [
                  'bg-emerald-50 border-emerald-200',
                  'bg-blue-50 border-blue-200',
                  'bg-purple-50 border-purple-200',
                  'bg-orange-50 border-orange-200',
                  'bg-gray-50 border-gray-200',
                ]

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      bgColors[index % bgColors.length]
                    }`}
                  >
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-3'>
                        <div
                          className={`w-4 h-4 rounded ${
                            colors[index % colors.length]
                          }`}
                        ></div>
                        <div>
                          <div className='font-medium text-sm'>
                            {methodStat.method}
                          </div>
                          <div className='text-xs text-gray-500'>
                            {methodStat.count} giao dịch
                          </div>
                        </div>
                      </div>
                      <div className='text-right'>
                        <div className='font-bold text-sm'>
                          {methodStat.percentage}%
                        </div>
                        <div className='text-xs text-gray-600'>
                          {formatCurrency(methodStat.amount)}
                        </div>
                      </div>
                    </div>
                    <div className='mt-2'>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className={`h-2 rounded-full ${
                            colors[index % colors.length]
                          }`}
                          style={{ width: `${methodStat.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className='text-center py-4 text-gray-500'>
                Chưa có dữ liệu thanh toán
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Revenue Source Report Component - New component
const RevenueSourceReport = ({ dashboardData }) => {
  if (!dashboardData?.payments?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <PieChart className='h-5 w-5 text-indigo-600' />
            Nguồn doanh thu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <AlertTriangle className='mx-auto h-12 w-12 text-amber-500 mb-4' />
            <p className='text-gray-500'>
              {dashboardData?.payments?.error ||
                'Không thể tải dữ liệu thanh toán'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const revenueBySource = dashboardData.payments.data.revenueBySource || {}
  const totalRevenue = dashboardData.payments.data.totalRevenue || 0

  const sessionRevenue = revenueBySource.chargingSessions || 0
  const subscriptionRevenue = revenueBySource.subscriptions || 0

  const sessionPercentage =
    totalRevenue > 0 ? ((sessionRevenue / totalRevenue) * 100).toFixed(1) : 0
  const subscriptionPercentage =
    totalRevenue > 0
      ? ((subscriptionRevenue / totalRevenue) * 100).toFixed(1)
      : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <PieChart className='h-5 w-5 text-indigo-600' />
          Nguồn doanh thu (Dữ liệu thực)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='text-center mb-4'>
            <div className='text-2xl font-bold text-indigo-600'>
              {formatCurrency(totalRevenue)}
            </div>
            <div className='text-sm text-gray-500'>Tổng doanh thu</div>
          </div>

          <div className='space-y-4'>
            <div className='flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200'>
              <div className='flex items-center gap-3'>
                <div className='w-4 h-4 bg-green-500 rounded'></div>
                <div>
                  <div className='font-medium text-sm'>Phiên sạc</div>
                  <div className='text-xs text-gray-500'>Charging Sessions</div>
                </div>
              </div>
              <div className='text-right'>
                <div className='font-bold text-lg text-green-600'>
                  {sessionPercentage}%
                </div>
                <div className='text-xs text-gray-600'>
                  {formatCurrency(sessionRevenue)}
                </div>
              </div>
            </div>

            <div className='flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200'>
              <div className='flex items-center gap-3'>
                <div className='w-4 h-4 bg-blue-500 rounded'></div>
                <div>
                  <div className='font-medium text-sm'>Nâng cấp gói</div>
                  <div className='text-xs text-gray-500'>
                    Subscription Upgrades
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className='font-bold text-lg text-blue-600'>
                  {subscriptionPercentage}%
                </div>
                <div className='text-xs text-gray-600'>
                  {formatCurrency(subscriptionRevenue)}
                </div>
              </div>
            </div>

            {/* Visual representation */}
            <div className='mt-4'>
              <div className='w-full bg-gray-200 rounded-full h-4 overflow-hidden'>
                <div className='flex h-full'>
                  <div
                    className='bg-green-500 h-full'
                    style={{ width: `${sessionPercentage}%` }}
                  ></div>
                  <div
                    className='bg-blue-500 h-full'
                    style={{ width: `${subscriptionPercentage}%` }}
                  ></div>
                </div>
              </div>
              <div className='flex justify-between text-xs text-gray-500 mt-2'>
                <span>Phiên sạc ({sessionPercentage}%)</span>
                <span>Nâng cấp gói ({subscriptionPercentage}%)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Peak Hours Report Component - Removed per user request

export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        console.log('📊 Loading dashboard data...')

        const result = await dashboardService.getDashboardData()

        if (result.success) {
          setDashboardData(result.data)
          console.log('✅ Dashboard data loaded successfully')
        } else {
          console.error('❌ Failed to load dashboard data:', result.error)
        }
      } catch (err) {
        console.error('❌ Dashboard data loading error:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Calculate real stats from backend data
  const calculateStats = () => {
    if (!dashboardData) {
      return {
        totalSessions: 0,
        totalRevenue: 0,
        activeChargers: 0,
        reportedIssues: 0,
        monthlyGrowth: 0,
        revenueGrowth: 0,
      }
    }

    const stats = {
      totalSessions: 0,
      totalRevenue: 0,
      activeChargers: 0,
      reportedIssues: 0,
      monthlyGrowth: 0,
      revenueGrowth: 0,
    }

    // Get stats from successful data fetches
    if (dashboardData.sessions?.success) {
      stats.totalSessions = dashboardData.sessions.data.stats.totalSessions || 0
      stats.monthlyGrowth = dashboardData.sessions.data.stats.monthlyGrowth || 0

      // Use session revenue if payment data is not available
      if (!dashboardData.payments?.success) {
        stats.totalRevenue = dashboardData.sessions.data.stats.totalRevenue || 0
        stats.revenueGrowth =
          dashboardData.sessions.data.stats.revenueGrowth || 0
      }
    }

    // Prefer payment data for revenue if available
    if (dashboardData.payments?.success) {
      stats.totalRevenue = dashboardData.payments.data.totalRevenue || 0
      // You could calculate payment revenue growth here if needed
    }

    if (dashboardData.stations?.success) {
      stats.activeChargers =
        dashboardData.stations.data.stats.activeChargers || 0
      stats.reportedIssues =
        dashboardData.stations.data.stats.reportedIssues || 0
    }

    return stats
  }

  const realStats = calculateStats()

  const tabs = [
    { id: 'overview', name: 'Tổng quan', icon: Activity },
    { id: 'usage', name: 'Mức độ sử dụng', icon: BarChart3 },
    { id: 'vehicles', name: 'Loại xe', icon: Car },
    { id: 'revenue', name: 'Doanh thu', icon: DollarSign },
  ]

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <Loader2 className='mx-auto h-12 w-12 animate-spin text-blue-600 mb-4' />
          <p className='text-lg font-medium text-gray-600'>
            Đang tải dữ liệu dashboard...
          </p>
        </div>
      </div>
    )
  }

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

      {/* Tab Navigation */}
      <div className='border-b border-gray-200'>
        <nav className='-mb-px flex space-x-8'>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className='h-4 w-4' />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Display error messages if any data failed to load */}
          {dashboardData &&
            (!dashboardData.stations?.success ||
              !dashboardData.sessions?.success ||
              !dashboardData.maintenance?.success ||
              !dashboardData.payments?.success) && (
              <div className='mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg'>
                <div className='flex items-center gap-2'>
                  <AlertTriangle className='h-5 w-5 text-amber-600' />
                  <h3 className='font-medium text-amber-800'>
                    Cảnh báo tải dữ liệu
                  </h3>
                </div>
                <div className='mt-2 text-sm text-amber-700'>
                  {dashboardData?.stations?.error && (
                    <p>
                      • Không thể tải dữ liệu trạm sạc:{' '}
                      {dashboardData.stations.error}
                    </p>
                  )}
                  {dashboardData?.sessions?.error && (
                    <p>
                      • Không thể tải dữ liệu phiên sạc:{' '}
                      {dashboardData.sessions.error}
                    </p>
                  )}
                  {dashboardData?.maintenance?.error && (
                    <p>
                      • Không thể tải dữ liệu bảo trì:{' '}
                      {dashboardData.maintenance.error}
                    </p>
                  )}
                  {dashboardData?.payments?.error && (
                    <p>
                      • Không thể tải dữ liệu thanh toán:{' '}
                      {dashboardData.payments.error}
                    </p>
                  )}
                </div>
              </div>
            )}

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <StatCard
              title='Tổng số phiên sạc'
              value={realStats.totalSessions.toLocaleString()}
              icon={Activity}
              trend='from last month'
              trendValue={realStats.monthlyGrowth}
              color='primary'
            />
            <StatCard
              title='Tổng doanh thu'
              value={formatCurrency(realStats.totalRevenue)}
              icon={DollarSign}
              trend='from last month'
              trendValue={realStats.revenueGrowth}
              color='emerald'
            />
            <StatCard
              title='Trạm đang hoạt động'
              value={realStats.activeChargers}
              icon={Zap}
              trend='out of total chargers'
              color='amber'
            />
            <StatCard
              title='Sự cố báo cáo'
              value={realStats.reportedIssues}
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
                {dashboardData?.sessions?.success &&
                dashboardData.sessions.data.sessions.length > 0 ? (
                  dashboardData.sessions.data.sessions
                    .filter(
                      (s) =>
                        s.status === 'InProgress' || s.status === 'Completed'
                    )
                    .slice(0, 5)
                    .map((session, index) => (
                      <div key={index} className='flex items-center space-x-4'>
                        <div
                          className={`h-3 w-3 rounded-full ${
                            session.status === 'InProgress'
                              ? 'bg-gradient-to-r from-emerald-400 to-emerald-600 animate-pulse'
                              : 'bg-blue-500'
                          }`}
                        ></div>
                        <div className='flex-1'>
                          <p className='text-sm font-semibold text-slate-900'>
                            {session.status === 'InProgress'
                              ? 'Phiên sạc đang diễn ra'
                              : 'Phiên sạc hoàn thành'}
                          </p>
                          <p className='text-xs text-gray-500'>
                            Trạm {session.stationId} -{' '}
                            {new Date(session.startTime).toLocaleString(
                              'vi-VN'
                            )}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className='text-center py-4 text-gray-500'>
                    Không có hoạt động gần đây
                  </div>
                )}
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
        </>
      )}

      {activeTab === 'usage' && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <UsageReport dashboardData={dashboardData} />
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MapPin className='h-5 w-5 text-purple-600' />
                Hiệu suất theo địa điểm
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.stations?.success ? (
                <div className='space-y-4'>
                  {dashboardData.stations.data.stations
                    .slice(0, 3)
                    .map((station, index) => {
                      const efficiency =
                        station.totalChargers > 0
                          ? Math.round(
                              ((station.totalChargers -
                                station.availableChargers) /
                                station.totalChargers) *
                                100
                            )
                          : 0

                      const colorClasses = [
                        'bg-green-50 border-l-4 border-green-500',
                        'bg-blue-50 border-l-4 border-blue-500',
                        'bg-yellow-50 border-l-4 border-yellow-500',
                      ]

                      const textColors = [
                        'text-green-600',
                        'text-blue-600',
                        'text-yellow-600',
                      ]

                      return (
                        <div
                          key={station.id}
                          className={`flex justify-between items-center p-3 rounded-lg ${colorClasses[index]}`}
                        >
                          <div>
                            <div className='font-semibold'>{station.name}</div>
                            <div className='text-sm text-gray-600'>
                              {efficiency}% hiệu suất
                            </div>
                          </div>
                          <div className={`font-bold ${textColors[index]}`}>
                            Top {index + 1}
                          </div>
                        </div>
                      )
                    })}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <AlertTriangle className='mx-auto h-12 w-12 text-amber-500 mb-4' />
                  <p className='text-gray-500'>
                    {dashboardData?.stations?.error ||
                      'Không thể tải dữ liệu trạm sạc'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'vehicles' && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <VehicleReport />
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <PieChart className='h-5 w-5 text-indigo-600' />
                Thống kê connector (Mock Data)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='text-xs text-amber-600 bg-amber-50 p-2 rounded mb-4'>
                  ⚠️ Dữ liệu mẫu - Backend chưa hỗ trợ thống kê loại xe
                </div>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-3'>
                    <div className='w-4 h-4 bg-blue-500 rounded'></div>
                    <span className='font-medium'>CCS2</span>
                  </div>
                  <span className='text-lg font-bold'>60%</span>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-3'>
                    <div className='w-4 h-4 bg-green-500 rounded'></div>
                    <span className='font-medium'>CHAdeMO</span>
                  </div>
                  <span className='text-lg font-bold'>25%</span>
                </div>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-3'>
                    <div className='w-4 h-4 bg-purple-500 rounded'></div>
                    <span className='font-medium'>Type 2</span>
                  </div>
                  <span className='text-lg font-bold'>15%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <RevenueReport dashboardData={dashboardData} />
          <RevenueSourceReport dashboardData={dashboardData} />
        </div>
      )}
    </div>
  )
}
