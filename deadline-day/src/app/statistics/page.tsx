import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Player Statistics</h1>

      <p className="text-muted-foreground">
        This page will display detailed statistics and analytics for football players.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:border-gray-800">
          <CardHeader>
            <CardTitle>Top Scorers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="dark:border-gray-800">
          <CardHeader>
            <CardTitle>Top Assisters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="dark:border-gray-800">
          <CardHeader>
            <CardTitle>Market Value Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

