"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Player {
  id: number
  name: string
  position: string
  nationality: string
  age: number
  dob: string
  height_mtrs: number
  current_team_id: number
  transfermarkt_url: string
  image_url: string
  bio_data: any
}

interface Team {
  id: number
  name: string
}

export default function PlayerEditPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [player, setPlayer] = useState<Partial<Player>>({})
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isNewPlayer = params.id === "new"

  useEffect(() => {
    fetchTeams()
    if (!isNewPlayer) {
      fetchPlayer()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchPlayer = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/players/${params.id}`)

      if (!response.ok) {
        throw new Error("Failed to fetch player")
      }

      const data = await response.json()
      setPlayer(data)
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/teams?limit=100")

      if (!response.ok) {
        throw new Error("Failed to fetch teams")
      }

      const data = await response.json()
      setTeams(data.data)
    } catch (err) {
      console.error("Error fetching teams:", err)
    }
  }

  const handleChange = (field: string, value: any) => {
    setPlayer((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = isNewPlayer ? "/api/players" : `/api/players/${params.id}`
      const method = isNewPlayer ? "POST" : "PUT"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(player),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save player")
      }

      toast({
        title: isNewPlayer ? "Player created" : "Player updated",
        description: isNewPlayer ? "New player has been created successfully" : "Player has been updated successfully",
        variant: "default",
      })

      if (isNewPlayer) {
        const data = await response.json()
        router.push(`/admin/players/${data.id}`)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
      toast({
        title: "Error",
        description: err.message || "An error occurred while saving the player",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/players">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{isNewPlayer ? "Add New Player" : `Edit Player: ${player.name}`}</h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Player's personal and professional details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={player.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={player.position || ""}
                  onChange={(e) => handleChange("position", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={player.nationality || ""}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={player.age || ""}
                  onChange={(e) => handleChange("age", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={player.dob ? new Date(player.dob).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleChange("dob", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (meters)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.01"
                  value={player.height_mtrs || ""}
                  onChange={(e) => handleChange("height_mtrs", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">Current Team</Label>
                <Select
                  value={player.current_team_id?.toString() || ""}
                  onValueChange={(value) => handleChange("current_team_id", value ? Number(value) : null)}
                >
                  <SelectTrigger id="team">
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No Team</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>External links and bio data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transfermarkt_url">Transfermarkt URL</Label>
                <Input
                  id="transfermarkt_url"
                  value={player.transfermarkt_url || ""}
                  onChange={(e) => handleChange("transfermarkt_url", e.target.value)}
                  placeholder="https://www.transfermarkt.com/player-name/profil/spieler/12345"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={player.image_url || ""}
                  onChange={(e) => handleChange("image_url", e.target.value)}
                  placeholder="https://example.com/player-image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio_data">Bio Data (JSON)</Label>
                <Textarea
                  id="bio_data"
                  rows={10}
                  value={player.bio_data ? JSON.stringify(player.bio_data, null, 2) : ""}
                  onChange={(e) => {
                    try {
                      const json = e.target.value ? JSON.parse(e.target.value) : null
                      handleChange("bio_data", json)
                    } catch (err) {
                      // Allow invalid JSON during editing, it will be validated on submit
                      console.log("Invalid JSON, will be validated on submit")
                    }
                  }}
                  placeholder='{"foot": "right", "place_of_birth": "London", ...}'
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Player
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}

