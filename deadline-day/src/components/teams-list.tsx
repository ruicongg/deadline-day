"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { TeamPlayers } from "@/components/team-players"

interface Team {
  id: number
  name: string
  logo_url?: string
  total_value: number
  squad_size: number
}

interface TeamsListProps {
  teams: Team[]
  year: number
}

export function TeamsList({ teams, year }: TeamsListProps) {
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null)

  const toggleTeam = (teamId: number) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId)
  }

  // Format currency in millions
  const formatCurrency = (value: number) => {
    return `€${(value / 1000000).toFixed(1)}M`
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {teams.map((team) => (
        <Collapsible key={team.id} open={expandedTeamId === team.id} onOpenChange={() => toggleTeam(team.id)}>
          <Card className="overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{team.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-3.5 w-3.5 mr-1" />
                      <span>{team.squad_size} players</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="font-medium">
                    {formatCurrency(team.total_value)}
                  </Badge>
                  {expandedTeamId === team.id ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-4 pt-0 border-t">
                <TeamPlayers teamId={team.id} year={year} />
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  )
}

