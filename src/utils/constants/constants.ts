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

export const CONSTANT_WORDS = {
  NUMBER: "թիվ",
  OTHER: "Այլ",
}

export const LOWERCASE_VILLAGE_NAMES: Set<string> = new Set([
  "սովխոզ",
  "աղբյուր",
  "կայարան",
]);

export const WORDS_TO_IGNORE = new Set<string>([
  "հարակից",
  "սեփական",
  "մասնակի",
  "ամբողջությամբ",
]);

export const WORDS_TO_REMOVE = {
  NOT: "ոչ",
  RESIDENT: "բնակիչ",
  ACCOUNT_HOLDERS: "բաժանորդներ",
  AREAS: "տարածքներ",
}

export const PROVINCES = {
  PROVINCE: "մարզ",
  YEREVAN: "Երևան",
  LORI: "Լոռի",
  VAYOTS: "Վայոց",
  DZOR: "Ձոր",
};

export const INFRASTRUCTURES = {
  VILLAGE: "գյուղ",
  VILLAGES: "գյուղեր",
  COMMUNITY: "համայնք",
  CITY: "քաղաք",
  CITIES: "քաղաքներ",
  DISTRICT: "թաղամաս",
  DISTRICTS: "թաղամասեր",
  AVENUE: "պողոտա",
  STREET: "փողոց",
  STREETS: "փողոցներ",
  LANE: "նրբանցք",
  LANES: "նրբանցքներ",
  HOUSE: "տուն",
  HOUSES: "տներ",
  BUILDING: "շենք",
  BUILDINGS: "շենքեր",
  OWNER: "սեփականատեր",
  OWNERS: "սեփականատերեր",
  HOMETOWN: "տնակային ավան",
  HOMETOWNS: "տնակային ավաններ",
  KINDERGARTEN: "մանկապարտեզ",
  KINDERGARTENS: "մանկապարտեզներ",
  SCHOOL: "դպրոց",
  SCHOOLS: "դպրոցներ",
  NURSERY: "մսուր",
  PRIVATE: "սեփական",
}
