import { useState } from 'react'
import { api } from '../services/api'
import FileUpload from '../components/FileUpload'

export default function RevenueManagement() {
  const [manualRevenue, setManualRevenue] = useState({ total_amount: '', percentage_change: '' })

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    await api.post('/admin/revenue/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    alert('Revenue file uploaded successfully!')
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/revenue/manual', {
        total_amount: parseFloat(manualRevenue.total_amount),
        percentage_change: parseFloat(manualRevenue.percentage_change),
      })
      alert('Revenue data saved successfully!')
      setManualRevenue({ total_amount: '', percentage_change: '' })
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to save revenue data')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Revenue Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* File Upload */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
          <FileUpload
            onUpload={handleFileUpload}
            accept=".xlsx,.xls"
            label="Upload Revenue Excel File"
          />
          <p className="text-sm text-gray-500 mt-4">
            Expected format: Total revenue, percentage change, revenue trends, and revenue proportions
          </p>
        </div>

        {/* Manual Entry */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Entry</h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Revenue ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={manualRevenue.total_amount}
                onChange={(e) => setManualRevenue({ ...manualRevenue, total_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentage Change (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={manualRevenue.percentage_change}
                onChange={(e) => setManualRevenue({ ...manualRevenue, percentage_change: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Revenue Data
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

