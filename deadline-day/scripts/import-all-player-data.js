import { importPlayerInfo } from './import-player-info.js';
import fs from 'fs';
import path from 'path';

async function importAllPlayerData() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    const files = fs.readdirSync(dataDir);
    
    // Filter for CSV files with player valuations
    const valuationFiles = files.filter(file => 
      file.endsWith('.csv') && 
      file.includes('_Player_Valuations')
    );
    
    console.log(`Found ${valuationFiles.length} player valuation files to import`);
    
    // Import each file sequentially
    for (const file of valuationFiles) {
      const filePath = path.join(dataDir, file);
      console.log(`\nImporting ${file}...`);
      
      try {
        const result = await importPlayerInfo(filePath);
        console.log(`Completed import of ${file}: ${JSON.stringify(result)}`);
      } catch (error) {
        console.error(`Error importing ${file}:`, error);
        // Continue with next file even if this one fails
      }
    }
    
    console.log('\nAll player valuation files have been processed');
  } catch (error) {
    console.error('Error importing all player data:', error);
  }
}

// Run the import
importAllPlayerData().catch(console.error);