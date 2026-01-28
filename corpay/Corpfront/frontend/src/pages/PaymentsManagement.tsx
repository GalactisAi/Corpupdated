import { useState } from 'react'
import { api } from '../services/api'
import FileUpload from '../components/FileUpload'

export default function PaymentsManagement() {
  const [manualPayment, setManualPayment] = useState({
    amount_processed: '',
    transaction_count: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleFileUpload = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    await api.post('/admin/payments/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    alert('Payments file uploaded successfully!')
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/admin/payments', {
        amount_processed: parseFloat(manualPayment.amount_processed),
        transaction_count: parseInt(manualPayment.transaction_count),
        date: manualPayment.date,
      })
      alert('Payment data saved successfully!')
      setManualPayment({
        amount_processed: '',
        transaction_count: '',
        date: new Date().toISOString().split('T')[0],
      })
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to save payment data')
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Payments Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Excel File</h2>
          <FileUpload
            onUpload={handleFileUpload}
            accept=".xlsx,.xls"
            label="Upload Payments Excel File"
          />
          <p className="text-sm text-gray-500 mt-4">
            Expected columns: Date, Amount Processed, Transaction Count
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Entry</h2>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={manualPayment.date}
                onChange={(e) => setManualPayment({ ...manualPayment, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount Processed
              </label>
              <input
                type="number"
                step="0.01"
                value={manualPayment.amount_processed}
                onChange={(e) => setManualPayment({ ...manualPayment, amount_processed: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Count
              </label>
              <input
                type="number"
                value={manualPayment.transaction_count}
                onChange={(e) => setManualPayment({ ...manualPayment, transaction_count: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Payment Data
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

