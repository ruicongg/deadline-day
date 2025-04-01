"use server"
import { revalidatePath } from "next/cache"

export async function updateYear(year: number) {
  // Revalidate the home page to refresh data for the new year
  revalidatePath("/")
  return { success: true }
}

