"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function FetchPlayerBiosPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [limit, setLimit] = useState(5)
  const [offset, setOffset] = useState(0)

  const fetchPlayerBios = async () => {
    setStatus("loading")
    setMessage(`Fetching bios for ${limit} players starting from offset ${offset}...`)
    setResults([])

    try {
      const response = await fetch(`/api/admin/fetch-player-bios?limit=${limit}&offset=${offset}`)
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || `Successfully updated ${data.updated} player bios`)
        setResults(data.results || [])
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to fetch player bios")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred while fetching player bios")
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Fetch Player Bios</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Fetch Player Bios from Transfermarkt</CardTitle>
          <CardDescription>Update player information from Transfermarkt URLs stored in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="limit">Number of players to process</Label>
              <Input
                id="limit"
                type="number"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                min={1}
                max={50}
              />
            </div>
            <div>
              <Label htmlFor="offset">Offset (skip players)</Label>
              <Input
                id="offset"
                type="number"
                value={offset}
                onChange={(e) => setOffset(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>

          {status !== "idle" && (
            <div
              className={`p-4 rounded-md mb-4 ${
                status === "loading"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : status === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={fetchPlayerBios} disabled={status === "loading"}>
            {status === "loading" ? "Fetching Bios..." : "Fetch Player Bios"}
          </Button>
        </CardFooter>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Player
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{result.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            result.success
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                          }`}
                        >
                          {result.success ? "Success" : "Failed"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {result.error || "Updated successfully"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

