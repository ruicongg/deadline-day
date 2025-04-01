"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileUp, AlertCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { PredictionResults } from "@/components/prediction-results"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

export function ValuationPredictorForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState<"idle" | "uploading" | "preprocessing" | "predicting" | "complete">(
    "idle",
  )
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<string | null>(null)
  const [results, setResults] = useState<any[] | null>(null)
  const [preprocessingStats, setPreprocessingStats] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a CSV file")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
      setErrorDetails(null)
      setResults(null)
      setPreprocessingStats(null)
      setCurrentStep("idle")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)
    setCurrentStep("uploading")
    setUploadProgress(0)
    setError(null)
    setErrorDetails(null)
    setResults(null)
    setPreprocessingStats(null)

    // Create a FormData object to send the file
    const formData = new FormData()
    formData.append("file", file)

    try {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5
          if (newProgress >= 30) {
            clearInterval(uploadInterval)
            return 30
          }
          return newProgress
        })
      }, 100)

      // After upload completes, show preprocessing
      setTimeout(() => {
        clearInterval(uploadInterval)
        setUploadProgress(30)
        setCurrentStep("preprocessing")

        // Simulate preprocessing progress
        const preprocessingInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + 3
            if (newProgress >= 70) {
              clearInterval(preprocessingInterval)
              return 70
            }
            return newProgress
          })
        }, 100)

        // After preprocessing, show prediction
        setTimeout(() => {
          clearInterval(preprocessingInterval)
          setUploadProgress(70)
          setCurrentStep("predicting")

          // Simulate prediction progress
          const predictingInterval = setInterval(() => {
            setUploadProgress((prev) => {
              const newProgress = prev + 2
              if (newProgress >= 90) {
                clearInterval(predictingInterval)
                return 90
              }
              return newProgress
            })
          }, 100)
        }, 2000)
      }, 1000)

      // Send the file to the API
      const response = await fetch("/api/predict-valuation", {
        method: "POST",
        body: formData,
      })

      setUploadProgress(100)
      setCurrentStep("complete")

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process the file")
      }

      if (data.details) {
        setErrorDetails(data.details)
      }

      if (data.success) {
        setResults(data.predictions)
        setPreprocessingStats(data.preprocessing_stats)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Player Statistics</CardTitle>
          <CardDescription>
            Upload a CSV file containing player statistics to predict their market valuations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    file ? "border-green-500" : "border-gray-300"
                  }`}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    {file ? (
                      <>
                        <p className="text-sm font-medium">Selected file:</p>
                        <p className="text-lg font-bold text-green-600">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB • Click to change</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium">Drag and drop your CSV file here or click to browse</p>
                        <p className="text-xs text-gray-500 mt-1">
                          The file should contain player statistics in the required format
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <input id="file-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="format">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Required Columns for Prediction
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="text-sm space-y-2">
                    <p>Your CSV file should include these columns for optimal preprocessing:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <code>Player</code> - Player name
                      </li>
                      <li>
                        <code>Per90_Goals</code> - Goals per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Goals - xG</code> - Goals minus expected goals
                      </li>
                      <li>
                        <code>Per90_Assists</code> - Assists per 90 minutes
                      </li>
                      <li>
                        <code>Per90_xA: Expected Assists</code> - Expected assists per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Shots Total</code> - Total shots per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Passes Completed</code> - Completed passes per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Passes Attempted</code> - Attempted passes per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Dispossessed</code> - Times dispossessed per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Miscontrols</code> - Miscontrols per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Touches</code> - Touches per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Progressive Carries</code> - Progressive carries per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Progressive Passes</code> - Progressive passes per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Successful Take-Ons</code> - Successful take-ons per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Take-Ons Attempted</code> - Attempted take-ons per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Corner Kicks</code> - Corner kicks per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Passes from Free Kicks</code> - Passes from free kicks per 90 minutes
                      </li>
                      <li>
                        <code>Per90_Penalty Kicks Attempted</code> - Penalty kicks attempted per 90 minutes
                      </li>
                    </ul>
                    <p className="text-xs text-gray-500">
                      Note: Missing columns will be handled gracefully, but may affect the quality of predictions.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
                {errorDetails && (
                  <div className="mt-2 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-x-auto">
                    <p className="font-semibold">Details:</p>
                    <pre className="whitespace-pre-wrap">{errorDetails}</pre>
                  </div>
                )}
              </Alert>
            )}

            {isUploading && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        currentStep === "uploading" ? "default" : currentStep === "idle" ? "outline" : "secondary"
                      }
                    >
                      1. Upload
                    </Badge>
                    <Badge
                      variant={
                        currentStep === "preprocessing"
                          ? "default"
                          : currentStep === "idle" || currentStep === "uploading"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      2. Preprocess
                    </Badge>
                    <Badge
                      variant={
                        currentStep === "predicting"
                          ? "default"
                          : currentStep === "idle" || currentStep === "uploading" || currentStep === "preprocessing"
                            ? "outline"
                            : "secondary"
                      }
                    >
                      3. Predict
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-gray-500 text-center">
                  {currentStep === "uploading" && "Uploading file..."}
                  {currentStep === "preprocessing" && "Preprocessing data..."}
                  {currentStep === "predicting" && "Generating predictions..."}
                  {currentStep === "complete" && "Processing complete!"}
                </p>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" onClick={handleSubmit} disabled={!file || isUploading} className="w-full">
            <FileUp className="mr-2 h-4 w-4" />
            {isUploading ? "Processing..." : "Predict Valuations"}
          </Button>
        </CardFooter>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Prediction Results</CardTitle>
            <CardDescription>Machine learning predictions for player market values</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="results">
              <TabsList className="mb-4">
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="process">Process Details</TabsTrigger>
              </TabsList>

              <TabsContent value="results">
                <PredictionResults results={results} />
              </TabsContent>

              <TabsContent value="process">
                {preprocessingStats && (
                  <div className="space-y-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertTitle>Processing Complete</AlertTitle>
                      <AlertDescription>
                        Your data was successfully preprocessed and run through the valuation model.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Raw Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Rows:</span>
                              <span className="font-medium">{preprocessingStats.raw_rows}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Columns:</span>
                              <span className="font-medium">{preprocessingStats.raw_columns}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Preprocessed Data</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Rows:</span>
                              <span className="font-medium">{preprocessingStats.preprocessed_rows}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Columns:</span>
                              <span className="font-medium">{preprocessingStats.preprocessed_columns}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium mb-2">Engineered Features:</h3>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm max-h-40 overflow-y-auto">
                        <ul className="list-disc pl-5 space-y-1">
                          {preprocessingStats.preprocessed_column_names
                            .filter(
                              (col: string) =>
                                !col.startsWith("Per90_") && col !== "Player" && col !== "player_market_value_euro",
                            )
                            .map((col: string, index: number) => (
                              <li key={index}>{col}</li>
                            ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

