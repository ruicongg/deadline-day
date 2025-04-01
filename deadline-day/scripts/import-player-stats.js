import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import env from './load-env.js';

// Initialize the SQL client
const sql = neon(env.DATABASE_URL);

async function importPlayerStats(filePath) {
  try {
    console.log(`Starting import of player statistics from ${filePath}...`);
    
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
    let skippedCount = 0;
    
    // Process records in batches for better performance
    const batchSize = 50;
    let batch = [];
    
    // Create a cache for player and league lookups to reduce database queries
    const playerCache = new Map();
    const leagueCache = new Map();
    const teamCache = new Map();
    
    // Process each record from the stream
    for await (const record of parser) {
      recordCount++;
      
      try {
        // Extract player name
        const playerName = record.Player;
        if (!playerName) {
          console.warn(`Skipping record #${recordCount}: Missing player name`);
          skippedCount++;
          continue;
        }
        
        // Find player in database (using cache to reduce DB queries)
        let playerId;
        let playerTeamId;
        
        if (playerCache.has(playerName)) {
          const cachedPlayer = playerCache.get(playerName);
          playerId = cachedPlayer.id;
          playerTeamId = cachedPlayer.teamId;
        } else {
          const playerResult = await sql`
            SELECT id, current_team_id FROM players WHERE name = ${playerName}
          `;
          
          if (playerResult.length === 0) {
            console.warn(`Skipping record #${recordCount}: Player not found: ${playerName}`);
            skippedCount++;
            continue;
          } else {
            playerId = playerResult[0].id;
            playerTeamId = playerResult[0].current_team_id;
            
            // Cache the player info
            playerCache.set(playerName, { id: playerId, teamId: playerTeamId });
          }
        }
        
        // Skip players without a team
        if (!playerTeamId) {
          console.warn(`Skipping record #${recordCount}: Player ${playerName} has no team assigned`);
          skippedCount++;
          continue;
        }
        
        // Extract season year from scouting period
        const seasonMatch = record.scouting_period?.match(/(\d{4})-\d{4}/);
        const seasonYear = seasonMatch ? parseInt(seasonMatch[1]) : 2017;
        
        // Extract league from scouting period
        const leagueMatch = record.scouting_period?.match(/\d{4}-\d{4}\s(.+)/);
        const leagueName = leagueMatch ? leagueMatch[1] : "Unknown League";
        
        // Find or create league (using cache)
        let leagueId;
        if (leagueCache.has(leagueName)) {
          leagueId = leagueCache.get(leagueName);
        } else {
          const leagueResult = await sql`
            SELECT id FROM leagues WHERE name = ${leagueName}
          `;
          
          if (leagueResult.length === 0) {
            console.log(`League not found: ${leagueName}. Creating league record.`);
            const newLeagueResult = await sql`
              INSERT INTO leagues (name) 
              VALUES (${leagueName})
              RETURNING id
            `;
            leagueId = newLeagueResult[0].id;
          } else {
            leagueId = leagueResult[0].id;
          }
          
          // Cache the league ID
          leagueCache.set(leagueName, leagueId);
        }
        
        // Add to batch for processing
        batch.push({
          playerId,
          seasonYear,
          leagueId,
          teamId: playerTeamId,
          versus: record.Versus || '',
          basedOnMinutes: parseInt(record.BasedOnMinutes) || 0,
          scoutingPeriod: record.scouting_period || '',
          
          // Extract metrics (with fallbacks for missing data)
          goals_per90: parseFloat(record['Per90_Goals'] || 0),
          goals_percentile: parseInt(record['Percentile_Goals'] || 0),
          
          assists_per90: parseFloat(record['Per90_Assists'] || 0),
          assists_percentile: parseInt(record['Percentile_Assists'] || 0),
          
          pass_completion_pct_per90: parseFloat(record['Per90_Pass Completion %'] || 0),
          pass_completion_pct_percentile: parseInt(record['Percentile_Pass Completion %'] || 0),
          
          shots_total_per90: parseFloat(record['Per90_Shots Total'] || 0),
          shots_total_percentile: parseInt(record['Percentile_Shots Total'] || 0),
          
          shots_on_target_per90: parseFloat(record['Per90_Shots on Target'] || 0),
          shots_on_target_percentile: parseInt(record['Percentile_Shots on Target'] || 0),
          
          progressive_passes_per90: parseFloat(record['Per90_Progressive Passes'] || 0),
          progressive_passes_percentile: parseInt(record['Percentile_Progressive Passes'] || 0),
          
          key_passes_per90: parseFloat(record['Per90_Key Passes'] || 0),
          key_passes_percentile: parseInt(record['Percentile_Key Passes'] || 0),
          
          passes_into_final_third_per90: parseFloat(record['Per90_Passes into Final Third'] || 0),
          passes_into_final_third_percentile: parseInt(record['Percentile_Passes into Final Third'] || 0),
          
          crosses_per90: parseFloat(record['Per90_Crosses'] || 0),
          crosses_percentile: parseInt(record['Percentile_Crosses'] || 0),
          
          touches_per90: parseFloat(record['Per90_Touches'] || 0),
          touches_percentile: parseInt(record['Percentile_Touches'] || 0),
          
          touches_att_3rd_per90: parseFloat(record['Per90_Touches (Att 3rd)'] || 0),
          touches_att_3rd_percentile: parseInt(record['Percentile_Touches (Att 3rd)'] || 0),
          
          touches_att_pen_per90: parseFloat(record['Per90_Touches (Att Pen)'] || 0),
          touches_att_pen_percentile: parseInt(record['Percentile_Touches (Att Pen)'] || 0),
          
          progressive_carries_per90: parseFloat(record['Per90_Progressive Carries'] || 0),
          progressive_carries_percentile: parseInt(record['Percentile_Progressive Carries'] || 0),
          
          successful_take_ons_per90: parseFloat(record['Per90_Successful Take-Ons'] || 0),
          successful_take_ons_percentile: parseInt(record['Percentile_Successful Take-Ons'] || 0),
          
          tackles_per90: parseFloat(record['Per90_Tackles'] || 0),
          tackles_percentile: parseInt(record['Percentile_Tackles'] || 0),
          
          interceptions_per90: parseFloat(record['Per90_Interceptions'] || 0),
          interceptions_percentile: parseInt(record['Percentile_Interceptions'] || 0),
          
          blocks_per90: parseFloat(record['Per90_Blocks'] || 0),
          blocks_percentile: parseInt(record['Percentile_Blocks'] || 0),
          
          clearances_per90: parseFloat(record['Per90_Clearances'] || 0),
          clearances_percentile: parseInt(record['Percentile_Clearances'] || 0),
          
          aerials_won_per90: parseFloat(record['Per90_Aerials Won'] || 0),
          aerials_won_percentile: parseInt(record['Percentile_Aerials Won'] || 0),
          
          aerials_lost_per90: parseFloat(record['Per90_Aerials Lost'] || 0),
          aerials_lost_percentile: parseInt(record['Percentile_Aerials Lost'] || 0),
          
          aerials_won_pct_per90: parseFloat(record['Per90_% of Aerials Won'] || 0),
          aerials_won_pct_percentile: parseInt(record['Percentile_% of Aerials Won'] || 0)
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
Player statistics import completed:
- Total records: ${recordCount}
- Successfully imported: ${successCount}
- Skipped (no player or no team): ${skippedCount}
- Errors: ${errorCount}
    `);
    
    return { total: recordCount, success: successCount, skipped: skippedCount, errors: errorCount };
  } catch (error) {
    console.error(`Error importing player statistics: ${error.message}`);
    console.error(error.stack);
    throw error;
  }
}

// Process a batch of records
async function processBatch(batch) {
  for (const item of batch) {
    // Check if stats already exist for this player and season
    const existingStats = await sql`
      SELECT id FROM player_stats 
      WHERE player_id = ${item.playerId} AND season_start_year = ${item.seasonYear}
    `;
    
    if (existingStats.length > 0) {
      // Update existing stats
      await sql`
        UPDATE player_stats SET
          versus = ${item.versus},
          based_on_minutes = ${item.basedOnMinutes},
          scouting_period = ${item.scoutingPeriod},
          
          goals_per90 = ${item.goals_per90},
          goals_percentile = ${item.goals_percentile},
          
          assists_per90 = ${item.assists_per90},
          assists_percentile = ${item.assists_percentile},
          
          pass_completion_pct_per90 = ${item.pass_completion_pct_per90},
          pass_completion_pct_percentile = ${item.pass_completion_pct_percentile},
          
          shots_total_per90 = ${item.shots_total_per90},
          shots_total_percentile = ${item.shots_total_percentile},
          
          shots_on_target_per90 = ${item.shots_on_target_per90},
          shots_on_target_percentile = ${item.shots_on_target_percentile},
          
          progressive_passes_per90 = ${item.progressive_passes_per90},
          progressive_passes_percentile = ${item.progressive_passes_percentile},
          
          key_passes_per90 = ${item.key_passes_per90},
          key_passes_percentile = ${item.key_passes_percentile},
          
          passes_into_final_third_per90 = ${item.passes_into_final_third_per90},
          passes_into_final_third_percentile = ${item.passes_into_final_third_percentile},
          
          crosses_per90 = ${item.crosses_per90},
          crosses_percentile = ${item.crosses_percentile},
          
          touches_per90 = ${item.touches_per90},
          touches_percentile = ${item.touches_percentile},
          
          touches_att_3rd_per90 = ${item.touches_att_3rd_per90},
          touches_att_3rd_percentile = ${item.touches_att_3rd_percentile},
          
          touches_att_pen_per90 = ${item.touches_att_pen_per90},
          touches_att_pen_percentile = ${item.touches_att_pen_percentile},
          
          progressive_carries_per90 = ${item.progressive_carries_per90},
          progressive_carries_percentile = ${item.progressive_carries_percentile},
          
          successful_take_ons_per90 = ${item.successful_take_ons_per90},
          successful_take_ons_percentile = ${item.successful_take_ons_percentile},
          
          tackles_per90 = ${item.tackles_per90},
          tackles_percentile = ${item.tackles_percentile},
          
          interceptions_per90 = ${item.interceptions_per90},
          interceptions_percentile = ${item.interceptions_percentile},
          
          blocks_per90 = ${item.blocks_per90},
          blocks_percentile = ${item.blocks_percentile},
          
          clearances_per90 = ${item.clearances_per90},
          clearances_percentile = ${item.clearances_percentile},
          
          aerials_won_per90 = ${item.aerials_won_per90},
          aerials_won_percentile = ${item.aerials_won_percentile},
          
          aerials_lost_per90 = ${item.aerials_lost_per90},
          aerials_lost_percentile = ${item.aerials_lost_percentile},
          
          aerials_won_pct_per90 = ${item.aerials_won_pct_per90},
          aerials_won_pct_percentile = ${item.aerials_won_pct_percentile}
        WHERE 
          player_id = ${item.playerId} AND season_start_year = ${item.seasonYear}
      `;
    } else {
      // Insert new stats
      await sql`
        INSERT INTO player_stats (
          player_id, season_start_year, league_id, team_id, versus, based_on_minutes, scouting_period,
          goals_per90, goals_percentile,
          assists_per90, assists_percentile,
          pass_completion_pct_per90, pass_completion_pct_percentile,
          shots_total_per90, shots_total_percentile,
          shots_on_target_per90, shots_on_target_percentile,
          progressive_passes_per90, progressive_passes_percentile,
          key_passes_per90, key_passes_percentile,
          passes_into_final_third_per90, passes_into_final_third_percentile,
          crosses_per90, crosses_percentile,
          touches_per90, touches_percentile,
          touches_att_3rd_per90, touches_att_3rd_percentile,
          touches_att_pen_per90, touches_att_pen_percentile,
          progressive_carries_per90, progressive_carries_percentile,
          successful_take_ons_per90, successful_take_ons_percentile,
          tackles_per90, tackles_percentile,
          interceptions_per90, interceptions_percentile,
          blocks_per90, blocks_percentile,
          clearances_per90, clearances_percentile,
          aerials_won_per90, aerials_won_percentile,
          aerials_lost_per90, aerials_lost_percentile,
          aerials_won_pct_per90, aerials_won_pct_percentile
        ) VALUES (
          ${item.playerId}, ${item.seasonYear}, ${item.leagueId}, ${item.teamId}, 
          ${item.versus}, ${item.basedOnMinutes}, ${item.scoutingPeriod},
          ${item.goals_per90}, ${item.goals_percentile},
          ${item.assists_per90}, ${item.assists_percentile},
          ${item.pass_completion_pct_per90}, ${item.pass_completion_pct_percentile},
          ${item.shots_total_per90}, ${item.shots_total_percentile},
          ${item.shots_on_target_per90}, ${item.shots_on_target_percentile},
          ${item.progressive_passes_per90}, ${item.progressive_passes_percentile},
          ${item.key_passes_per90}, ${item.key_passes_percentile},
          ${item.passes_into_final_third_per90}, ${item.passes_into_final_third_percentile},
          ${item.crosses_per90}, ${item.crosses_percentile},
          ${item.touches_per90}, ${item.touches_percentile},
          ${item.touches_att_3rd_per90}, ${item.touches_att_3rd_percentile},
          ${item.touches_att_pen_per90}, ${item.touches_att_pen_percentile},
          ${item.progressive_carries_per90}, ${item.progressive_carries_percentile},
          ${item.successful_take_ons_per90}, ${item.successful_take_ons_percentile},
          ${item.tackles_per90}, ${item.tackles_percentile},
          ${item.interceptions_per90}, ${item.interceptions_percentile},
          ${item.blocks_per90}, ${item.blocks_percentile},
          ${item.clearances_per90}, ${item.clearances_percentile},
          ${item.aerials_won_per90}, ${item.aerials_won_percentile},
          ${item.aerials_lost_per90}, ${item.aerials_lost_percentile},
          ${item.aerials_won_pct_per90}, ${item.aerials_won_pct_percentile}
        )
      `;
    }
  }
}

// Run the import if this file is executed directly
if (process.argv[2]) {
  importPlayerStats(process.argv[2])
    .then(result => console.log(`Import summary: ${JSON.stringify(result)}`))
    .catch(err => console.error('Import failed:', err));
} else {
  console.error('Please provide a file path: node import-player-stats.js path/to/stats.csv');
}

export { importPlayerStats };