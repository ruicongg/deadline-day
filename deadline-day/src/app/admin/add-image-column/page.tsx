"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddImageColumnPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const addImageColumn = async () => {
    setStatus("loading")
    setMessage("Adding image_url column to players table...")

    try {
      const response = await fetch("/api/admin/add-image-column")
      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Successfully added image_url column to players table")
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to add image_url column")
      }
    } catch (error) {
      setStatus("error")
      setMessage("An error occurred while adding the image_url column")
      console.error(error)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Database Administration</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Image URL Column</CardTitle>
          <CardDescription>Add an image_url column to the players table to store player images</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">This will add an image_url column to the players table if it doesn't already exist.</p>

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
            onClick={addImageColumn}
            disabled={status === "loading"}
            className={status === "success" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {status === "loading"
              ? "Adding Column..."
              : status === "success"
                ? "Column Added Successfully"
                : "Add Image URL Column"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

