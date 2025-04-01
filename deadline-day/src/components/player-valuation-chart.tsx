"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ValuationData {
  season: string
  value: number
  league?: string
}

interface PlayerValuationChartProps {
  data: ValuationData[]
  title?: string
  description?: string
}

export function PlayerValuationChart({
  data = [],
  title = "Market Value History",
  description = "Player's market value over time (in millions €)",
}: PlayerValuationChartProps) {
  // Check if data is empty
  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No valuation data available</p>
        </CardContent>
      </Card>
    )
  }

  // Format data for the chart
  const chartData = data.map((item) => ({
    season: item.season,
    value: Number(item.value) / 1000000, // Convert to millions
    league: item.league || "",
  }))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="season" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
            <YAxis label={{ value: "Value (€M)", angle: -90, position: "insideLeft" }} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [`€${value}M`, "Market Value"]}
              labelFormatter={(label) => `Season: ${label}`}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
                      <p className="font-medium">Season: {label}</p>
                      {payload[0].payload.league && (
                        <p className="text-sm text-gray-500">{payload[0].payload.league}</p>
                      )}
                      <p className="font-bold">€{payload[0].value}M</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Market Value (€M)"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

