"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Info } from "lucide-react"

interface Player {
  id: number
  name: string
  position: string
  age: number
  nationality: string
  image_url?: string
  market_value_euro: number
}

interface TeamPlayersProps {
  teamId: number
  year: number
}

export function TeamPlayers({ teamId, year }: TeamPlayersProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/teams/${teamId}/players?year=${year}`)

        if (!response.ok) {
          throw new Error("Failed to fetch players")
        }

        const data = await response.json()
        setPlayers(data.players)
      } catch (error) {
        console.error("Error fetching players:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [teamId, year])

  // Format currency in millions
  const formatCurrency = (value: number) => {
    return `€${(value / 1000000).toFixed(1)}M`
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-gray-500">
        <Info className="h-5 w-5 mr-2" />
        <p>
          No players with valuations found for this team in the {year}-{year + 1} season.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Nationality</TableHead>
            <TableHead className="text-right">Market Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => (
            <TableRow key={player.id}>
              <TableCell>
                <Link href={`/players/${player.id}`} className="flex items-center space-x-2 hover:underline">
                  <Avatar className="h-6 w-6">
                    {player.image_url ? <AvatarImage src={player.image_url} alt={player.name} /> : null}
                    <AvatarFallback className="text-xs">{player.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{player.name}</span>
                </Link>
              </TableCell>
              <TableCell>{player.position || "Unknown"}</TableCell>
              <TableCell>{player.age || "N/A"}</TableCell>
              <TableCell>{player.nationality || "Unknown"}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(player.market_value_euro)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

