import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Users, Trophy, BarChart2 } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Database Setup
            </CardTitle>
            <CardDescription>Manage database schema for player information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Add columns to the players table to store additional information like player bios and images.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/admin/add-image-column" className="w-full">
              <Button variant="outline" className="w-full">
                Add Image Column
              </Button>
            </Link>
            <Link href="/admin/add-bio-columns" className="w-full">
              <Button variant="outline" className="w-full">
                Add Bio Columns
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Player Management
            </CardTitle>
            <CardDescription>Manage player data and information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Create, update, and delete player records. Manage player bios and images.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/admin/players" className="w-full">
              <Button variant="outline" className="w-full">
                Manage Players
              </Button>
            </Link>
            <Link href="/admin/players/new" className="w-full">
              <Button variant="outline" className="w-full">
                Add New Player
              </Button>
            </Link>
            <Link href="/admin/set-transfermarkt-urls" className="w-full">
              <Button variant="outline" className="w-full">
                Set Transfermarkt URLs
              </Button>
            </Link>
            <Link href="/admin/fetch-player-bios" className="w-full">
              <Button variant="outline" className="w-full">
                Fetch Player Bios (JS)
              </Button>
            </Link>
            <Link href="/admin/fetch-player-bios-r" className="w-full">
              <Button variant="outline" className="w-full">
                Fetch Player Bios (R)
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>Manage team data and information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Create, update, and delete team records. Assign players to teams.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/admin/teams" className="w-full">
              <Button variant="outline" className="w-full">
                Manage Teams
              </Button>
            </Link>
            <Link href="/admin/teams/new" className="w-full">
              <Button variant="outline" className="w-full">
                Add New Team
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart2 className="mr-2 h-5 w-5" />
              League Management
            </CardTitle>
            <CardDescription>Manage league data and information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Create, update, and delete league records. Assign teams to leagues.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Link href="/admin/leagues" className="w-full">
              <Button variant="outline" className="w-full">
                Manage Leagues
              </Button>
            </Link>
            <Link href="/admin/leagues/new" className="w-full">
              <Button variant="outline" className="w-full">
                Add New League
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

