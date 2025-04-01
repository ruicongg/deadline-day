"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Player {
  id: number
  name: string
  transfermarkt_url: string | null
}

export default function SetTransfermarktUrlsPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [urls, setUrls] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  useEffect(() => {
    fetchPlayers()
  }, [page])

  const fetchPlayers = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/players?page=${page}&limit=${limit}`)

      if (!response.ok) {
        throw new Error("Failed to fetch players")
      }

      const data = await response.json()
      setPlayers(data.players)
      setTotalPages(data.pagination.totalPages)

      // Initialize URLs state with existing URLs
      const initialUrls: Record<number, string> = {}
      data.players.forEach((player: Player) => {
        if (player.transfermarkt_url) {
          initialUrls[player.id] = player.transfermarkt_url
        }
      })
      setUrls(initialUrls)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleUrlChange = (playerId: number, url: string) => {
    setUrls((prev) => ({
      ...prev,
      [playerId]: url,
    }))
  }

  const saveUrls = async () => {
    setSaving(true)
    setSaveMessage("")

    try {
      const response = await fetch("/api/admin/set-transfermarkt-urls", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ urls }),
      })

      const data = await response.json()

      if (response.ok) {
        setSaveMessage(`Successfully updated ${data.updated} player URLs`)
        // Refresh the player list
        fetchPlayers()
      } else {
        setSaveMessage(data.error || "Failed to update URLs")
      }
    } catch (error) {
      setSaveMessage("An error occurred while saving URLs")
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Set Transfermarkt URLs</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Player Transfermarkt URLs</CardTitle>
          <CardDescription>Set Transfermarkt URLs for players to enable bio data fetching</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded mb-4">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {saveMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded mb-4">
              <p className="text-green-800 dark:text-green-400">{saveMessage}</p>
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center">Loading players...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player Name</TableHead>
                  <TableHead>Transfermarkt URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell className="font-medium">{player.name}</TableCell>
                    <TableCell>
                      <Input
                        value={urls[player.id] || ""}
                        onChange={(e) => handleUrlChange(player.id, e.target.value)}
                        placeholder="https://www.transfermarkt.com/player-name/profil/spieler/12345"
                        className="w-full"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveUrls} disabled={saving || loading}>
            {saving ? "Saving..." : "Save URLs"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

