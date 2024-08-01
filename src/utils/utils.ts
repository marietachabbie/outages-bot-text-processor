import { Month } from "../types/month";
import { Province } from "../types/region";
import { RegionalData } from "../types/regional-data";

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

const clearPossessiveSuffix = (word: string): string => {
  let clean = word.replace('-', '');
  if (clean.endsWith('ի')) {
    clean = clean.slice(0, -1);
  } else if (clean.endsWith('ու') || clean.endsWith('վա')) {
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

const getMunicipality = (words: string[], idx: number, province: Province): string => {
  let municipality: string = "";
  let temp: string = "";
  let start: number = idx - 1;

  for (let i = idx - 1; i >= idx - 3; i--) {
    if (isNaN(parseInt(words[i])) && words[i][0] === words[i][0].toUpperCase()) {
      start = i;
    } else {
      break;
    }
  }

  temp = words.slice(start, idx).join(" ");
  if (words[idx] === "գյուղ") {
    if (VILLAGES[province].has(temp)) municipality = temp + " " + words[idx];
  } else if (words[idx] === "քաղաք") {
    if (CITIES[province].has(temp)) municipality = temp + " " + words[idx];
  }

  return municipality;
}

const collectAddresses = (words: string[], province: Province, announcements: RegionalData) => {
  announcements[province] ??= {};
  let municipality: string;

  for (let i = 0; i < words.length; i++) {
    words[i] = words[i].replace(/[-`՝]/g, '');
    if (words[i] === "գյուղ" || words[i] === "քաղաք") {
      municipality = getMunicipality(words, i, province);
      if (announcements[province] && municipality.length) {
        announcements[province][municipality] ??= [];
        // const { addresses, idx } = collectStreetsAndBldngs(words, i);
        // i = idx;
      }
    } else if (words[i] === "գյուղեր") {
      
    }
  };
}

const clearForProvince = (word: string): string => {
  let clean: string = word.replace(/[-`՝]/g, '');
  if (clean.endsWith('ի')) {
    clean = clean.slice(0, -1);
  } else if (clean.endsWith('ում')) {
    clean = clean.slice(0, -3);
  }

  return clean;
}

const buildAnnouncement = (text: string[], announcements: RegionalData) => {
  let province: Province | undefined;

  text.forEach(paragraph => {
    const words: string[] = paragraph.split(" ");

    words.forEach((word, i) => {
      word = clearForProvince(word);
  
      if (word === "Երևան") {
        province = Province[word];
      } else if (word === "մարզ") {
        province = getProvince(words[i - 1]);
      }

      if (province) {
        collectAddresses(words, province, announcements);

      }
    })
  })
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
