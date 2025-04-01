"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddBioColumnsPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const addBioColumns = async () => {
    setStatus("loading")
    setMessage("Adding bio columns to players table...")

    try {
      const response = await fetch("/api/admin/add-bio-columns")
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Successfully added bio columns to players table")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to add bio columns")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred while adding the bio columns")
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Database Administration</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Player Bio Columns</CardTitle>
          <CardDescription>Add columns to the players table to store detailed player bio information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This will add the following columns to the players table if they don't already exist:</p>
          <ul className="list-disc pl-5 mb-4 space-y-1">
            <li>bio_data (JSONB) - Stores detailed player information</li>
            <li>image_url (TEXT) - Stores the URL to the player's image</li>
            <li>transfermarkt_url (TEXT) - Stores the Transfermarkt URL</li>
            <li>last_bio_update (TIMESTAMP) - Tracks when the bio was last updated</li>
          </ul>

          {status !== "idle" && (
            <div
              className={`p-4 rounded-md mb-4 ${
                status === "loading"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                  : status === "success"
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                    : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"
              }`}
            >
              {message}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button
            onClick={addBioColumns}
            disabled={status === "loading"}
            className={status === "success" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {status === "loading"
              ? "Adding Columns..."
              : status === "success"
                ? "Columns Added Successfully"
                : "Add Bio Columns"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

