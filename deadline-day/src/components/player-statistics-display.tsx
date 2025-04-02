"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function PlayerStatisticsDisplay({ results }) {
  const [activeTab, setActiveTab] = useState("overview")
  
  if (!results) return null
  
  const { statistics, predictions } = results
  
  // Format currency values
  const formatValue = (value) => {
    if (value >= 1000000) {
      return `€${(value / 1000000).toFixed(2)}M`
    } else if (value >= 1000) {
      return `€${(value / 1000).toFixed(2)}K`
    } else {
      return `€${value.toFixed(2)}`
    }
  }
  
  // Format percentage values
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`
  }
  
  return (
    <div className="mt-8 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Players Processed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{predictions.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Features Used</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{results.preprocessing_stats.columns}</p>
              </CardContent>
            </Card>
          </div>
          
          {statistics.predicted_values && (
            <Card>
              <CardHeader>
                <CardTitle>Valuation Range</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Minimum</p>
                    <p className="text-xl font-bold">{formatValue(statistics.predicted_values.min)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-xl font-bold">{formatValue(statistics.predicted_values.average)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Maximum</p>
                    <p className="text-xl font-bold">{formatValue(statistics.predicted_values.max)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle>Value Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statistics.predicted_values && (
                  <>
                    <div className="flex justify-between">
                      <span>Low Value (Bottom 25%)</span>
                      <span>Below {formatValue(statistics.predicted_values.percentile25)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium Value (Middle 50%)</span>
                      <span>{formatValue(statistics.predicted_values.percentile25)} - {formatValue(statistics.predicted_values.percentile75)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High Value (Top 25%)</span>
                      <span>Above {formatValue(statistics.predicted_values.percentile75)}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Predictions Tab */}
        <TabsContent value="predictions">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Value Category</TableHead>
                    <TableHead className="text-right">Predicted Value</TableHead>
                    <TableHead className="text-right">vs. Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.map((prediction, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{prediction.player}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            prediction.value_category === "High Value" ? "default" : 
                            prediction.value_category === "Low Value" ? "outline" : 
                            "secondary"
                          }
                        >
                          {prediction.value_category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatValue(prediction.predicted_value)}</TableCell>
                      <TableCell className={`text-right ${prediction.comparison_to_average?.percentage > 0 ? "text-green-500" : "text-red-500"}`}>
                        {prediction.comparison_to_average?.percentage > 0 ? "+" : ""}
                        {formatPercentage(prediction.comparison_to_average?.percentage)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Statistics Tab */}
        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              {statistics.predicted_values && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Predicted Values</h3>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell className="font-medium">Minimum</TableCell>
                          <TableCell>{formatValue(statistics.predicted_values.min)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Maximum</TableCell>
                          <TableCell>{formatValue(statistics.predicted_values.max)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Average</TableCell>
                          <TableCell>{formatValue(statistics.predicted_values.average)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Median</TableCell>
                          <TableCell>{formatValue(statistics.predicted_values.median)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">Standard Deviation</TableCell>
                          <TableCell>{formatValue(statistics.predicted_values.stdDev)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">25th Percentile</TableCell>
                          <TableCell>{formatValue(statistics.predicted_values.percentile25)}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="font-medium">75th Percentile</TableCell>
                          <TableCell>{formatValue(statistics.predicted_values.percentile75)}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  {statistics.actual_values && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Actual Values</h3>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Minimum</TableCell>
                            <TableCell>{formatValue(statistics.actual_values.min)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Maximum</TableCell>
                            <TableCell>{formatValue(statistics.actual_values.max)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Average</TableCell>
                            <TableCell>{formatValue(statistics.actual_values.average)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Median</TableCell>
                            <TableCell>{formatValue(statistics.actual_values.median)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Standard Deviation</TableCell>
                            <TableCell>{formatValue(statistics.actual_values.stdDev)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
