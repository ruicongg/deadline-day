"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type PlayerDetailedStats, metricCategories } from "@/types/player-stats"
import { PlayerPercentileChart } from "@/components/player-percentile-chart"

interface PlayerStatsDetailProps {
  playerStats: PlayerDetailedStats
}

export function PlayerStatsDetail({ playerStats }: PlayerStatsDetailProps) {
  const [selectedCategory, setSelectedCategory] = useState("Attacking")
  const [comparisonType, setComparisonType] = useState("Center Backs")

  // Get the metrics for the selected category
  const categoryMetrics = metricCategories.find((cat) => cat.name === selectedCategory)?.metrics || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{playerStats.player} Statistics</h2>
          <p className="text-muted-foreground">
            Based on {playerStats.basedOnMinutes} minutes during {playerStats.scouting_period}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Compared to:</span>
          <Select value={comparisonType} onValueChange={setComparisonType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Center Backs">Center Backs</SelectItem>
              <SelectItem value="Fullbacks">Fullbacks</SelectItem>
              <SelectItem value="Midfielders">Midfielders</SelectItem>
              <SelectItem value="Forwards">Forwards</SelectItem>
              <SelectItem value="Goalkeepers">Goalkeepers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="table" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="radar">Radar Chart</TabsTrigger>
          <TabsTrigger value="percentile">Percentile Ranks</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Detailed Statistics</h3>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {metricCategories.map((category) => (
                  <SelectItem key={category.name} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Metric</TableHead>
                    <TableHead className="text-right">Per 90</TableHead>
                    <TableHead className="text-right">Percentile</TableHead>
                    <TableHead className="text-right">Rank</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryMetrics.map((metric) => {
                    const metricKey = metric.replace(/[()]/g, "").replace(/\s+/g, "_")
                    const per90Key = `Per90_${metric}`
                    const percentileKey = `Percentile_${metric}`

                    const per90Value = playerStats.metrics[metricKey]?.per90 || 0
                    const percentileValue = playerStats.metrics[metricKey]?.percentile || 0

                    return (
                      <TableRow key={metric}>
                        <TableCell className="font-medium">{metric}</TableCell>
                        <TableCell className="text-right">{per90Value.toFixed(2)}</TableCell>
                        <TableCell className="text-right">{percentileValue}</TableCell>
                        <TableCell className="text-right w-1/4">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={percentileValue}
                              className="h-2"
                              indicatorClassName={
                                percentileValue >= 80
                                  ? "bg-green-500"
                                  : percentileValue >= 50
                                    ? "bg-blue-500"
                                    : percentileValue >= 20
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                              }
                            />
                            <span className="text-xs w-8">{percentileValue}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="radar">
          <Card>
            <CardHeader>
              <CardTitle>Performance Radar</CardTitle>
              <CardDescription>Key metrics compared to position average</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px]">
              <PlayerPercentileChart playerStats={playerStats} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="percentile">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metricCategories.map((category) => (
              <Card key={category.name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.metrics.slice(0, 6).map((metric) => {
                    const metricKey = metric.replace(/[()]/g, "").replace(/\s+/g, "_")
                    const percentileValue = playerStats.metrics[metricKey]?.percentile || 0

                    return (
                      <div key={metric} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{metric}</span>
                          <span className="font-medium">{percentileValue}%</span>
                        </div>
                        <Progress
                          value={percentileValue}
                          className="h-2"
                          indicatorClassName={
                            percentileValue >= 80
                              ? "bg-green-500"
                              : percentileValue >= 50
                                ? "bg-blue-500"
                                : percentileValue >= 20
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                          }
                        />
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

