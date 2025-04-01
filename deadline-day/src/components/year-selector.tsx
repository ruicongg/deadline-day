"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface YearSelectorProps {
  currentYear: number
  availableYears: number[]
  onChange: (year: number) => void
}

export function YearSelector({ currentYear, availableYears, onChange }: YearSelectorProps) {
  // Log available years for debugging
  console.log("YearSelector - Available years:", availableYears)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1">
          {currentYear}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-60 overflow-y-auto">
        {availableYears.map((year) => (
          <DropdownMenuItem
            key={year}
            onClick={() => onChange(year)}
            className={year === currentYear ? "bg-primary/10 font-medium" : ""}
          >
            {year}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

