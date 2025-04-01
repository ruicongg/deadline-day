import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function PlayerSearch() {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search players by name, team, or nationality..."
        className="w-full bg-background pl-8 md:w-[300px] lg:w-[320px]"
      />
    </div>
  )
}

