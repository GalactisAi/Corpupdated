import { useState } from 'react'
import { api } from '../services/api'
import FileUpload from '../components/FileUpload'

export default function SystemManagement() {
  const [manualPerformance, setManualPerformance] = useState({
    uptime_percentage: '',
    success_rate: '',
  })

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    await api.post('/admin/system/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    alert('System performance file uploaded successfully!')
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/system', {
        uptime_percentage: parseFloat(manualPerformance.uptime_percentage),
        success_rate: parseFloat(manualPerformance.success_rate),
      })
      alert('System performance data saved successfully!')
      setManualPerformance({ uptime_percentage: '', success_rate: '' })
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to save system performance data')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">System Performance Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
          <FileUpload
            onUpload={handleFileUpload}
            accept=".xlsx,.xls"
            label="Upload System Performance Excel File"
          />
          <p className="text-sm text-gray-500 mt-4">
            Expected columns: Uptime Percentage, Success Rate
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Entry</h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Uptime Percentage (%)
              </label>
              <input
                type="number"
                step="0.001"
                value={manualPerformance.uptime_percentage}
                onChange={(e) => setManualPerformance({ ...manualPerformance, uptime_percentage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Success Rate (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={manualPerformance.success_rate}
                onChange={(e) => setManualPerformance({ ...manualPerformance, success_rate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save System Performance Data
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

