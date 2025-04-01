"use client"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface PositionValueData {
  position_group: string
  avg_value_millions: number
  player_count: number
}

interface PositionValueChartProps {
  data: PositionValueData[]
}

export function PositionValueChart({ data }: PositionValueChartProps) {
  // Transform data for the chart
  const chartData = data.map((item) => ({
    name: item.position_group,
    value: Number(item.avg_value_millions),
    count: Number(item.player_count),
  }))

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis
          yAxisId="left"
          orientation="left"
          stroke="#10b981"
          label={{ value: "Avg. Value (€M)", angle: -90, position: "insideLeft" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#f97316"
          label={{ value: "Player Count", angle: 90, position: "insideRight" }}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-700 rounded shadow-md">
                  <p className="font-medium">{label}</p>
                  <p className="text-sm text-green-500">Avg. Value: €{payload[0].value.toFixed(2)}M</p>
                  <p className="text-sm text-orange-500">Players: {payload[1].value}</p>
                </div>
              )
            }
            return null
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="value" name="Avg. Value (€M)" fill="#10b981" />
        <Bar yAxisId="right" dataKey="count" name="Player Count" fill="#f97316" />
      </BarChart>
    </ResponsiveContainer>
  )
}

