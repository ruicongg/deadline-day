import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, TrophyIcon, UsersIcon } from "lucide-react"

interface LeagueCount {
  name: string
  player_count: number
}

interface StatsOverviewProps {
  leagueCounts?: LeagueCount[]
}

export function StatsOverview({ leagueCounts = [] }: StatsOverviewProps) {
  // Calculate total players
  const totalPlayers = leagueCounts.reduce((sum, league) => sum + Number.parseInt(league.player_count), 0)

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Players</CardTitle>
          <UsersIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPlayers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">From {leagueCounts.length} leagues</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top League</CardTitle>
          <TrophyIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{leagueCounts.length > 0 ? leagueCounts[0].name : "N/A"}</div>
          <p className="text-xs text-muted-foreground">
            {leagueCounts.length > 0
              ? `${Number.parseInt(leagueCounts[0].player_count).toLocaleString()} players`
              : "No data available"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Market Value</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">€15.2M</div>
          <p className="text-xs text-muted-foreground">
            <span className="text-emerald-500 flex items-center">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              +2.5%
            </span>{" "}
            from last season
          </p>
        </CardContent>
      </Card>
    </>
  )
}

