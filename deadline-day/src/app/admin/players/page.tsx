"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Search, Plus, Edit, Trash2, RefreshCw, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Player {
  id: number
  name: string
  position: string
  nationality: string
  age: number
  team_name: string
  transfermarkt_url: string | null
  image_url: string | null
  last_bio_update: string | null
}

export default function PlayersPage() {
  const { toast } = useToast()
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [position, setPosition] = useState("")
  const [positions, setPositions] = useState<string[]>([])
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null)

  useEffect(() => {
    fetchPlayers()
    fetchPositions()
  }, [page])

  const fetchPlayers = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) params.set("search", search)
      if (position) params.set("position", position)

      const response = await fetch(`/api/players?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch players")
      }

      const data = await response.json()
      setPlayers(data.data)
      setTotalPages(data.pagination.totalPages)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchPositions = async () => {
    try {
      const response = await fetch("/api/players/positions")

      if (!response.ok) {
        throw new Error("Failed to fetch positions")
      }

      const data = await response.json()
      setPositions(data.map((p: any) => p.position))
    } catch (err) {
      console.error("Error fetching positions:", err)
    }
  }

  const handleSearch = () => {
    setPage(1)
    fetchPlayers()
  }

  const handlePositionChange = (value: string) => {
    setPosition(value)
    setPage(1)
    setTimeout(() => fetchPlayers(), 0)
  }

  const handleReset = () => {
    setSearch("")
    setPosition("")
    setPage(1)
    setTimeout(() => fetchPlayers(), 0)
  }

  const handleDeletePlayer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this player?")) {
      return
    }

    setDeleteLoading(id)

    try {
      const response = await fetch(`/api/players/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete player")
      }

      toast({
        title: "Player deleted",
        description: "Player has been deleted successfully",
        variant: "default",
      })

      // Refresh the player list
      fetchPlayers()
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "An error occurred while deleting the player",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Player Management</h1>
        <Link href="/admin/players/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Player
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Players</CardTitle>
          <CardDescription>Manage football players in the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="flex gap-2">
                <Input
                  placeholder="Search players..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={position} onValueChange={handlePositionChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Positions</SelectItem>
                  {positions.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <Filter className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded mb-4">
              <p className="text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Bio Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        No players found
                      </TableCell>
                    </TableRow>
                  ) : (
                    players.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell className="font-medium">{player.name}</TableCell>
                        <TableCell>{player.position || "—"}</TableCell>
                        <TableCell>{player.nationality || "—"}</TableCell>
                        <TableCell>{player.age || "—"}</TableCell>
                        <TableCell>{player.team_name || "—"}</TableCell>
                        <TableCell>
                          {player.last_bio_update ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Updated
                            </span>
                          ) : player.transfermarkt_url ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                              URL Set
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                              No Bio
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/players/${player.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePlayer(player.id)}
                              disabled={deleteLoading === player.id}
                            >
                              {deleteLoading === player.id ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 text-red-500" />
                              )}
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

