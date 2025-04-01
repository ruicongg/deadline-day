"use client"

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SeasonStats {
  season: string
  league: string
  stats: {
    label: string
    value: string | number
  }[][]
}

interface PlayerPerformanceStatsProps {
  seasons: SeasonStats[]
}

export function PlayerPerformanceStats({ seasons }: PlayerPerformanceStatsProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {seasons.map((season, index) => (
          <div key={season.season} className={`${index > 0 ? "border-t pt-6" : ""}`}>
            <h3 className="text-lg font-semibold mb-4">
              {season.season} {season.league}
            </h3>
            <div className="grid grid-cols-3 gap-y-4 gap-x-8">
              {season.stats.map((statGroup, groupIndex) => (
                <React.Fragment key={`group-${groupIndex}`}>
                  {statGroup.map((stat) => (
                    <div key={stat.label} className="space-y-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                      <p className="text-lg font-semibold">{stat.value}</p>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

