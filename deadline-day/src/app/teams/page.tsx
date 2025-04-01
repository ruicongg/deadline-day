import { db } from "@/lib/db"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TeamsList } from "@/components/teams-list"
import { YearSelectorWrapper } from "@/components/year-selector-wrapper"
import { getAvailableYears, getCurrentYear } from "@/lib/data-access"

export const dynamic = "force-dynamic"

// Get top leagues by team count
async function getTopLeagues(limit = 5) {
  try {
    // First, check if Bundesliga exists in our database
    const bundesligaCheck = await db`
      SELECT id FROM leagues 
      WHERE name ILIKE '%bundesliga%' 
      LIMIT 1
    `

    const bundesligaId = bundesligaCheck.length > 0 ? bundesligaCheck[0].id : null

    // Get top leagues by team count
    const leagues = await db`
      SELECT l.id, l.name, COUNT(DISTINCT t.id) as team_count
      FROM leagues l
      JOIN teams t ON l.id = t.league_id
      GROUP BY l.id, l.name
      ORDER BY team_count DESC
      LIMIT ${limit}
    `

    // If Bundesliga exists but isn't in top 5, add it manually
    if (bundesligaId && !leagues.some((league) => league.id === bundesligaId)) {
      const bundesliga = await db`
        SELECT l.id, l.name, COUNT(DISTINCT t.id) as team_count
        FROM leagues l
        JOIN teams t ON l.id = t.league_id
        WHERE l.id = ${bundesligaId}
        GROUP BY l.id, l.name
      `

      if (bundesliga.length > 0) {
        leagues.push(bundesliga[0])
      }
    }

    return leagues
  } catch (error) {
    console.error("Error fetching top leagues:", error)
    return []
  }
}

// Get teams by league
async function getTeamsByLeague(leagueId: number, year: number) {
  try {
    const teams = await db`
      WITH team_values AS (
        SELECT 
          t.id,
          SUM(pv.market_value_euro) as total_value,
          COUNT(p.id) as squad_size
        FROM teams t
        JOIN players p ON t.id = p.current_team_id
        JOIN player_valuations pv ON p.id = pv.player_id
        WHERE pv.season_start_year = ${year}
        GROUP BY t.id
      )
      SELECT 
        t.id, 
        t.name, 
        COALESCE(tv.total_value, 0) as total_value,
        COALESCE(tv.squad_size, 0) as squad_size
      FROM teams t
      LEFT JOIN team_values tv ON t.id = tv.id
      WHERE t.league_id = ${leagueId}
      ORDER BY total_value DESC
    `
    return teams
  } catch (error) {
    console.error(`Error fetching teams for league ${leagueId}:`, error)
    return []
  }
}

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const availableYears = await getAvailableYears()
  const defaultYear = await getCurrentYear()

  // Get the year from the URL or use the default
  const yearParam = searchParams.year ? Number(searchParams.year) : undefined
  const currentYear = yearParam && availableYears.includes(yearParam) ? yearParam : defaultYear

  // Get top leagues
  const topLeagues = await getTopLeagues()

  // Get teams for each league
  const leaguesWithTeams = await Promise.all(
    topLeagues.map(async (league) => {
      const teams = await getTeamsByLeague(league.id, currentYear)
      return {
        ...league,
        teams,
      }
    }),
  )

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Teams</h1>
        <YearSelectorWrapper currentYear={currentYear} availableYears={availableYears} />
      </div>

      <Tabs defaultValue={topLeagues[0]?.id.toString()} className="w-full">
        <TabsList className="mb-6 w-full justify-start flex-wrap h-auto">
          {leaguesWithTeams.map((league) => (
            <TabsTrigger key={league.id} value={league.id.toString()} className="mb-2">
              {league.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {leaguesWithTeams.map((league) => (
          <TabsContent key={league.id} value={league.id.toString()}>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">{league.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">
                {league.teams.length} teams • Season {currentYear}-{currentYear + 1}
              </p>
            </div>
            <TeamsList teams={league.teams} year={currentYear} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

