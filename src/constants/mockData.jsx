export const mockUsers = [
  // Xóa default accounts - sẽ login qua API của backend
]

export const mockStations = [
  {
    id: 1,
    name: 'Downtown Central Station',
    location: 'Nguyen Hue Street, District 1, Ho Chi Minh City',
    mapLat: 10.7769,
    mapLng: 106.7009,
    status: 'Active',
    totalChargers: 8,
    activeChargers: 6,
    chargerTypes: ['Type 2', 'CCS', 'CHAdeMO'],
    power: '50kW',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Airport Hub Station',
    location: 'Tan Son Nhat Airport, Ho Chi Minh City',
    mapLat: 10.8187,
    mapLng: 106.6524,
    status: 'Active',
    totalChargers: 12,
    activeChargers: 10,
    chargerTypes: ['Type 2', 'CCS'],
    power: '150kW',
    createdAt: '2024-01-15T00:00:00Z',
  },
]

export const mockSessions = [
  {
    id: 1,
    stationId: 1,
    stationName: 'Downtown Central Station',
    userId: 101,
    userName: 'Customer A',
    chargerId: 'DC-001',
    startTime: '2024-11-01T08:00:00Z',
    endTime: '2024-11-01T09:30:00Z',
    status: 'Completed',
    energyDelivered: 45.5,
    price: 250000,
    paymentMethod: 'Card',
    paymentStatus: 'Paid',
    createdBy: 'staff@smartev.com',
  },
  {
    id: 2,
    stationId: 1,
    stationName: 'Downtown Central Station',
    userId: 102,
    userName: 'Customer B',
    chargerId: 'DC-002',
    startTime: '2024-11-01T10:00:00Z',
    endTime: null,
    status: 'Active',
    energyDelivered: 15.2,
    price: null,
    paymentMethod: null,
    paymentStatus: 'Pending',
    createdBy: 'staff@smartev.com',
  },
]

export const mockStats = {
  totalSessions: 1250,
  totalRevenue: 45600000,
  activeChargers: 156,
  reportedIssues: 8,
  monthlyGrowth: 12.5,
  revenueGrowth: 18.2,
}

export const mockChartData = {
  dailyUsage: [
    { date: '2024-10-25', sessions: 45, revenue: 2100000 },
    { date: '2024-10-26', sessions: 52, revenue: 2450000 },
    { date: '2024-10-27', sessions: 38, revenue: 1890000 },
    { date: '2024-10-28', sessions: 61, revenue: 2890000 },
    { date: '2024-10-29', sessions: 49, revenue: 2340000 },
    { date: '2024-10-30', sessions: 67, revenue: 3120000 },
    { date: '2024-10-31', sessions: 58, revenue: 2780000 },
  ],
  stationUsage: [
    { name: 'Downtown Central', value: 35, sessions: 425 },
    { name: 'Airport Hub', value: 28, sessions: 340 },
    { name: 'Shopping Mall', value: 20, sessions: 245 },
    { name: 'Business District', value: 17, sessions: 205 },
  ],
}
