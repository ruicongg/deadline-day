// At the top of your import scripts
import env from './load-env.js';
import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';

// Initialize the SQL client with the environment variable
const sql = neon(env.DATABASE_URL);

async function importPlayerInfo(filePath) {
  try {
    console.log(`Starting import of player information from ${filePath}...`);
    
    // Create a readable stream for the CSV file
    const parser = createReadStream(filePath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        // Auto-detect delimiter (handles both CSV and TSV)
        delimiter: [',', '\t'],
        // Handle large fields and quoted values
        relax_column_count: true,
        trim: true
      })
    );
    
    let recordCount = 0;
    let successCount = 0;
    let errorCount = 0;
    
    // Process records in batches for better performance
    const batchSize = 50;
    let batch = [];
    
    // Create caches for league and team lookups
    const leagueCache = new Map();
    const teamCache = new Map();
    
    // Process each record from the stream
    for await (const record of parser) {
      recordCount++;
      
      try {
        // Skip records without player name
        if (!record.player_name) {
          console.warn(`Skipping record #${recordCount}: Missing player name`);
          errorCount++;
          continue;
        }
        
        // Find or create the league (using cache)
        let leagueId;
        const leagueName = record.comp_name;
        
        if (leagueCache.has(leagueName)) {
          leagueId = leagueCache.get(leagueName);
        } else {
          const leagueResult = await sql`
            SELECT id FROM leagues WHERE name = ${leagueName}
          `;
          
          if (leagueResult.length === 0) {
            console.log(`League not found: ${leagueName}. Creating league record.`);
            const newLeagueResult = await sql`
              INSERT INTO leagues (name, region, country) 
              VALUES (${leagueName}, ${record.region || null}, ${record.country || null})
              RETURNING id
            `;
            leagueId = newLeagueResult[0].id;
          } else {
            leagueId = leagueResult[0].id;
          }
          
          // Cache the league ID
          leagueCache.set(leagueName, leagueId);
        }
        
        // Find or create the team (using cache)
        let teamId;
        const teamName = record.squad;
        const cacheKey = `${teamName}-${leagueId}`;
        
        if (teamCache.has(cacheKey)) {
          teamId = teamCache.get(cacheKey);
        } else {
          const teamResult = await sql`
            SELECT id FROM teams WHERE name = ${teamName}
          `;
          
          if (teamResult.length === 0) {
            console.log(`Team not found: ${teamName}. Creating team record.`);
            const newTeamResult = await sql`
              INSERT INTO teams (name, league_id) 
              VALUES (${teamName}, ${leagueId})
              RETURNING id
            `;
            teamId = newTeamResult[0].id;
          } else {
            teamId = teamResult[0].id;
          }
          
          // Cache the team ID
          teamCache.set(cacheKey, teamId);
        }
        
        // Parse date of birth (format: DD/MM/YY)
        let dob = null;
        if (record.player_dob && record.player_dob !== 'NA' && record.player_dob !== 'N/A') {
          const dobParts = record.player_dob.split('/');
          if (dobParts.length === 3) {
            // Convert YY to YYYY (assuming 20YY for simplicity)
            let year = dobParts[2];
            if (year.length === 2) {
              // If year is 2 digits, determine century
              const yearNum = parseInt(year);
              year = yearNum > 50 ? `19${year}` : `20${year}`;
            }
            dob = `${year}-${dobParts[1]}-${dobParts[0]}`;
          }
        }
        
        // Parse date joined
        let dateJoined = null;
        if (record.date_joined && record.date_joined !== 'NA' && record.date_joined !== 'N/A') {
          const joinedParts = record.date_joined.split('/');
          if (joinedParts.length === 3) {
            let year = joinedParts[2];
            if (year.length === 2) {
              const yearNum = parseInt(year);
              year = yearNum > 50 ? `19${year}` : `20${year}`;
            }
            dateJoined = `${year}-${joinedParts[1]}-${joinedParts[0]}`;
          }
        }
        
        // Parse market value (format: 1.12e+08)
        let marketValue = null;
        if (record.player_market_value_euro && 
            record.player_market_value_euro !== 'NA' && 
            record.player_market_value_euro !== 'N/A') {
          try {
            // Handle scientific notation
            marketValue = parseFloat(record.player_market_value_euro);
          } catch (e) {
            console.warn(`Could not parse market value: ${record.player_market_value_euro}`);
          }
        }
        
        // Parse age
        let age = null;
        if (record.player_age && record.player_age !== 'NA' && record.player_age !== 'N/A') {
          age = parseInt(record.player_age);
          if (isNaN(age)) age = null;
        }
        
        // Parse height
        let height = null;
        if (record.player_height_mtrs && 
            record.player_height_mtrs !== 'NA' && 
            record.player_height_mtrs !== 'N/A') {
          height = parseFloat(record.player_height_mtrs);
          if (isNaN(height)) height = null;
        }
        
        // Parse player number
        let playerNum = null;
        if (record.player_num && record.player_num !== 'NA' && record.player_num !== 'N/A') {
          playerNum = parseInt(record.player_num);
          if (isNaN(playerNum)) playerNum = null;
        }
        
        // Parse season year
        let seasonYear = null;
        if (record.season_start_year && 
            record.season_start_year !== 'NA' && 
            record.season_start_year !== 'N/A') {
          seasonYear = parseInt(record.season_start_year);
          if (isNaN(seasonYear)) seasonYear = null;
        }
        
        // Add to batch for processing
        batch.push({
          name: record.player_name,
          url: record.Player_URL || null,
          position: record.player_position || null,
          dob,
          age,
          nationality: record.player_nationality || null,
          height_mtrs: height,
          foot: record.player_foot || null,
          date_joined: dateJoined,
          joined_from: record.joined_from || null,
          current_team_id: teamId,
          player_num: playerNum,
          season_start_year: seasonYear,
          market_value_euro: marketValue,
          team_id: teamId,
          league_id: leagueId
        });
        
        // Process batch if it reaches the batch size
        if (batch.length >= batchSize) {
          await processBatch(batch);
          successCount += batch.length;
          batch = [];
          console.log(`Processed ${successCount} records so far...`);
        }
      } catch (error) {
        console.error(`Error processing record #${recordCount}:`, error);
        errorCount++;
      }
    }
    
    // Process any remaining records in the batch
    if (batch.length > 0) {
      await processBatch(batch);
      successCount += batch.length;
    }
    
    console.log(`
Player information import completed:
- Total records: ${recordCount}
- Successfully imported: ${successCount}
- Errors: ${errorCount}
    `);
    
    return { total: recordCount, success: successCount, errors: errorCount };
  } catch (error) {
    console.error(`Error importing player information: ${error.message}`);
    console.error(error.stack);
    throw error;
  }
}

// Process a batch of player records
async function processBatch(batch) {
  for (const item of batch) {
    try {
      // Check if player already exists
      const playerResult = await sql`
        SELECT id FROM players WHERE name = ${item.name}
      `;
      
      let playerId;
      if (playerResult.length === 0) {
        // Insert new player
        const newPlayerResult = await sql`
          INSERT INTO players (
            name, url, position, dob, age, nationality, 
            height_mtrs, foot, date_joined, joined_from, 
            current_team_id, player_num
          ) VALUES (
            ${item.name}, 
            ${item.url}, 
            ${item.position}, 
            ${item.dob}, 
            ${item.age}, 
            ${item.nationality},
            ${item.height_mtrs}, 
            ${item.foot}, 
            ${item.date_joined}, 
            ${item.joined_from}, 
            ${item.current_team_id}, 
            ${item.player_num}
          )
          RETURNING id
        `;
        playerId = newPlayerResult[0].id;
      } else {
        playerId = playerResult[0].id;
        
        // Update existing player
        await sql`
          UPDATE players SET
            url = COALESCE(${item.url}, url),
            position = COALESCE(${item.position}, position),
            dob = COALESCE(${item.dob}, dob),
            age = COALESCE(${item.age}, age),
            nationality = COALESCE(${item.nationality}, nationality),
            height_mtrs = COALESCE(${item.height_mtrs}, height_mtrs),
            foot = COALESCE(${item.foot}, foot),
            date_joined = COALESCE(${item.date_joined}, date_joined),
            joined_from = COALESCE(${item.joined_from}, joined_from),
            current_team_id = COALESCE(${item.current_team_id}, current_team_id),
            player_num = COALESCE(${item.player_num}, player_num)
          WHERE id = ${playerId}
        `;
      }
      
      // Add player valuation if market value exists
      if (item.market_value_euro && item.season_start_year) {
        // Check if valuation already exists
        const valuationResult = await sql`
          SELECT id FROM player_valuations 
          WHERE player_id = ${playerId} AND season_start_year = ${item.season_start_year}
        `;
        
        if (valuationResult.length === 0) {
          // Insert new valuation
          await sql`
            INSERT INTO player_valuations (
              player_id, season_start_year, market_value_euro, team_id, league_id
            ) VALUES (
              ${playerId}, ${item.season_start_year}, ${item.market_value_euro}, 
              ${item.team_id}, ${item.league_id}
            )
          `;
        } else {
          // Update existing valuation
          await sql`
            UPDATE player_valuations SET
              market_value_euro = ${item.market_value_euro},
              team_id = ${item.team_id},
              league_id = ${item.league_id}
            WHERE 
              player_id = ${playerId} AND season_start_year = ${item.season_start_year}
          `;
        }
      }
    } catch (error) {
      console.error(`Error processing player ${item.name}:`, error);
      throw error; // Re-throw to be caught by the main try/catch
    }
  }
}

// Run the import if this file is executed directly
if (process.argv[2]) {
  importPlayerInfo(process.argv[2])
    .then(result => console.log(`Import summary: ${JSON.stringify(result)}`))
    .catch(err => console.error('Import failed:', err));
} else {
  console.error('Please provide a file path: node import-player-info.js path/to/players.csv');
}

export { importPlayerInfo };