"use client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, User, Flag, Shirt } from "lucide-react"

interface Player {
  id: number
  name: string
  position: string
  nationality: string
  age: number
  current_team_id: number
  image_url?: string
}

interface PlayersListProps {
  players: {
    data: Player[]
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function PlayersList({ players }: PlayersListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    router.push(`/players?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing {players.data.length} of {players.total} players
        </p>
      </div>

      {players.data.length === 0 ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-gray-500">No players found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {players.data.map((player) => (
            <Link href={`/players/${player.id}`} key={player.id}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                      {/* Always use the fallback since we don't have image_url yet */}
                      <div className="flex items-center justify-center h-full bg-primary/10">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{player.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Shirt className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{player.position || "Unknown position"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Flag className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{player.nationality || "Unknown nationality"}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <User className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{player.age || "Unknown age"} years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {players.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(players.page - 1)}
              disabled={players.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: players.totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Show first page, last page, current page, and pages around current page
                  return page === 1 || page === players.totalPages || Math.abs(page - players.page) <= 1
                })
                .map((page, index, array) => {
                  // Add ellipsis between non-consecutive pages
                  const showEllipsis = index > 0 && page - array[index - 1] > 1

                  return (
                    <div key={page} className="flex items-center">
                      {showEllipsis && <span className="px-2 text-gray-400">...</span>}
                      <Button
                        variant={players.page === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    </div>
                  )
                })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(players.page + 1)}
              disabled={players.page >= players.totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

