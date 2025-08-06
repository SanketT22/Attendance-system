"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { supabase } from "@/lib/supabase"

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [errorMessage, setErrorMessage] = useState('')
  const [envVars, setEnvVars] = useState({
    url: '',
    key: ''
  })

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set',
      key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set (hidden)' : 'Not set'
    })

    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus('testing')
      
      // Test basic connection
      const { data, error } = await supabase
        .from('batches')
        .select('count')
        .limit(1)

      if (error) {
        throw error
      }

      setConnectionStatus('success')
    } catch (error: any) {
      setConnectionStatus('error')
      setErrorMessage(error.message || 'Unknown error occurred')
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'testing':
        return <AlertCircle className="h-8 w-8 text-yellow-500 animate-pulse" />
      case 'success':
        return <CheckCircle className="h-8 w-8 text-green-500" />
      case 'error':
        return <XCircle className="h-8 w-8 text-red-500" />
    }
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'testing':
        return 'Testing connection...'
      case 'success':
        return 'Connection successful!'
      case 'error':
        return 'Connection failed'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Connection Test</h1>
        
        <div className="space-y-6">
          {/* Environment Variables Check */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Variables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                  <span className={envVars.url === 'Not set' ? 'text-red-500' : 'text-green-500'}>
                    {envVars.url}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                  <span className={envVars.key === 'Not set' ? 'text-red-500' : 'text-green-500'}>
                    {envVars.key}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <Card>
            <CardHeader>
              <CardTitle>Database Connection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                {getStatusIcon()}
                <span className="text-lg font-medium">{getStatusText()}</span>
              </div>
              
              {connectionStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800 font-medium">Error Details:</p>
                  <p className="text-red-600 text-sm mt-1">{errorMessage}</p>
                </div>
              )}

              {connectionStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800">
                    ✅ Successfully connected to Supabase database!
                  </p>
                  <p className="text-green-600 text-sm mt-1">
                    Your environment variables are configured correctly.
                  </p>
                </div>
              )}

              <Button 
                onClick={testConnection} 
                className="mt-4"
                disabled={connectionStatus === 'testing'}
              >
                {connectionStatus === 'testing' ? 'Testing...' : 'Test Again'}
              </Button>
            </CardContent>
          </Card>

          {/* Setup Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Setup Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium">1. Create .env.local file</h4>
                  <p className="text-gray-600">Create a file named `.env.local` in your project root</p>
                </div>
                <div>
                  <h4 className="font-medium">2. Add environment variables</h4>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium">3. Restart your development server</h4>
                  <p className="text-gray-600">Run `npm run dev` again after adding environment variables</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
