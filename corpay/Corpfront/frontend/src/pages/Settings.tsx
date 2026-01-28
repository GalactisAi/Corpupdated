import { useState, useEffect } from 'react'
import { api } from '../services/api'

export default function Settings() {
  const [config, setConfig] = useState({
    share_price_api_url: '',
    share_price_api_key: '',
    linkedin_api_url: '',
    linkedin_api_key: '',
    powerbi_client_id: '',
    powerbi_client_secret: '',
    powerbi_tenant_id: '',
    powerbi_workspace_id: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await api.get('/admin/config')
      setConfig({ ...config, ...response.data })
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.put('/admin/config', config)
      alert('Configuration updated successfully!')
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to update configuration')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">API Configuration</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Share Price API</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API URL</label>
                <input
                  type="url"
                  value={config.share_price_api_url}
                  onChange={(e) => setConfig({ ...config, share_price_api_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://api.example.com/share-price"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={config.share_price_api_key}
                  onChange={(e) => setConfig({ ...config, share_price_api_key: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter API key"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">LinkedIn API</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API URL</label>
                <input
                  type="url"
                  value={config.linkedin_api_url}
                  onChange={(e) => setConfig({ ...config, linkedin_api_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="https://api.example.com/linkedin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <input
                  type="password"
                  value={config.linkedin_api_key}
                  onChange={(e) => setConfig({ ...config, linkedin_api_key: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter API key"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">PowerBI Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                <input
                  type="text"
                  value={config.powerbi_client_id}
                  onChange={(e) => setConfig({ ...config, powerbi_client_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="PowerBI Client ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client Secret</label>
                <input
                  type="password"
                  value={config.powerbi_client_secret}
                  onChange={(e) => setConfig({ ...config, powerbi_client_secret: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="PowerBI Client Secret"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tenant ID</label>
                <input
                  type="text"
                  value={config.powerbi_tenant_id}
                  onChange={(e) => setConfig({ ...config, powerbi_tenant_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="PowerBI Tenant ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workspace ID</label>
                <input
                  type="text"
                  value={config.powerbi_workspace_id}
                  onChange={(e) => setConfig({ ...config, powerbi_workspace_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="PowerBI Workspace ID"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Configuration
          </button>
        </form>
      </div>
    </div>
  )
}

