"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, Upload, AlertCircle, Database, BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlayerDataAnalysis } from "./analyze-player-data"
import { DataSchemaViewer } from "./data-schema-viewer"

// Schema data from the CSV file
const schema = [
  { name: "Player", type: "string", exampleValue: "Kalvin Phillips" },
  { name: "Per90_% of Dribblers Tackled", type: "number", exampleValue: "-0.328401948" },
  { name: "Per90_Aerials Lost", type: "number", exampleValue: "0.096607202" },
  { name: "Per90_Blocks", type: "number", exampleValue: "1.2087270278479003" },
  { name: "Per90_Carries", type: "number", exampleValue: "-0.235404531" },
  { name: "Per90_Challenges Lost", type: "number", exampleValue: "1.5768289485486429" },
  { name: "Per90_Crosses into Penalty Area", type: "number", exampleValue: "-0.498857122" },
  { name: "Per90_Dead-ball Passes", type: "number", exampleValue: "0.2781311521445387" },
  { name: "Per90_Fouls Committed", type: "number", exampleValue: "1.408893629442273" },
  { name: "Per90_GCA (Fouls Drawn)", type: "number", exampleValue: "-0.780321955" },
  { name: "Per90_GCA (Live-ball Pass)", type: "number", exampleValue: "-0.671762554" },
  { name: "Per90_GCA (Shot)", type: "number", exampleValue: "-0.961879197" },
  { name: "Per90_Goal-Creating Actions", type: "number", exampleValue: "-0.835802342" },
  { name: "Per90_Goals + Assists", type: "number", exampleValue: "-0.879783585" },
  { name: "Per90_Goals/Shot on Target", type: "number", exampleValue: "-1.062400488" },
  { name: "Per90_Non-Penalty Goals - npxG", type: "number", exampleValue: "-0.260338025" },
  { name: "Per90_Offsides", type: "number", exampleValue: "-0.775062524" },
  { name: "Per90_Pass Completion %", type: "number", exampleValue: "0.20985482992475873" },
  { name: "Per90_Pass Completion % (Long)", type: "number", exampleValue: "0.32855513129620223" },
  { name: "Per90_Pass Completion % (Short)", type: "number", exampleValue: "0.29849493249655235" },
  { name: "Per90_Passes Offside", type: "number", exampleValue: "0.22524209678912538" },
  { name: "Per90_Passes Received", type: "number", exampleValue: "0.1872713847533589" },
  { name: "Per90_Passes into Final Third", type: "number", exampleValue: "0.8254145785925185" },
  { name: "Per90_Progressive Carrying Distance", type: "number", exampleValue: "-0.810087308" },
  { name: "Per90_Progressive Passes", type: "number", exampleValue: "0.668160291" },
  { name: "Per90_Progressive Passes Rec", type: "number", exampleValue: "-1.090089989" },
  { name: "Per90_SCA (Defensive Action)", type: "number", exampleValue: "1.5499841308716535" },
  { name: "Per90_SCA (Live-ball Pass)", type: "number", exampleValue: "-0.481413383" },
  { name: "Per90_SCA (Shot)", type: "number", exampleValue: "-0.578072578" },
  { name: "Per90_Shots from Free Kicks", type: "number", exampleValue: "1.1072722591632636" },
  { name: "Per90_Shots on Target", type: "number", exampleValue: "-0.770982316" },
  { name: "Per90_Shots on Target %", type: "number", exampleValue: "-0.514242821" },
  { name: "Per90_Successful Take-On %", type: "number", exampleValue: "0.9552265893312233" },
  { name: "Per90_Switches", type: "number", exampleValue: "3.0009422289430296" },
  { name: "Per90_Tackled During Take-On Percentage", type: "number", exampleValue: "-0.373020975" },
  { name: "Per90_Tackles (Mid 3rd)", type: "number", exampleValue: "1.7417601076357205" },
  { name: "Per90_Through Balls", type: "number", exampleValue: "-0.505503219" },
  { name: "Per90_Throw-ins Taken", type: "number", exampleValue: "-0.569548759" },
  { name: "Per90_Total Carrying Distance", type: "number", exampleValue: "-0.595512852" },
  { name: "Per90_Total Passing Distance", type: "number", exampleValue: "1.0335191854093744" },
  { name: "Per90_Touches (Att Pen)", type: "number", exampleValue: "-1.137745321" },
  { name: "Per90_Yellow Cards", type: "number", exampleValue: "1.106655591185981" },
  { name: "Per90_npxG + xAG", type: "number", exampleValue: "-0.748032965" },
  { name: "Per90_npxG/Shot", type: "number", exampleValue: "-1.185995903" },
  { name: "Per90_npxG: Non-Penalty xG", type: "number", exampleValue: "-0.806899065" },
  { name: "Per90_xG: Expected Goals", type: "number", exampleValue: "-0.782671625" },
  { name: "age", type: "number", exampleValue: "0.6375860421534361" },
  { name: "player_market_value_euro", type: "number", exampleValue: "16.811242831518264" },
  { name: "Finishing_Efficiency", type: "number", exampleValue: "-0.08433006" },
  { name: "Assist_Efficiency", type: "number", exampleValue: "-0.597540073" },
  { name: "Shot_Efficiency", type: "number", exampleValue: "-1.057911535" },
  { name: "Progressive_Play", type: "number", exampleValue: "-0.241431573" },
  { name: "Ball_Retention", type: "number", exampleValue: "0.8405555941171862" },
]

export function ValuationPredictorEnhanced() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("predictor")

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
      // Switch to results tab after successful prediction
      setActiveTab("results")
    } catch (err) {
      console.error("Error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="predictor">
            <Upload className="h-4 w-4 mr-2" />
            Predictor
          </TabsTrigger>
          {results && (
            <TabsTrigger value="results">
              <BarChart3 className="h-4 w-4 mr-2" />
              Results
            </TabsTrigger>
          )}
          <TabsTrigger value="schema">
            <Database className="h-4 w-4 mr-2" />
            Data Schema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictor">
          <Card className="w-full max-w-4xl mx-auto">
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

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Sample Data Format</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your CSV file should include the following columns. All numeric values should be normalized
                  (z-scores).
                </p>
                <div className="border rounded-md p-4 bg-muted/50">
                  <pre className="text-xs overflow-auto">
                    Player,age,Per90_Goals,Per90_Assists,Per90_xG: Expected Goals,...
                  </pre>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  <a
                    href="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/test-JUGMCThPWgxBH1m3gBaBimLsllSleR.csv"
                    className="text-primary underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download sample CSV file
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {results && (
          <TabsContent value="results">
            <div className="space-y-6">
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
          </TabsContent>
        )}

        <TabsContent value="schema">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Dataset Schema</CardTitle>
                <CardDescription>
                  The player valuation model uses the following features to predict their instrinsic values.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DataSchemaViewer schema={schema} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

