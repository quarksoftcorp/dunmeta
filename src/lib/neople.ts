const API_KEY = process.env.NEOPLE_API_KEY || '18qf6PgxjRci0uTeHzHCu3lVIgOAC2wJ';
const BASE_URL = 'https://api.neople.co.kr';

export interface CharacterSearchRow {
  serverId: string;
  characterId: string;
  characterName: string;
  level: number;
  jobId: string;
  jobGrowId: string;
  jobName: string;
  jobGrowName: string;
  fame: number;
}

export interface CharacterSearchResponse {
  rows: CharacterSearchRow[];
}

export interface CharacterFullData {
  basicInfo: unknown;
  status: unknown;
  equipment: unknown;
  avatar: unknown;
  creature: unknown;
  mistAssimilation: unknown;
  skillStyle: unknown;
  buffEquipment: unknown;
  buffAvatar: unknown;
  buffCreature: unknown;
}

/**
 * Searches for characters matching the given criteria.
 */
export async function searchCharacters(serverId: string, characterName: string): Promise<CharacterSearchResponse> {
  const path = `/df/servers/${serverId}/characters?characterName=${encodeURIComponent(characterName)}&wordType=match&limit=20`;
  const url = `${BASE_URL}${path}`;

  try {
    const response = await fetch(url, {
      headers: {
        apikey: API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`Neople Character Search failed: [${response.status}] ${response.statusText} on ${path}`);
      return { rows: [] };
    }

    const data = await response.json() as CharacterSearchResponse;
    return data || { rows: [] };
  } catch (error) {
    console.error(`Neople Character Search exception on ${path}:`, error);
    return { rows: [] };
  }
}

/**
 * Helper to fetch a basic endpoint. Throws an error on failure or if it returns null.
 */
async function fetchBasicInfo(path: string): Promise<unknown> {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      apikey: API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch basic info from ${path}: [${response.status}] ${response.statusText}`);
  }

  const data = await response.json();
  if (!data) {
    throw new Error(`Basic info from ${path} returned null or empty response`);
  }
  return data;
}

/**
 * Helper to fetch optional endpoints. Logs error and returns null on failure.
 */
async function fetchOrNull(path: string): Promise<unknown> {
  const url = `${BASE_URL}${path}`;
  try {
    const response = await fetch(url, {
      headers: {
        apikey: API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`Neople API fetch failed: [${response.status}] ${response.statusText} on ${path}`);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Neople API exception on ${path}:`, error);
    return null;
  }
}

/**
 * Fetches all detailed character data endpoints concurrently.
 * If the first endpoint (basicInfo) fails or returns null, throws an error.
 * For other endpoints, if they fail, logs the error and returns null.
 */
export async function fetchCharacterFullData(serverId: string, characterId: string): Promise<CharacterFullData> {
  const endpoints = [
    `/df/servers/${serverId}/characters/${characterId}`,
    `/df/servers/${serverId}/characters/${characterId}/status`,
    `/df/servers/${serverId}/characters/${characterId}/equip/equipment`,
    `/df/servers/${serverId}/characters/${characterId}/equip/avatar`,
    `/df/servers/${serverId}/characters/${characterId}/equip/creature`,
    `/df/servers/${serverId}/characters/${characterId}/equip/mist-assimilation`,
    `/df/servers/${serverId}/characters/${characterId}/skill/style`,
    `/df/servers/${serverId}/characters/${characterId}/skill/buff/equip/equipment`,
    `/df/servers/${serverId}/characters/${characterId}/skill/buff/equip/avatar`,
    `/df/servers/${serverId}/characters/${characterId}/skill/buff/equip/creature`,
  ];

  const basicInfoPromise = fetchBasicInfo(endpoints[0]);
  const statusPromise = fetchOrNull(endpoints[1]);
  const equipmentPromise = fetchOrNull(endpoints[2]);
  const avatarPromise = fetchOrNull(endpoints[3]);
  const creaturePromise = fetchOrNull(endpoints[4]);
  const mistAssimilationPromise = fetchOrNull(endpoints[5]);
  const skillStylePromise = fetchOrNull(endpoints[6]);
  const buffEquipmentPromise = fetchOrNull(endpoints[7]);
  const buffAvatarPromise = fetchOrNull(endpoints[8]);
  const buffCreaturePromise = fetchOrNull(endpoints[9]);

  const [
    basicInfo,
    status,
    equipment,
    avatar,
    creature,
    mistAssimilation,
    skillStyle,
    buffEquipment,
    buffAvatar,
    buffCreature
  ] = await Promise.all([
    basicInfoPromise,
    statusPromise,
    equipmentPromise,
    avatarPromise,
    creaturePromise,
    mistAssimilationPromise,
    skillStylePromise,
    buffEquipmentPromise,
    buffAvatarPromise,
    buffCreaturePromise,
  ]);

  return {
    basicInfo,
    status,
    equipment,
    avatar,
    creature,
    mistAssimilation,
    skillStyle,
    buffEquipment,
    buffAvatar,
    buffCreature
  };
}
