"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface Player {
  id: number
  name: string
  position: string
  age: number
  nationality: string
  team_name: string
  league_name: string
  market_value_euro: number
  image_url?: string
}

interface PlayerListProps {
  position?: string
  league?: string
  team?: string
  search?: string
}

export function PlayerList({ position, league, team, search: initialSearch }: PlayerListProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [search, setSearch] = useState(initialSearch || "")
  const [searchInput, setSearchInput] = useState(initialSearch || "")

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams()
        params.append("page", page.toString())
        params.append("limit", "20")

        if (position) params.append("position", position)
        if (league) params.append("leagueId", league)
        if (team) params.append("teamId", team)
        if (search) params.append("search", search)

        const response = await fetch(`/api/players?${params.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch players")
        }

        const data = await response.json()
        setPlayers(data.players)
        setTotalPages(data.totalPages)
        setTotalPlayers(data.total)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [page, position, league, team, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1) // Reset to first page on new search
  }

  const formatValue = (value: number) => {
    const millions = value / 1000000
    return `€${millions.toFixed(1)}M`
  }

  if (error) {
    return <div className="p-4 bg-red-50 text-red-500 rounded-md">Error: {error}</div>
  }

  return (
    <div>
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search players..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </form>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Age</TableHead>
              <TableHead className="text-right">Market Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[30px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-4 w-[80px] ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No players found
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell>
                    <Link href={`/players/${player.id}`} className="flex items-center gap-3 hover:underline">
                      <Avatar>
                        {player.image_url ? <AvatarImage src={player.image_url} alt={player.name} /> : null}
                        <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-xs text-gray-500">{player.nationality}</div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {player.position ? (
                      <Badge variant="outline">{player.position}</Badge>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {player.team_name ? (
                      <div>
                        <div>{player.team_name}</div>
                        <div className="text-xs text-gray-500">{player.league_name}</div>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>{player.age || "-"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {player.market_value_euro ? formatValue(player.market_value_euro) : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around the current page
                let pageNum = page
                if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }

                if (pageNum > 0 && pageNum <= totalPages) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink onClick={() => setPage(pageNum)} isActive={page === pageNum}>
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  )
                }
                return null
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <div className="mt-2 text-sm text-gray-500 text-center">
        Showing {players.length} of {totalPlayers} players
      </div>
    </div>
  )
}

