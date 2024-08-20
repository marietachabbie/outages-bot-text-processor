const citiesJson = require("../../data/cities.json");
const villagesJson = require("../../data/villages.json");
const communitiesJson = require("../../data/communities.json");

const jsonToObjWithSets = (json: { [key: string]: string[] }): { [key: string]: Set<string> } => {
  const result: { [key: string]: Set<string> } = {};
  for (const key in json) result[key] = new Set(json[key]);
  return result;
}

export const CITIES: { [key: string]: Set<string> } = jsonToObjWithSets(citiesJson);
export const VILLAGES: { [key: string]: Set<string> } = jsonToObjWithSets(villagesJson);
export const COMMUNITIES: { [key: string]: Set<string> } = jsonToObjWithSets(communitiesJson);
export const LOWERCASE_VILLAGE_NAMES: Set<string> = new Set(["սովխոզ", "աղբյուր", "կայարան"]);
export const WORDS_TO_IGNORE = new Set<string>([
  "թիվ",
  "մասնակի",
  "ամբողջությամբ",
]);
