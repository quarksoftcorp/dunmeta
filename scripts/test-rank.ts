/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from 'dotenv';
config({ path: '.env.local' });

const mockDocsData = [
  {
    characterId: 'char-1',
    serverId: 'cain',
    characterName: '마법사1',
    jobGrowName: '진 마도학자',
    fame: 55000,
    level: 110,
    searchCount: 15,
  },
  {
    characterId: 'char-2',
    serverId: 'siroco',
    characterName: '검사2',
    jobGrowName: '진 소드마스터',
    fame: 48000,
    level: 110,
    searchCount: 12,
  },
  {
    characterId: 'char-3',
    serverId: 'bakal',
    characterName: '거너3',
    jobGrowName: '진 레인저',
    fame: 42000,
    level: 105,
    searchCount: 5,
  }
];

const mockDocs = mockDocsData.map(data => ({
  data: () => data,
}));

let whereCalled = false;
let limitCalled = false;

const mockQuery: any = {
  where: (field: string, op: string, value: any) => {
    console.log(`[Mock Query] where called: ${field} ${op} ${value}`);
    if (field === 'lastSearchedAt' && op === '>=' && value instanceof Date) {
      whereCalled = true;
    }
    return mockQuery;
  },
  limit: (count: number) => {
    console.log(`[Mock Query] limit called: ${count}`);
    if (count === 100) {
      limitCalled = true;
    }
    return mockQuery;
  },
  get: async () => {
    console.log(`[Mock Query] get called`);
    return {
      docs: mockDocs,
    };
  }
};

async function run() {
  try {
    const { firestore } = await import('../src/lib/firebase-admin');
    
    firestore.collection = (collectionName: string): any => {
      console.log(`[Mock Firestore] collection called: ${collectionName}`);
      if (collectionName === 'popular_characters') {
        return mockQuery;
      }
      throw new Error(`Unexpected collection query: ${collectionName}`);
    };

    const { GET } = await import('../src/app/api/rank/route');
    console.log('Starting Ranking API Route verification...');

    // Call GET handler
    const response = await GET();
    
    // Check status
    console.log('Response Status:', response.status);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }

    // Parse JSON
    const data = await response.json();
    console.log('Response JSON Data:', JSON.stringify(data, null, 2));

    // Verify properties
    if (!Array.isArray(data)) {
      throw new Error('Response is not an array');
    }

    if (data.length !== mockDocsData.length) {
      throw new Error(`Expected ${mockDocsData.length} items, got ${data.length}`);
    }

    data.forEach((item, index) => {
      const original = mockDocsData[index];
      if (item.characterId !== original.characterId) throw new Error(`characterId mismatch at index ${index}`);
      if (item.serverId !== original.serverId) throw new Error(`serverId mismatch at index ${index}`);
      if (item.characterName !== original.characterName) throw new Error(`characterName mismatch at index ${index}`);
      if (item.jobGrowName !== original.jobGrowName) throw new Error(`jobGrowName mismatch at index ${index}`);
      if (item.fame !== original.fame) throw new Error(`fame mismatch at index ${index}`);
      if (item.level !== original.level) throw new Error(`level mismatch at index ${index}`);
      if (item.searchCount !== original.searchCount) throw new Error(`searchCount mismatch at index ${index}`);
    });

    // Check query calls
    if (!whereCalled) throw new Error('where clause for lastSearchedAt >= 24h was not called or mismatched parameters');
    if (!limitCalled) throw new Error('limit clause for 100 was not called or mismatched parameters');

    console.log('All tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

run();
