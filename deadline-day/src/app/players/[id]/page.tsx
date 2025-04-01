"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PlayerValuationChart } from "@/components/player-valuation-chart"

export default function PlayerPage({ params }: { params: { id: string } }) {
  const playerId = Number.parseInt(params.id)
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("stats")
  const [selectedSeason, setSelectedSeason] = useState<number | null>(null)
  const [currentStats, setCurrentStats] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch player data from our API
        const response = await fetch(`/api/players/${playerId}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch player data")
        }

        const playerData = await response.json()
        setPlayer(playerData)

        // Set the initial selected season to the most recent one
        if (playerData.playerStats && playerData.playerStats.length > 0) {
          setSelectedSeason(playerData.playerStats[0].season_start_year)
          setCurrentStats(playerData.playerStats[0])
        }
      } catch (error) {
        console.error("Error fetching player data:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [playerId])

  // Handle season change
  const handleSeasonChange = (season: string) => {
    const seasonYear = Number.parseInt(season)
    setSelectedSeason(seasonYear)
    if (player?.playerStats) {
      const stats = player.playerStats.find((s: any) => s.season_start_year === seasonYear)
      if (stats) {
        setCurrentStats(stats)
      }
    }
  }

  // Format a value for display
  const formatValue = (value: any, isPercentage = false) => {
    if (value === null || value === undefined) return "N/A"

    const num = Number(value)
    if (isNaN(num)) return value.toString()

    if (isPercentage) {
      // Check if the value is already in percentage form (0-100) or decimal form (0-1)
      const percentage = num > 1 ? num : num * 100
      return `${percentage.toFixed(1)}%`
    }

    return num.toFixed(2)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
              <Skeleton className="h-8 w-48 mx-auto" />
              <div className="flex justify-center gap-2 mt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="p-0">
              <div className="p-4">
                <Skeleton className="h-10 w-full mb-6" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Player</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="mt-4">Please try again later or contact support if the problem persists.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Player Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The player you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Ensure valuationHistory exists
  const valuationHistory = player.valuationHistory || []
  const playerStats = player.playerStats || []

  // Group statistics into categories
  const statCategories = [
    {
      name: "General",
      stats: [
        { key: "season_start_year", label: "Season", isPercentage: false },
        { key: "team_name", label: "Team", isPercentage: false },
        { key: "league_name", label: "League", isPercentage: false },
        { key: "based_on_minutes", label: "Minutes Played", isPercentage: false },
      ],
    },
    {
      name: "Attacking",
      stats: [
        { key: "goals_per90", label: "Goals per 90", isPercentage: false },
        { key: "goals_percentile", label: "Goals Percentile", isPercentage: false },
        { key: "non_penalty_goals_per90", label: "Non-Penalty Goals per 90", isPercentage: false },
        { key: "non_penalty_goals_percentile", label: "Non-Penalty Goals Percentile", isPercentage: false },
        { key: "assists_per90", label: "Assists per 90", isPercentage: false },
        { key: "assists_percentile", label: "Assists Percentile", isPercentage: false },
        { key: "goals_assists_per90", label: "Goals + Assists per 90", isPercentage: false },
        { key: "goals_assists_percentile", label: "Goals + Assists Percentile", isPercentage: false },
      ],
    },
    {
      name: "Shooting",
      stats: [
        { key: "shots_total_per90", label: "Shots Total per 90", isPercentage: false },
        { key: "shots_total_percentile", label: "Shots Total Percentile", isPercentage: false },
        { key: "shots_on_target_per90", label: "Shots on Target per 90", isPercentage: false },
        { key: "shots_on_target_percentile", label: "Shots on Target Percentile", isPercentage: false },
        { key: "shots_on_target_pct_per90", label: "Shots on Target %", isPercentage: true },
        { key: "shots_on_target_pct_percentile", label: "Shots on Target % Percentile", isPercentage: false },
      ],
    },
    {
      name: "Passing",
      stats: [
        { key: "pass_completion_pct_per90", label: "Pass Completion %", isPercentage: true },
        { key: "pass_completion_pct_percentile", label: "Pass Completion % Percentile", isPercentage: false },
        { key: "progressive_passes_per90", label: "Progressive Passes per 90", isPercentage: false },
        { key: "progressive_passes_percentile", label: "Progressive Passes Percentile", isPercentage: false },
        { key: "key_passes_per90", label: "Key Passes per 90", isPercentage: false },
        { key: "key_passes_percentile", label: "Key Passes Percentile", isPercentage: false },
        { key: "passes_into_final_third_per90", label: "Passes into Final Third per 90", isPercentage: false },
        { key: "passes_into_final_third_percentile", label: "Passes into Final Third Percentile", isPercentage: false },
        { key: "passes_into_penalty_area_per90", label: "Passes into Penalty Area per 90", isPercentage: false },
        {
          key: "passes_into_penalty_area_percentile",
          label: "Passes into Penalty Area Percentile",
          isPercentage: false,
        },
        { key: "crosses_per90", label: "Crosses per 90", isPercentage: false },
        { key: "crosses_percentile", label: "Crosses Percentile", isPercentage: false },
      ],
    },
    {
      name: "Possession",
      stats: [
        { key: "touches_per90", label: "Touches per 90", isPercentage: false },
        { key: "touches_percentile", label: "Touches Percentile", isPercentage: false },
        { key: "touches_att_3rd_per90", label: "Touches in Attacking Third per 90", isPercentage: false },
        { key: "touches_att_3rd_percentile", label: "Touches in Attacking Third Percentile", isPercentage: false },
        { key: "touches_att_pen_per90", label: "Touches in Penalty Area per 90", isPercentage: false },
        { key: "touches_att_pen_percentile", label: "Touches in Penalty Area Percentile", isPercentage: false },
        { key: "carries_per90", label: "Carries per 90", isPercentage: false },
        { key: "carries_percentile", label: "Carries Percentile", isPercentage: false },
        { key: "progressive_carries_per90", label: "Progressive Carries per 90", isPercentage: false },
        { key: "progressive_carries_percentile", label: "Progressive Carries Percentile", isPercentage: false },
        { key: "successful_take_ons_per90", label: "Successful Take-Ons per 90", isPercentage: false },
        { key: "successful_take_ons_percentile", label: "Successful Take-Ons Percentile", isPercentage: false },
      ],
    },
    {
      name: "Defending",
      stats: [
        { key: "tackles_per90", label: "Tackles per 90", isPercentage: false },
        { key: "tackles_percentile", label: "Tackles Percentile", isPercentage: false },
        { key: "tackles_won_per90", label: "Tackles Won per 90", isPercentage: false },
        { key: "tackles_won_percentile", label: "Tackles Won Percentile", isPercentage: false },
        { key: "interceptions_per90", label: "Interceptions per 90", isPercentage: false },
        { key: "interceptions_percentile", label: "Interceptions Percentile", isPercentage: false },
        { key: "blocks_per90", label: "Blocks per 90", isPercentage: false },
        { key: "blocks_percentile", label: "Blocks Percentile", isPercentage: false },
        { key: "clearances_per90", label: "Clearances per 90", isPercentage: false },
        { key: "clearances_percentile", label: "Clearances Percentile", isPercentage: false },
      ],
    },
    {
      name: "Aerial Duels",
      stats: [
        { key: "aerials_won_per90", label: "Aerials Won per 90", isPercentage: false },
        { key: "aerials_won_percentile", label: "Aerials Won Percentile", isPercentage: false },
        { key: "aerials_lost_per90", label: "Aerials Lost per 90", isPercentage: false },
        { key: "aerials_lost_percentile", label: "Aerials Lost Percentile", isPercentage: false },
        { key: "aerials_won_pct_per90", label: "Aerials Won %", isPercentage: true },
        { key: "aerials_won_pct_percentile", label: "Aerials Won % Percentile", isPercentage: false },
      ],
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Player Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-32 w-32 mx-auto mb-4">
              {player.image_url ? <AvatarImage src={player.image_url} alt={player.name} /> : null}
              <AvatarFallback className="text-4xl">{player.name?.charAt(0) || "P"}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-2xl">{player.name || "Unknown Player"}</CardTitle>
            <div className="flex justify-center gap-2 mt-2">
              <Badge>{player.position || "Unknown"}</Badge>
              <Badge variant="outline">{player.nationality || "Unknown"}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Team</span>
                <span className="font-medium">{player.team || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">League</span>
                <span className="font-medium">{player.league || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Age</span>
                <span className="font-medium">{player.age || "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Market Value</span>
                <span className="font-medium">
                  {player.market_value_euro ? `€${(player.market_value_euro / 1000000).toFixed(1)}M` : "Unknown"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Statistics */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="stats">Statistics</TabsTrigger>
                <TabsTrigger value="valuation">Valuation</TabsTrigger>
              </TabsList>

              <TabsContent value="stats" className="p-6">
                {playerStats.length > 0 ? (
                  <div>
                    {/* Season Selector */}
                    {playerStats.length > 1 && (
                      <div className="mb-6">
                        <Select value={selectedSeason?.toString()} onValueChange={handleSeasonChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Season" />
                          </SelectTrigger>
                          <SelectContent>
                            {playerStats.map((stat: any) => (
                              <SelectItem key={stat.season_start_year} value={stat.season_start_year.toString()}>
                                {stat.season_start_year}-{stat.season_start_year + 1} - {stat.team_name || "Unknown"} (
                                {stat.league_name || "Unknown"})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Statistics Tables */}
                    {currentStats ? (
                      <div className="space-y-8">
                        {statCategories.map((category) => (
                          <div key={category.name}>
                            <h3 className="text-lg font-semibold mb-3">{category.name}</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Statistic</TableHead>
                                  <TableHead className="text-right">Value</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {category.stats.map((stat) => (
                                  <TableRow key={stat.key}>
                                    <TableCell>{stat.label}</TableCell>
                                    <TableCell className="text-right">
                                      {formatValue(currentStats[stat.key], stat.isPercentage)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">Select a season to view statistics.</div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No statistics available for this player.</div>
                )}
              </TabsContent>

              <TabsContent value="valuation" className="p-6">
                {valuationHistory.length > 0 ? (
                  <PlayerValuationChart data={valuationHistory} />
                ) : (
                  <div className="text-center py-8 text-gray-500">No valuation history available for this player.</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

