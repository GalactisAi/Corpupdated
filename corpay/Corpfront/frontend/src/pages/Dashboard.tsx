import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { DollarSign, TrendingUp, Users, Activity } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    revenue: 0,
    employees: 0,
    posts: 0,
    payments: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch dashboard data to get stats
      const [revenue, employees, posts, payments] = await Promise.all([
        api.get('/dashboard/revenue').catch(() => ({ data: { total_amount: 0 } })),
        api.get('/dashboard/employees').catch(() => ({ data: [] })),
        api.get('/dashboard/posts').catch(() => ({ data: [] })),
        api.get('/dashboard/payments').catch(() => ({ data: { transaction_count: 0 } })),
      ])

      setStats({
        revenue: revenue.data.total_amount || 0,
        employees: employees.data.length || 0,
        posts: posts.data.length || 0,
        payments: payments.data.transaction_count || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ${(stats.revenue / 1000000).toFixed(1)}M
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Employee Milestones</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.employees}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Social Posts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.posts}</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Transactions Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.payments}</p>
            </div>
            <Activity className="w-12 h-12 text-orange-500" />
          </div>
        </div>
      </div>
    </div>
  )
}

