import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dashboard API functions
export const dashboardApi = {
  getRevenue: () => api.get('/dashboard/revenue'),
  getSharePrice: () => api.get('/dashboard/share-price'),
  getRevenueTrends: () => api.get('/dashboard/revenue-trends'),
  getRevenueProportions: () => api.get('/dashboard/revenue-proportions'),
  getPosts: (limit = 10) => api.get('/dashboard/posts', { params: { limit } }),
  getCrossBorderPosts: (limit = 10) => api.get('/dashboard/cross-border-posts', { params: { limit } }),
  getEmployees: (limit = 20) => api.get('/dashboard/employees', { params: { limit } }),
  getPayments: () => api.get('/dashboard/payments'),
  getSystemPerformance: () => api.get('/dashboard/system-performance'),
  getNewsroom: (limit = 5) => api.get('/dashboard/newsroom', { params: { limit } }),
  getResourcesNewsroom: (limit = 4) => api.get('/dashboard/resources-newsroom', { params: { limit } }),
}

