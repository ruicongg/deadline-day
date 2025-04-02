"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PlayerDataAnalysisProps {
  results: any
}

export function PlayerDataAnalysis({ results }: PlayerDataAnalysisProps) {
  if (!results) return null

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `€${(value / 1000).toFixed(2)}K`
    } else {
      return `€${value.toFixed(2)}`
    }
  }

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`
  }

  // Count players in each value category
  const categoryCounts = {
    "High Value": 0,
    "Medium Value": 0,
    "Low Value": 0,
  }

  results.predictions.forEach((pred) => {
    if (pred.value_category) {
      categoryCounts[pred.value_category]++
    }
  })

  return (
    <div className="mt-8 space-y-6">
      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="predictions">
            <Users className="h-4 w-4 mr-2" />
            Player Predictions
          </TabsTrigger>
          <TabsTrigger value="statistics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Data Statistics
          </TabsTrigger>
          <TabsTrigger value="insights">
            <TrendingUp className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Predicted Value</TableHead>
                  {results.predictions[0].actual_value !== undefined && (
                    <>
                      <TableHead className="text-right">Actual Value</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.predictions.map((prediction, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{prediction.player}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          prediction.value_category === "High Value"
                            ? "default"
                            : prediction.value_category === "Medium Value"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {prediction.value_category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatValue(prediction.predicted_value)}</TableCell>
                    {prediction.actual_value !== undefined && (
                      <>
                        <TableCell className="text-right">{formatValue(prediction.actual_value)}</TableCell>
                        <TableCell
                          className={`text-right ${prediction.difference < 0 ? "text-red-500" : "text-green-500"}`}
                        >
                          {prediction.difference > 0 ? "+" : ""}
                          {formatValue(prediction.difference)} ({formatPercentage(prediction.difference_percentage)})
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Data Statistics</CardTitle>
              <CardDescription>Statistical summary of the uploaded player data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Dataset Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Players</p>
                      <p className="text-xl font-bold">{results.preprocessing_stats.raw_rows}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Features</p>
                      <p className="text-xl font-bold">{results.preprocessing_stats.columns}</p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Data Format</p>
                      <p className="text-xl font-bold">Normalized</p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Target Variable</p>
                      <p className="text-xl font-bold">Log-scaled</p>
                    </div>
                  </div>
                </div>

                {results.statistics.predicted_values && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Predicted Market Values</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Minimum</p>
                        <p className="text-xl font-bold">{formatValue(results.statistics.predicted_values.min)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Maximum</p>
                        <p className="text-xl font-bold">{formatValue(results.statistics.predicted_values.max)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Average</p>
                        <p className="text-xl font-bold">{formatValue(results.statistics.predicted_values.average)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Median</p>
                        <p className="text-xl font-bold">{formatValue(results.statistics.predicted_values.median)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">25th Percentile</p>
                        <p className="text-xl font-bold">
                          {formatValue(results.statistics.predicted_values.percentile25)}
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">75th Percentile</p>
                        <p className="text-xl font-bold">
                          {formatValue(results.statistics.predicted_values.percentile75)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {results.statistics.actual_values && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Actual Market Values</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Minimum</p>
                        <p className="text-xl font-bold">{formatValue(results.statistics.actual_values.min)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Maximum</p>
                        <p className="text-xl font-bold">{formatValue(results.statistics.actual_values.max)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Average</p>
                        <p className="text-xl font-bold">{formatValue(results.statistics.actual_values.average)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Median</p>
                        <p className="text-xl font-bold">{formatValue(results.statistics.actual_values.median)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Standard Deviation</p>
                        <p className="text-xl font-bold">{formatValue(results.statistics.actual_values.stdDev)}</p>
                      </div>
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">Count</p>
                        <p className="text-xl font-bold">{results.statistics.actual_values.count}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Value Distribution</CardTitle>
              <CardDescription>Analysis of player value categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(categoryCounts).map(([category, count]) => (
                    <div key={category} className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">{category} Players</p>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground">
                        {(((count as number) / results.predictions.length) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Value Thresholds</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">High Value Threshold (75th Percentile)</p>
                      <p className="text-xl font-bold">
                        {formatValue(results.statistics.predicted_values.percentile75)}
                      </p>
                    </div>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm text-muted-foreground">Low Value Threshold (25th Percentile)</p>
                      <p className="text-xl font-bold">
                        {formatValue(results.statistics.predicted_values.percentile25)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance metrics by category */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Performance Metrics by Value Category</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Avg. Value</TableHead>
                        <TableHead className="text-right">Attacking</TableHead>
                        <TableHead className="text-right">Passing</TableHead>
                        <TableHead className="text-right">Defensive</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {["High Value", "Medium Value", "Low Value"].map((category) => {
                        const playersInCategory = results.predictions.filter((p) => p.value_category === category)

                        if (playersInCategory.length === 0) return null

                        const avgValue =
                          playersInCategory.reduce((sum, p) => sum + p.predicted_value, 0) / playersInCategory.length

                        // Calculate average metrics if available
                        let avgAttacking = 0
                        let attackCount = 0
                        let avgPassing = 0
                        let passCount = 0
                        let avgDefensive = 0
                        let defenseCount = 0

                        playersInCategory.forEach((p) => {
                          if (p.performance_metrics) {
                            if (p.performance_metrics.attackingScore !== undefined) {
                              avgAttacking += p.performance_metrics.attackingScore
                              attackCount++
                            }
                            if (p.performance_metrics.passingScore !== undefined) {
                              avgPassing += p.performance_metrics.passingScore
                              passCount++
                            }
                            if (p.performance_metrics.defensiveScore !== undefined) {
                              avgDefensive += p.performance_metrics.defensiveScore
                              defenseCount++
                            }
                          }
                        })

                        avgAttacking = attackCount > 0 ? avgAttacking / attackCount : 0
                        avgPassing = passCount > 0 ? avgPassing / passCount : 0
                        avgDefensive = defenseCount > 0 ? avgDefensive / defenseCount : 0

                        return (
                          <TableRow key={category}>
                            <TableCell>
                              <Badge
                                variant={
                                  category === "High Value"
                                    ? "default"
                                    : category === "Medium Value"
                                      ? "outline"
                                      : "secondary"
                                }
                              >
                                {category}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">{formatValue(avgValue)}</TableCell>
                            <TableCell className="text-right">{avgAttacking.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{avgPassing.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{avgDefensive.toFixed(2)}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Model Performance Card (if actual values exist) */}
          {results.statistics.actual_values && (
            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Analysis of prediction accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Calculate average error metrics */}
                  {(() => {
                    const errors = results.predictions
                      .filter((p) => p.actual_value !== undefined)
                      .map((p) => ({
                        absolute: Math.abs(p.difference),
                        percentage: Math.abs(p.difference_percentage),
                      }))

                    if (errors.length === 0) return null

                    const avgAbsoluteError = errors.reduce((sum, e) => sum + e.absolute, 0) / errors.length
                    const avgPercentageError = errors.reduce((sum, e) => sum + e.percentage, 0) / errors.length

                    // Count over/under predictions
                    const overPredictions = results.predictions.filter((p) => p.difference < 0).length
                    const underPredictions = results.predictions.filter((p) => p.difference > 0).length

                    return (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Avg. Absolute Error</p>
                          <p className="text-xl font-bold">{formatValue(avgAbsoluteError)}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Avg. Percentage Error</p>
                          <p className="text-xl font-bold">{avgPercentageError.toFixed(2)}%</p>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Overpredictions</p>
                          <p className="text-xl font-bold">
                            {overPredictions} ({((overPredictions / errors.length) * 100).toFixed(1)}%)
                          </p>
                        </div>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-sm text-muted-foreground">Underpredictions</p>
                          <p className="text-xl font-bold">
                            {underPredictions} ({((underPredictions / errors.length) * 100).toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

