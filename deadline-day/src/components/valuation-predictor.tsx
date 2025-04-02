"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, AlertCircle } from "lucide-react"
import { PlayerDataAnalysis } from "./analyze-player-data"

export function ValuationPredictor() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/predict-valuation", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process the file")
      }

      setResults(data)
    } catch (err) {
      console.error("Error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>Player Valuation Predictor</CardTitle>
        <CardDescription>Upload a CSV file with player statistics to predict player valuations.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file">Upload Player Statistics CSV</Label>
            <Input id="file" type="file" accept=".csv" onChange={handleFileChange} disabled={loading} />
            <p className="text-sm text-gray-500">
              The CSV should contain player statistics with columns like Per90_Goals, Per90_Assists, etc.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={loading || !file} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Predict Valuations
              </>
            )}
          </Button>
        </form>

        {results && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Players Processed</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{results.predictions.length}</p>
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

            {/* Use the PlayerDataAnalysis component to display detailed statistics */}
            <PlayerDataAnalysis results={results} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

