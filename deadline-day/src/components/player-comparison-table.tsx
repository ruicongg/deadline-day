"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for player comparison
const players = [
  {
    id: 1,
    name: "Lionel Messi",
    team: "Inter Miami",
    position: "Forward",
    stats: {
      goals: 28,
      assists: 16,
      matches: 32,
      minutesPlayed: 2840,
      passAccuracy: 89,
      shotsOnTarget: 64,
      keyPasses: 87,
      rating: 8.7,
    },
  },
  {
    id: 2,
    name: "Cristiano Ronaldo",
    team: "Al Nassr",
    position: "Forward",
    stats: {
      goals: 31,
      assists: 8,
      matches: 34,
      minutesPlayed: 3060,
      passAccuracy: 82,
      shotsOnTarget: 72,
      keyPasses: 56,
      rating: 8.5,
    },
  },
  {
    id: 3,
    name: "Kevin De Bruyne",
    team: "Manchester City",
    position: "Midfielder",
    stats: {
      goals: 10,
      assists: 24,
      matches: 30,
      minutesPlayed: 2520,
      passAccuracy: 91,
      shotsOnTarget: 38,
      keyPasses: 112,
      rating: 8.6,
    },
  },
  {
    id: 4,
    name: "Kylian Mbappé",
    team: "PSG",
    position: "Forward",
    stats: {
      goals: 26,
      assists: 10,
      matches: 31,
      minutesPlayed: 2790,
      passAccuracy: 84,
      shotsOnTarget: 68,
      keyPasses: 62,
      rating: 8.4,
    },
  },
  {
    id: 5,
    name: "Erling Haaland",
    team: "Manchester City",
    position: "Forward",
    stats: {
      goals: 27,
      assists: 6,
      matches: 29,
      minutesPlayed: 2610,
      passAccuracy: 78,
      shotsOnTarget: 70,
      keyPasses: 32,
      rating: 8.3,
    },
  },
]

interface PlayerComparisonTableProps {
  playerId: number
}

export function PlayerComparisonTable({ playerId }: PlayerComparisonTableProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("2")

  const mainPlayer = players.find((p) => p.id === playerId)
  const comparisonPlayer = players.find((p) => p.id === Number.parseInt(selectedPlayerId))

  if (!mainPlayer) return <div>Player not found</div>

  const otherPlayers = players.filter((p) => p.id !== playerId)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="text-sm font-medium">Compare with:</div>
        <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select player" />
          </SelectTrigger>
          <SelectContent>
            {otherPlayers.map((player) => (
              <SelectItem key={player.id} value={player.id.toString()}>
                {player.name} ({player.team})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {comparisonPlayer && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Statistic</TableHead>
              <TableHead className="text-right">{mainPlayer.name}</TableHead>
              <TableHead className="text-right">{comparisonPlayer.name}</TableHead>
              <TableHead className="text-right">Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(mainPlayer.stats).map(([key, value]) => {
              const compValue = comparisonPlayer.stats[key as keyof typeof comparisonPlayer.stats]
              const diff = value - compValue
              const isPositive = diff > 0

              return (
                <TableRow key={key}>
                  <TableCell className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</TableCell>
                  <TableCell className="text-right">{value}</TableCell>
                  <TableCell className="text-right">{compValue}</TableCell>
                  <TableCell className={`text-right ${isPositive ? "text-green-500" : diff < 0 ? "text-red-500" : ""}`}>
                    {isPositive ? "+" : ""}
                    {diff}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

