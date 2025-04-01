import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

async function getLeagues() {
  try {
    const leagues = await db`
      SELECT l.*, COUNT(t.id) as team_count
      FROM leagues l
      LEFT JOIN teams t ON l.id = t.league_id
      GROUP BY l.id
      ORDER BY l.name
    `
    return leagues
  } catch (error) {
    console.error("Error fetching leagues:", error)
    return []
  }
}

export default async function LeaguesPage() {
  const leagues = await getLeagues()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Football Leagues</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leagues.length > 0 ? (
          leagues.map((league) => (
            <Card key={league.id} className="dark:border-gray-800">
              <CardHeader>
                <CardTitle>{league.name}</CardTitle>
                {league.country && <p className="text-muted-foreground">{league.country}</p>}
              </CardHeader>
              <CardContent>
                <p>{league.team_count} teams</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full dark:border-gray-800">
            <CardContent className="py-10">
              <p className="text-center text-muted-foreground">No leagues found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

