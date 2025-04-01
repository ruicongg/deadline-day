// Import required packages
import { neon } from '@neondatabase/serverless';
import axios from 'axios';
import { setTimeout } from 'timers/promises';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// The current TheSportsDB API endpoint
const API_BASE_URL = "https://www.thesportsdb.com/api/v1/json/3";

// Create a database connection
// Replace this with your actual DATABASE_URL or pass it as an environment variable
const DATABASE_URL = process.env.DATABASE_URL;

// Initialize the SQL client
const sql = neon(DATABASE_URL);

async function fetchTeamLogos() {
  try {
    console.log("Starting team logo fetch process...");
    console.log(`Using database URL: ${DATABASE_URL ? "✅ Found" : "❌ Missing"}`);

    if (!DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    // 1. Get all teams from the database
    const teams = await sql`
      SELECT id, name, logo_url
      FROM teams
      WHERE logo_url IS NULL OR logo_url = ''
      ORDER BY id
    `;

    console.log(`Found ${teams.length} teams without logos`);

    // 2. Process each team
    let successCount = 0;
    let failCount = 0;

    for (const [index, team] of teams.entries()) {
      try {
        console.log(`[${index + 1}/${teams.length}] Processing team: ${team.name} (ID: ${team.id})`);

        // 3. Search for the team in TheSportsDB
        const searchUrl = `${API_BASE_URL}/searchteams.php?t=${encodeURIComponent(team.name)}`;
        const response = await axios.get(searchUrl);

        // 4. Check if we got results
        if (response.data && response.data.teams && response.data.teams.length > 0) {
          // Find the best match (first result is usually the best)
          const foundTeam = response.data.teams[0];
          const logoUrl = foundTeam.strTeamBadge;

          if (logoUrl) {
            // 5. Update the database with the logo URL
            await sql`
              UPDATE teams
              SET logo_url = ${logoUrl}
              WHERE id = ${team.id}
            `;

            console.log(`✅ Updated logo for ${team.name}: ${logoUrl}`);
            successCount++;
          } else {
            console.log(`❌ No logo found for ${team.name} in API response`);
            failCount++;
          }
        } else {
          console.log(`❌ No team found for ${team.name} in TheSportsDB`);
          failCount++;

          // Try with a more generic search (remove FC, United, etc.)
          const simplifiedName = team.name.replace(/FC|United|City|Football Club/gi, "").trim();

          if (simplifiedName !== team.name) {
            console.log(`Trying simplified name: "${simplifiedName}"`);

            const retryUrl = `${API_BASE_URL}/searchteams.php?t=${encodeURIComponent(simplifiedName)}`;
            const retryResponse = await axios.get(retryUrl);

            if (retryResponse.data && retryResponse.data.teams && retryResponse.data.teams.length > 0) {
              const foundTeam = retryResponse.data.teams[0];
              const logoUrl = foundTeam.strTeamBadge;

              if (logoUrl) {
                await sql`
                  UPDATE teams
                  SET logo_url = ${logoUrl}
                  WHERE id = ${team.id}
                `;

                console.log(`✅ Updated logo for ${team.name} using simplified name: ${logoUrl}`);
                successCount++;
                failCount--; // Correct the fail count since we succeeded
              }
            }
          }
        }

        // 6. Add delay to respect API rate limits (1 second)
        await setTimeout(1000);
      } catch (error) {
        console.error(`Error processing team ${team.name}:`, error);
        failCount++;
      }
    }

    console.log("\nLogo fetch process completed!");
    console.log(`Success: ${successCount} teams`);
    console.log(`Failed: ${failCount} teams`);
  } catch (error) {
    console.error("Error fetching team logos:", error);
  } finally {
    process.exit(0);
  }
}

// Run the script
fetchTeamLogos();