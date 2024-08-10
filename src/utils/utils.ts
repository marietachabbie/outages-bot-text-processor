import { Month } from "../types/month";
import { Province } from "../types/region";
import { RegionalData, TempRegionalData } from "../types/regional-data";

import { NoDateFoundError, NoProvinceFoundError } from "./errors/errors";
import { CITIES, VILLAGES, LOWERCASE_VILLAGE_NAMES, WORDS_TO_IGNORE } from "./constants/constants";

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
  return word === "քաղաք" || word === "քաղաքը" || word === "քաղաքի" || word === "քաղաքում";
}

const isVillage = (word: string): boolean => {
  return word === "գյուղ" || word === "գյուղը" || word === "գյուղի" || word === "գյուղում";
}

const getStartIndex = (words: string[], idx: number): number => {
  let start: number = idx - 1;
  for (let i = idx - 1; i >= idx - 3; i--) {
    if (isNotNumeric(words[i]) && !(words[i].endsWith(',')) && isPartOfVillageName(words[i])) start = i;
    else break;
  }

  return start;
}

const removeParsedWords = (words: string[], start: number, end: number) => {
  for (let i = start; i <= end; i++) words[i] = '';
}

const getMunicipality = (words: string[], idx: number, province: Province): string => {
  let municipality: string = "";
  let temp: string = "";
  let start: number = getStartIndex(words, idx);

  temp = words.slice(start, idx).join(" ");
  words[idx] = clearSuffixes(words[idx]);
  if (isVillage(words[idx])) {
    if (VILLAGES[province].has(temp)) municipality = temp + " " + words[idx];
  } else if (isCity(words[idx])) {
    if (CITIES[province].has(temp)) municipality = temp + " " + words[idx];
  }

  removeParsedWords(words, start, idx);
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

const collectTempMunicipalities = (words: string[], idx: number): { tempMunicipalities: string[], count: number} => {
  const tempMunicipalities: string[] = [words[idx]];
  let temp: string = "";
  let count: number = 1;

  for (let i = idx - 1; i >= 0; i--) {
    words[i] = words[i].replace(',', '');
    if (isNotNumeric(words[i])) {
      if (isPartOfVillageName(words[i])) {
        if (didPrevAddressEnd(words[i - 1])) {
          if (temp.length) {
            tempMunicipalities.push(words[i] + " " + temp);
            count += 2;
            temp = "";
          } else {
            tempMunicipalities.push(words[i]);
            count++;
          }
        } else {
          if (temp.length) temp = words[i] + " " + temp;
          else temp = words[i];
        }
      } else {
        if (isConjunction(words[i])) {
          count++;
        }
        else break;
      }
    }
  }

  return { tempMunicipalities, count };
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
  const { tempMunicipalities, count } = collectTempMunicipalities(words, idx);
  const municipalities: string[] = [];
  if (tempMunicipalities.length) collectMunicipalities(tempMunicipalities, municipalities, province);

  removeParsedWords(words, idx - count + 1, idx);
  return municipalities;
}

const areVillages = (word: string): boolean => {
  return word === "գյուղեր" || word === "գյուղերը" || word === "գյուղերի" || word === "գյուղերում";
}

}

const areCities = (word: string): boolean => {
  return word === "քաղաքներ" || word === "քաղաքները" || word === "քաղաքները" || word === "քաղաքների" || word === "քաղաքներում";
}
const shouldIgnore = (word: string): boolean => {
  word = word.replace(/[-,ը]/g, '');
  return !(word.length) || WORDS_TO_IGNORE.has(word);
}

const parseStreetsAndBuildings = (text: string[]): string[] => {
  const result: string[] = [];

  for (let i = 0; i < text.length; i++) {
    if (shouldIgnore(text[i])) {
      continue;
    }
  };

  return text;
}

const collectStreetsAndBuildings = (words: string[], idx: number, nextIdx: number): string[] => {
  const addresses: string[] = [];

  const streetsAndBuildings = parseStreetsAndBuildings(words.slice(idx, nextIdx));
  if (streetsAndBuildings.length) addresses.push(...streetsAndBuildings);

  return addresses;
}

const collectAddresses = (words: string[], province: Province, announcements: RegionalData) => {
  announcements[province] ??= {};
  let prevIdx: number = words.length + 1;

  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i].replace(',', '');
    if (isVillage(word) || isCity(word)) {
      const municipality: string = getMunicipality(words, i, province);

      if (announcements[province] && municipality.length) {
        announcements[province][municipality] ??= [];
        const addresses = collectStreetsAndBuildings(words, i, prevIdx);

        if (addresses.length) announcements[province][municipality].push(...addresses);
        prevIdx = i;
      }
    } else if (areVillages(word) || areCities(word)) {
      const municipalities: string[] = getMunicipalities(words, i, province);
      if (announcements[province] && municipalities.length) {
        municipalities.forEach(municipality => announcements[province]![municipality] ??= []);
      }

      prevIdx = i;
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
