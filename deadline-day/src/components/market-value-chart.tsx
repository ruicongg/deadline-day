"use client"

import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface MarketValueChartProps {
  data: {
    season: string
    value: number
  }[]
}

export function MarketValueChart({ data }: MarketValueChartProps) {
  // Find the max value to set an appropriate Y-axis domain
  const maxValue = Math.max(...data.map((item) => item.value)) * 1.1 // Add 10% padding

  return (
    <ChartContainer
      config={{
        value: {
          label: "Market Value (€M)",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 30 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="season" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
          <YAxis domain={[0, maxValue]} tickFormatter={(value) => `€${value.toFixed(1)}M`} width={80} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="value"
            name="Market Value"
            stroke="var(--color-value)"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

