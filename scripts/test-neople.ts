import { config } from 'dotenv';
config({ path: '.env.local' });

import { searchCharacters, fetchCharacterFullData } from '../src/lib/neople';

async function run() {
  try {
    const serverId = 'cain';
    const characterName = '아라드'; // A very common Korean character name in DNF

    console.log(`Searching for character: "${characterName}" on server "${serverId}"...`);
    const searchRes = await searchCharacters(serverId, characterName);
    const count = searchRes.rows ? searchRes.rows.length : 0;
    console.log(`Search Result count: ${count}`);

    if (count > 0) {
      const char = searchRes.rows[0];
      console.log(`Found character: ${char.characterName} (ID: ${char.characterId}, Level: ${char.level}, Fame: ${char.fame})`);
      
      console.log(`Fetching full data for character ${char.characterId}...`);
      const fullData = await fetchCharacterFullData(char.serverId || serverId, char.characterId);
      
      const basicInfo = fullData.basicInfo as { level?: number } | null;
      console.log(`Basic Info level: ${basicInfo?.level ?? 'N/A'}`);
      console.log('Sub-endpoint status summary:');
      console.log('- status:', fullData.status ? 'OK' : 'Failed/Null');
      console.log('- equipment:', fullData.equipment ? 'OK' : 'Failed/Null');
      console.log('- avatar:', fullData.avatar ? 'OK' : 'Failed/Null');
      console.log('- creature:', fullData.creature ? 'OK' : 'Failed/Null');
      console.log('- mistAssimilation:', fullData.mistAssimilation ? 'OK' : 'Failed/Null');
      console.log('- skillStyle:', fullData.skillStyle ? 'OK' : 'Failed/Null');
      console.log('- buffEquipment:', fullData.buffEquipment ? 'OK' : 'Failed/Null');
      console.log('- buffAvatar:', fullData.buffAvatar ? 'OK' : 'Failed/Null');
      console.log('- buffCreature:', fullData.buffCreature ? 'OK' : 'Failed/Null');
    } else {
      console.error('Error: No characters found, cannot proceed to test fetchCharacterFullData.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Test failed with error:', error);
    process.exit(1);
  }
}

run();
