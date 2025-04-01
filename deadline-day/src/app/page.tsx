import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, BarChart, Database, Trophy, ChevronRight } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeagueValueDistribution } from "@/components/league-value-distribution"
import { AgeValueChart } from "@/components/age-value-chart"
import { PositionValueChart } from "@/components/position-value-chart"
import { TopTeamsChart } from "@/components/top-teams-chart"
import { generateMockAgeValueData, generateMockPositionValueData, generateMockLeagueData } from "@/lib/mock-data"
import { getAvailableYears, getCurrentYear, getTopPlayersByLeagueAndYear } from "@/lib/data-access"
import { YearSelectorWrapper } from "@/components/year-selector-wrapper"

export const dynamic = "force-dynamic"

// Get overall stats
async function getStats() {
  try {
    // Get total players count
    const playersCount = await db`SELECT COUNT(DISTINCT id) as count FROM players`

    // Get leagues count
    const leaguesCount = await db`SELECT COUNT(DISTINCT id) as count FROM leagues`

    // Get teams count
    const teamsCount = await db`SELECT COUNT(DISTINCT id) as count FROM teams`

    // Get valuations count
    const valuationsCount = await db`SELECT COUNT(*) as count FROM player_valuations`

    return {
      players: playersCount[0]?.count || 0,
      leagues: leaguesCount[0]?.count || 0,
      teams: teamsCount[0]?.count || 0,
      valuations: valuationsCount[0]?.count || 0,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      players: 0,
      leagues: 0,
      teams: 0,
      valuations: 0,
    }
  }
}

// Get top players overall for a specific year
async function getTopPlayers(year: number, limit = 5) {
  try {
    const players = await db`
      WITH valuations_for_year AS (
        SELECT player_id, market_value_euro
        FROM player_valuations
        WHERE season_start_year = ${year}
      )
      SELECT 
        p.id, 
        p.name, 
        p.image_url, 
        p.current_team_id, 
        t.name as team_name, 
        l.name as league_name, 
        vfy.market_value_euro
      FROM players p
      JOIN valuations_for_year vfy ON p.id = vfy.player_id
      LEFT JOIN teams t ON p.current_team_id = t.id
      LEFT JOIN leagues l ON t.league_id = l.id
      ORDER BY vfy.market_value_euro DESC
      LIMIT ${limit}
    `
    return players
  } catch (error) {
    console.error(`Error fetching top players for year ${year}:`, error)
    return []
  }
}

// Get top 5 leagues including Bundesliga
async function getTopLeagues() {
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
      LIMIT 5
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

// Update the getAgeValueData function to filter by year
async function getAgeValueData(year: number) {
  try {
    const data = await db`
      WITH player_age_groups AS (
        SELECT 
          p.id,
          CASE 
            WHEN p.age < 20 THEN 'Under 20'
            WHEN p.age BETWEEN 20 AND 23 THEN '20-23'
            WHEN p.age BETWEEN 24 AND 27 THEN '24-27'
            WHEN p.age BETWEEN 28 AND 31 THEN '28-31'
            ELSE 'Over 31'
          END as age_group,
          vfy.market_value_euro
        FROM players p
        JOIN player_valuations vfy ON p.id = vfy.player_id
        WHERE p.age IS NOT NULL 
          AND vfy.market_value_euro > 0
          AND vfy.season_start_year = ${year}
      )
      SELECT 
        age_group,
        ROUND(AVG(market_value_euro / 1000000)::numeric, 2) as avg_value_millions,
        COUNT(*) as player_count
      FROM player_age_groups
      GROUP BY age_group
      ORDER BY 
        CASE 
          WHEN age_group = 'Under 20' THEN 1
          WHEN age_group = '20-23' THEN 2
          WHEN age_group = '24-27' THEN 3
          WHEN age_group = '28-31' THEN 4
          ELSE 5
        END
    `

    return data
  } catch (error) {
    console.error(`Error fetching age value data for year ${year}:`, error)
    return []
  }
}

// Get position value data for a specific year
async function getPositionValueData(year: number) {
  try {
    const data = await db`
      WITH valuations_for_year AS (
        SELECT player_id, market_value_euro
        FROM player_valuations
        WHERE season_start_year = ${year}
      ),
      position_groups AS (
        SELECT 
          p.id,
          CASE 
            WHEN position ILIKE '%goalkeeper%' OR position ILIKE '%keeper%' OR position ILIKE 'GK' THEN 'Goalkeeper'
            WHEN position ILIKE '%defender%' OR position ILIKE '%back%' OR position ILIKE '%centre-back%' OR position ILIKE '%CB%' THEN 'Defender'
            WHEN position ILIKE '%midfielder%' OR position ILIKE '%midfield%' OR position ILIKE '%CM%' OR position ILIKE '%DM%' OR position ILIKE '%AM%' THEN 'Midfielder'
            WHEN position ILIKE '%forward%' OR position ILIKE '%winger%' OR position ILIKE '%striker%' OR position ILIKE '%CF%' OR position ILIKE '%ST%' THEN 'Forward'
            ELSE 'Other'
          END as position_group,
          vfy.market_value_euro
        FROM players p
        JOIN valuations_for_year vfy ON p.id = vfy.player_id
        WHERE p.position IS NOT NULL
      )
      SELECT 
        position_group,
        AVG(market_value_euro / 1000000) as avg_value_millions,
        COUNT(*) as player_count
      FROM position_groups
      GROUP BY position_group
      ORDER BY avg_value_millions DESC
    `
    return data
  } catch (error) {
    console.error(`Error fetching position value data for year ${year}:`, error)
    return []
  }
}

// Get top teams by total squad value for a specific year
async function getTopTeamsByValue(year: number, limit = 10) {
  try {
    const teams = await db`
      WITH valuations_for_year AS (
        SELECT player_id, market_value_euro
        FROM player_valuations
        WHERE season_start_year = ${year}
      ),
      team_values AS (
        SELECT 
          t.id,
          t.name,
          l.name as league_name,
          SUM(vfy.market_value_euro) as total_value,
          COUNT(p.id) as squad_size
        FROM teams t
        JOIN players p ON t.id = p.current_team_id
        JOIN valuations_for_year vfy ON p.id = vfy.player_id
        JOIN leagues l ON t.league_id = l.id
        GROUP BY t.id, t.name, l.name
      )
      SELECT *
      FROM team_values
      ORDER BY total_value DESC
      LIMIT ${limit}
    `
    return teams
  } catch (error) {
    console.error(`Error fetching top teams by value for year ${year}:`, error)
    return []
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const stats = await getStats()
  const availableYears = await getAvailableYears()
  const defaultYear = await getCurrentYear()

  // Get the year from the URL or use the default
  const yearParam = searchParams.year ? Number(searchParams.year) : undefined
  const currentYear = yearParam && availableYears.includes(yearParam) ? yearParam : defaultYear

  // Get top players overall for a specific year
  const topPlayers = await getTopPlayers(currentYear)
  const topLeagues = await getTopLeagues()

  // Get top players for each of the top leagues for the current year
  const leaguesWithPlayers = await Promise.all(
    topLeagues.map(async (league) => {
      const players = await getTopPlayersByLeagueAndYear(league.id, currentYear, 10)
      return {
        ...league,
        players,
      }
    }),
  )

  // Get data for charts
  let ageValueData = await getAgeValueData(currentYear)
  let positionValueData = await getPositionValueData(currentYear)
  const topTeamsByValue = await getTopTeamsByValue(currentYear)

  // Use mock data if real data is empty
  if (!ageValueData || ageValueData.length === 0) {
    console.log("Using mock age value data")
    ageValueData = generateMockAgeValueData()
  }

  if (!positionValueData || positionValueData.length === 0) {
    console.log("Using mock position value data")
    positionValueData = generateMockPositionValueData()
  }

  // If we don't have enough league data, use mock data
  const leaguesForDistribution =
    leaguesWithPlayers.length >= 3 && leaguesWithPlayers.every((l) => l.players && l.players.length > 5)
      ? leaguesWithPlayers
      : generateMockLeagueData()

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Deadline Day</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Track and analyze football player statistics and market valuations
      </p>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-2xl font-bold">{stats.players}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leagues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Trophy className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-2xl font-bold">{stats.leagues}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Teams</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <BarChart className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-2xl font-bold">{stats.teams}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Valuations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Database className="mr-2 h-4 w-4 text-gray-500" />
              <span className="text-2xl font-bold">{stats.valuations}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Players Overall */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Players by Market Value</CardTitle>
              <CardDescription>The most valuable players worldwide</CardDescription>
            </div>
            <YearSelectorWrapper currentYear={currentYear} availableYears={availableYears} />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPlayers.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      {player.image_url ? <AvatarImage src={player.image_url} alt={player.name} /> : null}
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{player.name}</div>
                      <div className="text-xs text-gray-500">{player.team_name || "Unknown Team"}</div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    €{(Number(player.market_value_euro) / 1000000).toFixed(1)}M
                  </Badge>
                </Link>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/players">
                <Button variant="outline" className="w-full">
                  View All Players
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Market Value Distribution by Age */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Market Value by Age Group</CardTitle>
              <CardDescription>Average player value by age group (in millions €)</CardDescription>
            </div>
            <YearSelectorWrapper currentYear={currentYear} availableYears={availableYears} />
          </CardHeader>
          <CardContent className="h-[400px]">
            {ageValueData.length > 0 ? (
              <AgeValueChart data={ageValueData} />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">No age data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Players by League */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Players by League</CardTitle>
            <CardDescription>Most valuable players in the top leagues</CardDescription>
          </div>
          <YearSelectorWrapper currentYear={currentYear} availableYears={availableYears} />
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={topLeagues[0]?.id.toString()}>
            <div className="tabs-list-container">
              <TabsList className="mb-4 w-full justify-start">
                {leaguesWithPlayers.map((league) => (
                  <TabsTrigger key={league.id} value={league.id.toString()}>
                    {league.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {leaguesWithPlayers.map((league) => (
              <TabsContent key={league.id} value={league.id.toString()}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {league.players.map((player) => (
                    <Link key={player.id} href={`/players/${player.id}`} className="block">
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex flex-col items-center text-center">
                            <Avatar className="h-16 w-16 mb-2">
                              {player.image_url ? <AvatarImage src={player.image_url} alt={player.name} /> : null}
                              <AvatarFallback className="text-lg">{player.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h3 className="font-semibold">{player.name}</h3>
                            <p className="text-sm text-gray-500">{player.team_name}</p>
                            <Badge variant="secondary" className="mt-2">
                              €{(Number(player.market_value_euro) / 1000000).toFixed(1)}M
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link href={`/players?leagueId=${league.id}`}>
                    <Button variant="link" className="text-primary">
                      View all players in {league.name}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Additional Infographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Position Value Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Market Value by Position</CardTitle>
              <CardDescription>Average player value by position (in millions €)</CardDescription>
            </div>
            <YearSelectorWrapper currentYear={currentYear} availableYears={availableYears} />
          </CardHeader>
          <CardContent className="h-[400px]">
            <PositionValueChart data={positionValueData} />
          </CardContent>
        </Card>

        {/* Top Teams by Squad Value */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Top Teams by Squad Value</CardTitle>
              <CardDescription>Total market value of all players (in millions €)</CardDescription>
            </div>
            <YearSelectorWrapper currentYear={currentYear} availableYears={availableYears} />
          </CardHeader>
          <CardContent className="h-[400px]">
            <TopTeamsChart data={topTeamsByValue} />
          </CardContent>
        </Card>
      </div>

      {/* League Value Distribution */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>League Value Distribution</CardTitle>
            <CardDescription>Comparison of player market values across top leagues</CardDescription>
          </div>
          <YearSelectorWrapper currentYear={currentYear} availableYears={availableYears} />
        </CardHeader>
        <CardContent className="h-[450px]">
          <LeagueValueDistribution leagues={leaguesForDistribution} />
        </CardContent>
      </Card>
    </main>
  )
}

