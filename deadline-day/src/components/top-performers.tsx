import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function TopPerformers() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Top Goalscorers</CardTitle>
          <CardDescription>Players with the most goals this season</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Cristiano Ronaldo", team: "Al Nassr", goals: 31, image: "/placeholder.svg?height=40&width=40" },
              { name: "Lionel Messi", team: "Inter Miami", goals: 28, image: "/placeholder.svg?height=40&width=40" },
              {
                name: "Erling Haaland",
                team: "Manchester City",
                goals: 27,
                image: "/placeholder.svg?height=40&width=40",
              },
              { name: "Kylian Mbappé", team: "PSG", goals: 26, image: "/placeholder.svg?height=40&width=40" },
              { name: "Harry Kane", team: "Bayern Munich", goals: 25, image: "/placeholder.svg?height=40&width=40" },
            ].map((player, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">{index + 1}</div>
                  <Avatar>
                    <AvatarImage src={player.image} alt={player.name} />
                    <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-xs text-muted-foreground">{player.team}</div>
                  </div>
                </div>
                <Badge variant="secondary">{player.goals} goals</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Assisters</CardTitle>
          <CardDescription>Players with the most assists this season</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                name: "Kevin De Bruyne",
                team: "Manchester City",
                assists: 24,
                image: "/placeholder.svg?height=40&width=40",
              },
              { name: "Lionel Messi", team: "Inter Miami", assists: 16, image: "/placeholder.svg?height=40&width=40" },
              {
                name: "Bruno Fernandes",
                team: "Manchester United",
                assists: 14,
                image: "/placeholder.svg?height=40&width=40",
              },
              {
                name: "Thomas Müller",
                team: "Bayern Munich",
                assists: 13,
                image: "/placeholder.svg?height=40&width=40",
              },
              {
                name: "Trent Alexander-Arnold",
                team: "Liverpool",
                assists: 12,
                image: "/placeholder.svg?height=40&width=40",
              },
            ].map((player, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">{index + 1}</div>
                  <Avatar>
                    <AvatarImage src={player.image} alt={player.name} />
                    <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-xs text-muted-foreground">{player.team}</div>
                  </div>
                </div>
                <Badge variant="secondary">{player.assists} assists</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Highest Rated</CardTitle>
          <CardDescription>Players with the highest average rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Lionel Messi", team: "Inter Miami", rating: 8.7, image: "/placeholder.svg?height=40&width=40" },
              {
                name: "Kevin De Bruyne",
                team: "Manchester City",
                rating: 8.6,
                image: "/placeholder.svg?height=40&width=40",
              },
              {
                name: "Cristiano Ronaldo",
                team: "Al Nassr",
                rating: 8.5,
                image: "/placeholder.svg?height=40&width=40",
              },
              { name: "Virgil van Dijk", team: "Liverpool", rating: 8.2, image: "/placeholder.svg?height=40&width=40" },
              { name: "Alisson Becker", team: "Liverpool", rating: 8.0, image: "/placeholder.svg?height=40&width=40" },
            ].map((player, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">{index + 1}</div>
                  <Avatar>
                    <AvatarImage src={player.image} alt={player.name} />
                    <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-xs text-muted-foreground">{player.team}</div>
                  </div>
                </div>
                <Badge variant="secondary">{player.rating} rating</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
}

