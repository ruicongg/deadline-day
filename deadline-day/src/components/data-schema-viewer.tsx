"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Search } from "lucide-react"

interface ColumnSchema {
  name: string
  type: string
  exampleValue: string
}

interface DataSchemaViewerProps {
  schema: ColumnSchema[]
}

export function DataSchemaViewer({ schema }: DataSchemaViewerProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Group columns by category
  const playerInfo = schema.filter(
    (col) =>
      !col.name.startsWith("Per90_") &&
      !col.name.includes("_Efficiency") &&
      !col.name.includes("Progressive_Play") &&
      !col.name.includes("Ball_Retention"),
  )

  const performanceMetrics = schema.filter((col) => col.name.startsWith("Per90_"))

  const efficiencyMetrics = schema.filter(
    (col) =>
      col.name.includes("_Efficiency") || col.name.includes("Progressive_Play") || col.name.includes("Ball_Retention"),
  )

  // Further categorize performance metrics
  const attackingMetrics = performanceMetrics.filter(
    (col) =>
      col.name.includes("Goals") ||
      col.name.includes("Shot") ||
      col.name.includes("xG") ||
      col.name.includes("Offsides") ||
      col.name.includes("Touches (Att Pen)"),
  )

  const passingMetrics = performanceMetrics.filter(
    (col) =>
      col.name.includes("Pass") ||
      col.name.includes("Passes") ||
      col.name.includes("Through Balls") ||
      col.name.includes("Crosses") ||
      col.name.includes("Switches"),
  )

  const defensiveMetrics = performanceMetrics.filter(
    (col) =>
      col.name.includes("Tackles") ||
      col.name.includes("Blocks") ||
      col.name.includes("Dribblers Tackled") ||
      col.name.includes("Defensive Action"),
  )

  const otherMetrics = performanceMetrics.filter(
    (col) => !attackingMetrics.includes(col) && !passingMetrics.includes(col) && !defensiveMetrics.includes(col),
  )

  // Filter columns based on search term
  const filterColumns = (columns: ColumnSchema[]) => {
    if (!searchTerm) return columns
    return columns.filter((col) => col.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }

  const renderColumnTable = (columns: ColumnSchema[], title: string) => {
    const filteredColumns = filterColumns(columns)
    if (filteredColumns.length === 0) return null

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">
            {title} ({filteredColumns.length} columns)
          </CardTitle>
          <CardDescription>These columns represent {title.toLowerCase()} in the dataset</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column Name</TableHead>
                <TableHead>Data Type</TableHead>
                <TableHead>Example Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredColumns.map((column) => (
                <TableRow key={column.name}>
                  <TableCell className="font-medium">{column.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{column.type}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {typeof column.exampleValue === "string" && !isNaN(Number(column.exampleValue))
                      ? Number(column.exampleValue).toFixed(3)
                      : column.exampleValue}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search columns..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="all">All ({schema.length})</TabsTrigger>
          <TabsTrigger value="attacking">Attacking ({attackingMetrics.length})</TabsTrigger>
          <TabsTrigger value="passing">Passing ({passingMetrics.length})</TabsTrigger>
          <TabsTrigger value="defensive">Defensive ({defensiveMetrics.length})</TabsTrigger>
          <TabsTrigger value="player">Player Info ({playerInfo.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {renderColumnTable(schema, "All Columns")}
        </TabsContent>

        <TabsContent value="attacking" className="space-y-4">
          {renderColumnTable(attackingMetrics, "Attacking Metrics")}
        </TabsContent>

        <TabsContent value="passing" className="space-y-4">
          {renderColumnTable(passingMetrics, "Passing Metrics")}
        </TabsContent>

        <TabsContent value="defensive" className="space-y-4">
          {renderColumnTable(defensiveMetrics, "Defensive Metrics")}
        </TabsContent>

        <TabsContent value="player" className="space-y-4">
          {renderColumnTable(playerInfo, "Player Information")}
          {renderColumnTable(efficiencyMetrics, "Efficiency Metrics")}
        </TabsContent>
      </Tabs>
    </div>
  )
}

