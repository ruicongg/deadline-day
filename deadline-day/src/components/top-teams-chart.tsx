"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TeamValue {
  id: number
  name: string
  league_name: string
  total_value: number
  squad_size: number
}

interface TopTeamsChartProps {
  data: TeamValue[]
}

export function TopTeamsChart({ data }: TopTeamsChartProps) {
  // Transform data for the chart
  const chartData = data
    .map((team) => ({
      name: team.name,
      value: Number(team.total_value) / 1000000, // Convert to millions
      league: team.league_name,
      squad: team.squad_size,
    }))
    .sort((a, b) => b.value - a.value) // Sort by value descending
    .slice(0, 10) // Take top 10

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{
          top: 20,
          right: 30,
          left: 120, // Increased to accommodate team names
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" label={{ value: "Squad Value (€M)", position: "insideBottom", offset: -10 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-gray-500">{data.league}</p>
                  <p className="text-sm">Squad Size: {data.squad} players</p>
                  <p className="font-bold">€{data.value.toFixed(1)}M</p>
                </div>
              )
            }
            return null
          }}
        />
        <Legend />
        <Bar dataKey="value" name="Squad Value (€M)" fill="#3b82f6" barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  )
}

