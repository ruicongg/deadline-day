"use client"

import { useRouter } from "next/navigation"
import { YearSelector } from "@/components/year-selector"

interface YearSelectorWrapperProps {
  currentYear: number
  availableYears: number[]
}

export function YearSelectorWrapper({ currentYear, availableYears }: YearSelectorWrapperProps) {
  const router = useRouter()

  // Log available years for debugging
  console.log("YearSelectorWrapper - Available years:", availableYears)

  const handleYearChange = (year: number) => {
    // Add year to query params and refresh the page
    const searchParams = new URLSearchParams(window.location.search)
    searchParams.set("year", year.toString())
    router.push(`?${searchParams.toString()}`)
  }

  return <YearSelector currentYear={currentYear} availableYears={availableYears} onChange={handleYearChange} />
}

