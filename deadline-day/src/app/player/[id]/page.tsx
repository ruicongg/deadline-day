import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Flag, MapPin, ShirtIcon, Trophy, DollarSign } from "lucide-react"
import Link from "next/link"
import { PlayerStatsDetail } from "@/components/player-stats-detail"
import type { PlayerBasicInfo, PlayerDetailedStats } from "@/types/player-stats"

// Sample player data
const players: PlayerBasicInfo[] = [
  {
    id: 1,
    name: "Paulo Dybala",
    age: 26,
    player_market_value_euro: 72000000,
    season_start_year: 2019,
    team: "Juventus",
    position: "Forward",
    nationality: "Argentina",
    image: "/placeholder.svg?height=200&width=200",
    league: "Serie A",
  },
  {
    id: 2,
    name: "Christian Eriksen",
    age: 28,
    player_market_value_euro: 68000000,
    season_start_year: 2019,
    team: "Tottenham/Inter Milan",
    position: "Midfielder",
    nationality: "Denmark",
    image: "/placeholder.svg?height=200&width=200",
    league: "Premier League/Serie A",
  },
  {
    id: 3,
    name: "Aaron Cresswell",
    age: 30,
    player_market_value_euro: 15000000,
    season_start_year: 2017,
    team: "West Ham United",
    position: "Fullback",
    nationality: "England",
    image: "/placeholder.svg?height=200&width=200",
    league: "Premier League",
  },
]

// Sample detailed stats for Aaron Cresswell
const cresswellStats: PlayerDetailedStats = {
  player: "Aaron Cresswell",
  versus: "Center Backs",
  basedOnMinutes: 3069,
  scouting_period: "2017-2018 Premier League",
  metrics: {
    // Attacking metrics
    Goals: { per90: 0.03, percentile: 53 },
    Non_Penalty_Goals: { per90: 0.03, percentile: 53 },
    Assists: { per90: 0.21, percentile: 99 },\
    Goals_+_Assists: { per90: 0.23, percentile: 98 },
    Shots_Total: { per90: 0.62, percentile: 70 },
    Shots_on_Target: { per90: 0.18, percentile: 54 },
    Shots_on_Target_%: { per90: 28.6, percentile: 46 },
    Goals_Shot: { per90: 0.05, percentile: 54 },
    Goals_Shot_on_Target: { per90: 0.17, percentile: 46 },
    
    // Passing metrics
    Pass_Completion_%: { per90: 69.9, percentile: 7 },
    Progressive_Passes: { per90: 3.75, percentile: 72 },
    Key_Passes: { per90: 1.0, percentile: 99 },
    Passes_into_Final_Third: { per90: 3.96, percentile: 93 },
    Passes_into_Penalty_Area: { per90: 0.62, percentile: 96 },
    Crosses: { per90: 5.75, percentile: 99 },
    Crosses_into_Penalty_Area: { per90: 0.29, percentile: 96 },
    
    // Possession metrics
    Touches: { per90: 59.68, percentile: 23 },
    Touches_Att_3rd: { per90: 14.57, percentile: 92 },
    Touches_Att_Pen: { per90: 0.44, percentile: 96 },
    Touches_Mid_3rd: { per90: 28.8, percentile: 23 },
    Touches_Def_3rd: { per90: 16.77, percentile: 8 },
    Touches_Def_Pen: { per90: 3.52, percentile: 23 },
    
    Carries: { per90: 25.51, percentile: 53 },
    Progressive_Carries: { per90: 1.03, percentile: 30 },
    Carries_into_Final_Third: { per90: 1.41, percentile: 94 },
    Carries_into_Penalty_Area: { per90: 0.03, percentile: 55 },
    Progressive_Carrying_Distance: { per90: 57.45, percentile: 75 },
    Total_Carrying_Distance: { per90: 118.24, percentile: 64 },
    Successful_Take_Ons: { per90: 0.15, percentile: 32 },
    Successful_Take_On_%: { per90: 35.7, percentile: 9 },
    
    // Defending metrics
    Tackles: { per90: 1.0, percentile: 12 },
    Tackles_Won: { per90: 0.62, percentile: 9 },
    Tackles_Def_3rd: { per90: 0.35, percentile: 22 },
    Tackles_Mid_3rd: { per90: 0.59, percentile: 37 },
    Tackles_Att_3rd: { per90: 0.06, percentile: 45 },
    Dribblers_Tackled: { per90: 0.56, percentile: 42 },
    "%_of_Dribblers_Tackled": { per90: 63.3, percentile: 83 },
    Dribbles_Challenged: { per90: 0.88, percentile: 17 },
    Interceptions: { per90: 1.29, percentile: 26 },
    Blocks: { per90: 1.23, percentile: 59 },
    Clearances: { per90: 3.43, percentile: 7 },
    
    // Duels metrics
    Aerials_Won: { per90: 1.67, percentile: 9 },
    Aerials_Lost: { per90: 1.38, percentile: 82 },
    "%_of_Aerials_Won": { per90: 54.8, percentile: 30 },
  }
};

export default function PlayerPage({ params }: { params: { id: string } }) {
  const playerId = Number.parseInt(params.id)
  const player = players.find((p) => p.id === playerId)

  if (!player) {
    return <div className="container mx-auto py-6 px-4">Player not found</div>
  }

  // Format market value to millions
  const formatMarketValue = (value: number) => {
    return `€${(value / 1000000).toFixed(1)}M`
  }

  // Use Aaron Cresswell's stats for demo purposes
  // In a real app, you would fetch the specific player's stats
  const playerStats = cresswellStats

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="h-32 w-32">
              <AvatarImage src={player.image} alt={player.name} />
              <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <CardTitle className="mt-4 text-2xl">{player.name}</CardTitle>
            <CardDescription className="flex items-center justify-center">
              <Badge className="mr-2">{player.position}</Badge>
              <span>{player.team}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <Flag className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{player.nationality}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Age: {player.age}</span>
              </div>
              <div className="flex items-center">
                <ShirtIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Team: {player.team}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">League: {player.league}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Market Value: {formatMarketValue(player.player_market_value_euro)}</span>
              </div>
              <div className="flex items-center">
                <Trophy className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Season: {player.season_start_year}/{player.season_start_year + 1}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <PlayerStatsDetail playerStats={playerStats} />
        </div>
      </div>
    </div>
  )
}

