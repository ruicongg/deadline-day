import { PlayerList } from "@/components/player-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const dynamic = "force-dynamic"

export default async function PlayersPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Players</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Players</CardTitle>
        </CardHeader>
        <CardContent>
          <PlayerList />
        </CardContent>
      </Card>
    </div>
  )
}

