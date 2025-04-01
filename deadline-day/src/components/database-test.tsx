"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database } from "lucide-react"

export function DatabaseTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [data, setData] = useState<any[] | null>(null)

  const testConnection = async () => {
    setStatus("loading")
    setMessage("Testing database connection...")
    setData(null)

    try {
      const response = await fetch("/api/test-db")
      const result = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Successfully connected to the database!")
        setData(result.data)
      } else {
        setStatus("error")
        setMessage(`Connection failed: ${result.message}`)
      }
    } catch (error) {
      setStatus("error")
      setMessage(`Connection error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Connection Test</CardTitle>
        <CardDescription>Test the connection to your Neon Postgres database</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={status === "loading"} className="w-full">
          <Database className="mr-2 h-4 w-4" />
          Test Database Connection
        </Button>

        {status !== "idle" && (
          <Alert variant={status === "success" ? "default" : status === "error" ? "destructive" : "default"}>
            {status === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : status === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : null}
            <AlertTitle>
              {status === "success"
                ? "Connection Successful"
                : status === "error"
                  ? "Connection Failed"
                  : "Testing Connection"}
            </AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2">Database Response:</h3>
            <pre className="bg-muted p-3 rounded-md text-xs overflow-auto max-h-40">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

