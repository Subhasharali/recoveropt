import { useState, useEffect } from 'react'

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...')

  useEffect(() => {
    fetch('http://localhost:8000/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'healthy') {
          setBackendStatus('Connected')
        } else {
          setBackendStatus('Error: Invalid response')
        }
      })
      .catch((err) => {
        console.error(err)
        setBackendStatus('Disconnected (Check if backend is running)')
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">RecoverOpt</h1>
          <p className="text-gray-500">AI Revenue Recovery MVP</p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-100">
            <span className="font-medium text-gray-700">Backend Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              backendStatus === 'Connected' ? 'bg-green-100 text-green-700' :
              backendStatus === 'Checking...' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {backendStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
