import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic" // Disable caching for this page

export default async function TestDbPage() {
  let connectionStatus = "Unknown"
  let error = null
  let leagues = []

  try {
    // Test database connection
    const result = await db`SELECT 1 as connection_test`
    connectionStatus = result[0]?.connection_test === 1 ? "Connected" : "Failed"

    // Try to fetch some data
    leagues = await db`SELECT * FROM leagues LIMIT 5`
  } catch (err) {
    connectionStatus = "Error"
    error = err.message
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Database Connection Test</h1>

      <Card>
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">
            Status:
            <span
              className={`ml-2 font-bold ${
                connectionStatus === "Connected"
                  ? "text-green-600 dark:text-green-400"
                  : connectionStatus === "Error"
                    ? "text-red-600 dark:text-red-400"
                    : "text-yellow-600 dark:text-yellow-400"
              }`}
            >
              {connectionStatus}
            </span>
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded mb-4">
              <p className="text-red-800 dark:text-red-400 font-medium">Error:</p>
              <pre className="mt-2 text-sm text-red-700 dark:text-red-400 overflow-auto">{error}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {leagues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sample Data (Leagues)</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y dark:divide-gray-700">
              {leagues.map((league, index) => (
                <li key={index} className="py-3 first:pt-0 last:pb-0">
                  <div className="font-medium">{league.name}</div>
                  {league.country && <div className="text-sm text-gray-500 dark:text-gray-400">{league.country}</div>}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

