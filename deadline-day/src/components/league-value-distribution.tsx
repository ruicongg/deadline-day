"use client"
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts"

interface Player {
  id: number
  name: string
  market_value_euro: number
  team_name: string
}

interface League {
  id: number
  name: string
  players: Player[]
}

interface LeagueValueDistributionProps {
  leagues: League[]
}

export function LeagueValueDistribution({ leagues }: LeagueValueDistributionProps) {
  // Transform data for the scatter plot
  const scatterData = leagues.map((league) => {
    return {
      name: league.name,
      data: league.players.map((player) => ({
        x: Math.random() * 100, // Random x position for distribution
        y: Number(player.market_value_euro) / 1000000, // Convert to millions
        z: 1,
        name: player.name,
        team: player.team_name,
        value: `€${(Number(player.market_value_euro) / 1000000).toFixed(1)}M`,
      })),
    }
  })

  // Generate colors for each league
  const colors = [
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ef4444", // red
    "#10b981", // green
    "#f97316", // orange
  ]

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis type="number" dataKey="x" name="distribution" hide />
          <YAxis
            type="number"
            dataKey="y"
            name="value"
            unit="M"
            label={{ value: "Market Value (€M)", angle: -90, position: "insideLeft" }}
          />
          <ZAxis type="number" dataKey="z" range={[50, 200]} />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{data.team}</p>
                    <p className="font-bold">{data.value}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend />
          {scatterData.map((entry, index) => (
            <Scatter key={entry.name} name={entry.name} data={entry.data} fill={colors[index % colors.length]} />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  )
}

