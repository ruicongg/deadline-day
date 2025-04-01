"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Upload, CheckCircle, AlertCircle } from "lucide-react"

export function DataImportForm() {
  const [activeTab, setActiveTab] = useState("leagues")
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    count?: number
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setImporting(true)
    setProgress(0)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", activeTab)

    try {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev
          }
          return prev + 5
        })
      }, 200)

      const response = await fetch(`/api/import/${activeTab}`, {
        method: "POST",
        body: formData,
      })

      clearInterval(interval)
      setProgress(100)

      if (response.ok) {
        const data = await response.json()
        setResult({
          success: true,
          message: `Successfully imported ${data.count} ${activeTab}`,
          count: data.count,
        })
      } else {
        const error = await response.json()
        setResult({
          success: false,
          message: error.message || "Import failed",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "An error occurred during import",
      })
    } finally {
      setImporting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import Football Data</CardTitle>
        <CardDescription>Upload CSV files to import data into the database</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="leagues">Leagues</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="valuations">Valuations</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="file-upload">CSV File</Label>
              <Input id="file-upload" type="file" accept=".csv" onChange={handleFileChange} disabled={importing} />
            </div>

            {file && (
              <div className="text-sm text-muted-foreground">
                Selected file: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}

            {importing && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Importing data...</div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{result.success ? "Import Successful" : "Import Failed"}</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
          </div>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleImport} disabled={!file || importing} className="w-full">
          <Upload className="mr-2 h-4 w-4" />
          Import {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </Button>
      </CardFooter>
    </Card>
  )
}

