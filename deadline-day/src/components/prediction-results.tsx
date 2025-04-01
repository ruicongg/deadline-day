"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PredictionResult {
  player: string
  actual_value?: number
  predicted_value: number
  difference?: number
  difference_percentage?: number
}

interface PredictionResultsProps {
  results: PredictionResult[]
}

export function PredictionResults({ results }: PredictionResultsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter results based on search term
  const filteredResults = results.filter((result) => result.player.toLowerCase().includes(searchTerm.toLowerCase()))

  // Format currency in millions
  const formatCurrency = (value: number) => {
    return `€${(value / 1000000).toFixed(2)}M`
  }

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  // Download results as CSV
  const downloadCSV = () => {
    const headers = ["Player", "Actual Value (€)", "Predicted Value (€)", "Difference (€)", "Difference (%)"]
    const csvRows = [
      headers.join(","),
      ...results.map((result) =>
        [
          `"${result.player}"`,
          result.actual_value || "",
          result.predicted_value,
          result.difference || "",
          result.difference_percentage ? `${result.difference_percentage}%` : "",
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "player_valuation_predictions.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button variant="outline" size="sm" onClick={downloadCSV}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              {results[0]?.actual_value !== undefined && <TableHead className="text-right">Actual Value</TableHead>}
              <TableHead className="text-right">Predicted Value</TableHead>
              {results[0]?.difference !== undefined && (
                <>
                  <TableHead className="text-right">Difference</TableHead>
                  <TableHead className="text-right">Difference %</TableHead>
                </>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResults.length > 0 ? (
              filteredResults.map((result, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{result.player}</TableCell>
                  {result.actual_value !== undefined && (
                    <TableCell className="text-right">{formatCurrency(result.actual_value)}</TableCell>
                  )}
                  <TableCell className="text-right font-semibold">{formatCurrency(result.predicted_value)}</TableCell>
                  {result.difference !== undefined && (
                    <>
                      <TableCell className={`text-right ${result.difference > 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatCurrency(result.difference)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${result.difference_percentage! > 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatPercentage(result.difference_percentage!)}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No results found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

