import { Month } from "../types/month";
import { Province } from "../types/region";
import { RegionalData, TempRegionalData } from "../types/regional-data";

import { NoDateFoundError, NoProvinceFoundError } from "./errors/errors";

const citiesJson = require("../data/cities.json");
const villagesJson = require("../data/villages.json");

const jsonToObjWithSets = (json: { [key: string]: string[] }): { [key: string]: Set<string> } => {
  const result: { [key: string]: Set<string> } = {};
  for (const key in json) result[key] = new Set(json[key]);
  return result;
}

const CITIES: { [key: string]: Set<string> } = jsonToObjWithSets(citiesJson);
const VILLAGES: { [key: string]: Set<string> } = jsonToObjWithSets(villagesJson);
const LOWERCASE_VILLAGE_NAMES: Set<string> = new Set(["սովխոզ", "աղբյուր", "կայարան"]);

const clearPossessiveSuffix = (word: string): string => {
  let clean = word.replace('-', '');
  if (clean.endsWith('ի')) {
    clean = clean.slice(0, -1);
  } else if (clean.endsWith('ու') || clean.endsWith('վա')) {
    clean = clean.slice(0, -2);
  }

  return clean;
}

const clearSuffixes = (word: string): string => {
  let clean: string = word.replace(/[`՝,]/g, '');
  if (clean.endsWith('ի')) {
    clean = clean.slice(0, -1);
  } else if (clean.endsWith('ում')) {
    clean = clean.slice(0, -3);
  }

  return clean;
}

const clearPluralSuffix = (word: string): string => {
  let clean: string = word;
  if (clean.endsWith("ներ")) {
    clean = clean.slice(0, -3);
  } else if (clean.endsWith("եր")) {
    clean = clean.slice(0, -2);
  }

  return clean;
}

const getDay = (word: string): number | undefined => {
  const numeric = word.match(/\d+/);
  return numeric ? parseInt(numeric[0]) : undefined;
}

const getDate = (line: string): Date => {
  // TODO: take care of next year
  const text = line.split(" ");
  const year: number = new Date().getFullYear();
  let day: number | undefined;
  let month: number | undefined;

  for (let i = 0; i < text.length; i++) {
    const word = clearPossessiveSuffix(text[i]);

    if (word in Month) {
      month = Month[word as keyof typeof Month];
      day = getDay(text[i + 1]);
      break;
    }
  }

  if (!day || !month) throw new NoDateFoundError({
    name: "NO_DATE_FOUND",
    message: "No valid date found",
  });

  return new Date(year, month, day, 0, 0, 0, 0)
}

const inFuture = (date: Date): boolean => {
  const now: Date = new Date();
  return date >= now;
}

const getProvince = (word: string): Province => {
  let cleanWord: string = clearPossessiveSuffix(word);
  if (cleanWord === "Լոռ") {
    cleanWord = "Լոռի";
  } else if (cleanWord === "Ձոր") {
    cleanWord = "Վայոց Ձոր";
  }

  if (cleanWord in Province) return Province[cleanWord as keyof typeof Province];

  throw new NoProvinceFoundError({
    name: "NO_PROVINCE_FOUND",
    message: "Failed to retrieve province",
  })
}

const isCity = (word: string): boolean => {
  return word === "քաղաք" || word === "քաղաքի" || word === "քաղաքում";
}

const isVillage = (word: string): boolean => {
  return word === "գյուղ" || word === "գյուղի" || word === "գյուղում";
}

const getStartIndex = (words: string[], idx: number): number => {
  let start: number = idx - 1;
  for (let i = idx - 1; i >= idx - 3; i--) {
    if (isNotNumeric(words[i]) && isPartOfVillageName(words[i])) start = i;
    else break;
  }

  return start;
}

const getMunicipality = (words: string[], idx: number, province: Province): string => {
  let municipality: string = "";
  let temp: string = "";
  let start: number = getStartIndex(words, idx);

  temp = words.slice(start, idx).join(" ");
  words[idx] = clearSuffixes(words[idx]);
  if (isVillage(clearSuffixes(words[idx]))) {
    if (VILLAGES[province].has(temp)) municipality = temp + " " + words[idx];
  } else if (isCity(words[idx])) {
    if (CITIES[province].has(temp)) municipality = temp + " " + words[idx];
  }

  return municipality;
}

const isConjunction = (word: string): boolean => {
  return word === 'և' || word === 'եւ' || word === 'ու';
}

const isPartOfVillageName = (word: string): boolean => {
  return word[0] === word[0].toUpperCase() || LOWERCASE_VILLAGE_NAMES.has(word);
}

const isNotNumeric = (word: string): boolean => {
  return isNaN(parseInt(word));
}

const didPrevAddressEnd = (word: string): boolean => {
  return !word || word.endsWith(",") || isConjunction(word) || !isNotNumeric(word);
}

const collectTempMunicipalities = (words: string[], idx: number): string[] => {
  const result: string[] = [words[idx]];
  let temp: string = "";

  for (let i = idx - 1; i >= 0; i--) {
    words[i] = words[i].replace(',', '');
    if (isNotNumeric(words[i])) {
      if (isPartOfVillageName(words[i])) {
        if (didPrevAddressEnd(words[i - 1])) {
          if (temp.length) {
            result.push(words[i] + " " + temp);
            temp = "";
          } else result.push(words[i]);
        } else {
          if (temp.length) temp = words[i] + " " + temp;
          else temp = words[i];
        }
      } else {
        if (isConjunction(words[i])) continue;
        else break;
      }
    }
  }

  return result;
}

const collectMunicipalities = (tempData: string[], result: string[], province: Province) => {
  const municipalityType: string = clearPluralSuffix(clearSuffixes(tempData[0]));

  for (let i = 1; i < tempData.length; i++) {
    tempData[i] = tempData[i].replace(',', '');
    if (isVillage(municipalityType)) {
      if (VILLAGES[province].has(tempData[i])) result.push(tempData[i] + " " + municipalityType);
    } else if (isCity(municipalityType)) {
      if (CITIES[province].has(tempData[i])) result.push(tempData[i] + " " + municipalityType);
    }
  }
}

const getMunicipalities = (words: string[], idx: number, province: Province): string[] => {
  const tempMunicipalities: string[] = collectTempMunicipalities(words, idx);
  const municipalities: string[] = [];
  if (tempMunicipalities.length) collectMunicipalities(tempMunicipalities, municipalities, province);

  return municipalities;
}

const areVillages = (word: string): boolean => {
  return word === "գյուղեր" || word === "գյուղերի" || word === "գյուղերում";
}

const areCities = (word: string): boolean => {
  return word === "քաղաքներ" || word === "քաղաքների" || word === "քաղաքներում";
}

const collectStreetsAndBuildings = (words: string[], idx: number, province: Province): { addresses: string[], nextMunicipalityIndex: number } => {
  const addresses: string[] = [];
  let nextMunicipalityIndex: number = words.length;

  for (let i = idx + 1; i < words.length; i++) {
    if (i > idx + 1 && (isVillage(words[i]) || isCity(words[i]) || areVillages(words[i]) || areCities(words[i]))) {
      nextMunicipalityIndex = i;
      break;
    } else {

    }
  }

  return { addresses, nextMunicipalityIndex };
}

const collectAddresses = (words: string[], province: Province, announcements: RegionalData) => {
  announcements[province] ??= {};

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(',', '');
    if (isVillage(word) || isCity(word)) {
      const municipality: string = getMunicipality(words, i, province);

      if (announcements[province] && municipality.length) {
        announcements[province][municipality] ??= [];
        const { addresses, nextMunicipalityIndex } = collectStreetsAndBuildings(words, i, province);

        if (addresses.length) announcements[province][municipality].push(...addresses);
        i = nextMunicipalityIndex - 1;
      }
    } else if (areVillages(word) || areCities(word)) {
      const municipalities: string[] = getMunicipalities(words, i, province);
      if (announcements[province] && municipalities.length) {
        municipalities.forEach(municipality => announcements[province]![municipality] ??= []);
      }
    }
  };
}

const organiseByProvince = (text: string[], data: TempRegionalData) => {
  let province: Province | undefined;

  text.forEach(line => {
    const words: string[] = line.split(" ");
    words.forEach((word, i) => {
      word = clearSuffixes(word);

      if (word === "Երևան" || word === "մարզ") {
        if (word === "Երևան") province = Province[word];
        else if (word === "մարզ") province = getProvince(words[i - 1]);
        line = '';
      }
    })

    if (province) {
      data[province] ??= [];
      if (line.length) data[province]?.push(line);
    }
  })
}

const processForProvince = (tempData: TempRegionalData, resData: RegionalData) => {
  for (const [province, text] of Object.entries(tempData)) {
    for (const line of text) {
      const words: string[] = line.split(" ").map(word => word.replace(/[`՝]/g, ''));
      collectAddresses(words, province as Province, resData);
    }
  }
}

const buildAnnouncement = (text: string[], announcements: RegionalData) => {
  const tempRegionalData: TempRegionalData = {};
  organiseByProvince(text, tempRegionalData)
  processForProvince(tempRegionalData, announcements);
}

const generateStructuredAnnouncement = (text: string[]): RegionalData => {
  const res: RegionalData = {};
  const date: Date = getDate(text[0]);

  if (inFuture(date)) {
    buildAnnouncement(text, res);
  }

  return res;
}

export default {
  parseMessage: (text: string): RegionalData => {
    const splittedText = text.split("\n");
    const res: RegionalData = generateStructuredAnnouncement(splittedText);
    return res;
  }
}
