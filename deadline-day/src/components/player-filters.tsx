"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"

interface PlayerFiltersProps {
  positions: { position: string }[]
}

export function PlayerFilters({ positions }: PlayerFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("query") || "")
  const [position, setPosition] = useState(searchParams.get("position") || "")

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (search) {
      params.set("query", search)
    }

    if (position) {
      params.set("position", position)
    }

    router.push(`/players?${params.toString()}`)
  }

  const handleReset = () => {
    setSearch("")
    setPosition("")
    router.push("/players")
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow space-y-4">
      <h2 className="text-lg font-semibold flex items-center">
        <Filter className="mr-2 h-5 w-5" />
        Filters
      </h2>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Search Players</Label>
          <div className="flex space-x-2">
            <Input
              id="search"
              placeholder="Search by name, position..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button size="icon" onClick={handleSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger id="position">
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {positions.map((pos) => (
                <SelectItem key={pos.position} value={pos.position}>
                  {pos.position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="pt-2">
          <Button onClick={handleSearch} className="w-full">
            Apply Filters
          </Button>

          <Button onClick={handleReset} variant="outline" className="w-full mt-2">
            Reset Filters
          </Button>
        </div>
      </div>
    </div>
  )
}

