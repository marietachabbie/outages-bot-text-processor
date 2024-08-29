import { TProvince } from "../../types/region";
import { RegionalData } from "../../types/regional-data";
import { booleanUtils } from "./booleanUtils";
import { municipalityUtils } from "./municipalityUtils";
import { stringCleaner } from "./stringCleaner";

import { INFRASTRUCTURES, CONSTANT_WORDS } from "../constants/constants";
const {
  NUMBER,
  OTHER,
} = CONSTANT_WORDS;

const {
  DISTRICT,
  STREET,
  AVENUE,
  LANE,
  HOUSE,
  HOUSES,
  BUILDING,
  OWNER,
  HOMETOWN,
  KINDERGARTEN,
  SCHOOL,
  NURSERY,
  PRIVATE,
} = INFRASTRUCTURES;

const collectNamesAndNumbers = (text: string[], idx: number, result: string[], infrastructure: string): number => {
  const singleNameTemp: string[] = [];
  const nameListTemp: string[] = [];
  const numericalNamesTemp: string[] = [];
  let nextIdx: number = -1;

  for (let i = idx - 1; i >= 0; i--) {
    if (booleanUtils.shouldIgnore(text[i]) || booleanUtils.isConjunction(text[i])) {
      continue;
    }

    text[i] = text[i].replace(/[(),]/g, '');
    if (booleanUtils.doesNotContainNumbers(text[i])) {
      if (booleanUtils.startsWithUppercase(text[i]) || text[i] === "թիվ") {
        singleNameTemp.push(text[i]);
        if (booleanUtils.didPrevAddressEnd(text[i - 1])) {
          nameListTemp.push(singleNameTemp.reverse().join(' '));
          singleNameTemp.length = 0;
        }
      } else {
        nextIdx = i + 1;
        break;
      }
    } else {
      collectNumericProperties(text[i], numericalNamesTemp);
    }
  }

  const nameListStr: string = nameListTemp.length ? nameListTemp.join(' ') + ' ' : '';  
  if (numericalNamesTemp.length) {
    for (const num of numericalNamesTemp) result.push(nameListStr + num + ' ' + infrastructure);
  }

  if (nextIdx >= 0) stringCleaner.removeParsedWords(text, nextIdx, idx);
  return nextIdx;
}

const collectInfrastructures = (text: string[], result: string[], isRequiredInfrastructure: Function, infrastructure: string) => {
  for (let i = text.length - 1; i >= 0; i--) {
    if (isRequiredInfrastructure(text[i])) {
      const nextIdx: number = collectNamesAndNumbers(text, i, result, infrastructure);
      i = nextIdx + 1;
    }
  }
}

const collectBinarInfrastructures = (text: string[], result: string[], isRequiredInfrastructure: Function, infrastructure: string) => {
  for (let i = text.length - 1; i >= 0; i--) {
    if (isRequiredInfrastructure(text[i], text[i - 1])) {
      const nextIdx: number = collectNamesAndNumbers(text, i - 1, result, infrastructure);
      i = nextIdx + 1;
    }
  }
}

const getStartOfOwnersList = (text: string[], idx: number): number => {
  let start: number = 0;

  for (let i = idx - 1; i >= 0; i--) {
    if (booleanUtils.startsWithQuote(text[i])) {
      start = i;
    } else if (booleanUtils.endsWithQuote(text[i]) || booleanUtils.startsWithQuote(text[i - 1])) {
      continue;
    } else {
      break;
    }
  }

  return start;
}

const collectOwnerNames = (text: string[], start: number, end: number, result: string[]): number[] => {
  const ownerNames: string[] = [];
  const tempName: string[] = [];
  let firstIdx: number = -1;
  let lastIdx: number = -1;

  for (let i = start; i <= end; i++) {
    text[i] = text[i].replace(',', '');
    if (booleanUtils.startsWithQuote(text[i]) && booleanUtils.endsWithQuote(text[i])) {
      ownerNames.push(text[i]);
      if (firstIdx === -1) firstIdx = i;
      lastIdx = i;
    } else if (booleanUtils.startsWithQuote(text[i])) {
      tempName.push(text[i]);
      if (firstIdx === -1) firstIdx = i;
    } else if (booleanUtils.endsWithQuote(text[i])) {
      if (!text[i].endsWith(',') && !booleanUtils.startsWithQuote(text[i + 1]) && booleanUtils.startsWithUppercase(text[i + 1])) {
        break
      } else {
        tempName.push(text[i]);
      }

      ownerNames.push(tempName.join(' '));
      lastIdx = Math.max(i, lastIdx);
      tempName.length = 0;
    } else if (booleanUtils.startsWithUppercase(text[i])) {
      tempName.push(text[i]);
    } else {
      break;
    }
  }

  for (const name of ownerNames) result.push(name + ' ' + OWNER);
  return [firstIdx, lastIdx];
}

const collectOwners = (text: string[], result: string[]) => {
  for (let i = 0; i < text.length; i++) {
    if (booleanUtils.areOwners(text[i])) {
      if (booleanUtils.didPrevAddressEnd(text[i - 1])) {
        const [firstIdx, lastIdx] = collectOwnerNames(text, i + 1, text.length - 1, result);
        if (lastIdx >= 0) stringCleaner.removeParsedWords(text, i, lastIdx);
      } else {
        const startIndex: number = getStartOfOwnersList(text, i);
        const [firstIdx, lastIdx] = collectOwnerNames(text, startIndex, i - 1, result);
        if (firstIdx >= 0) stringCleaner.removeParsedWords(text, firstIdx, i);
      }
    }
  }
}

const collectPluralKindergartens = (text: string[], result: string[]) => {
  let idx: number = text.length - 1;
  let infrastructure: string = "";

  for (let i = text.length - 1; i >= 0; i--) {
    if (booleanUtils.areKindergartens(text[i])) {
      if (booleanUtils.isNurserySchool(text[i])) {
        idx = i;
        infrastructure = NURSERY + '-' + KINDERGARTEN;
      } else if (booleanUtils.isNurserySchool(text[i - 1])) {
        idx = i - 1;
        text[i] = '';
        infrastructure = NURSERY + '-' + KINDERGARTEN;
      } else {
        idx = i;
        infrastructure = KINDERGARTEN;
      }

      const nextIdx: number = collectNamesAndNumbers(text, idx, result, infrastructure);
      i = nextIdx + 1;
    }
  }
}

const collectLanes = (text: string[], result: string[], idx: number): number => {
  const tempLanes: string[] = [];
  const streetName: string[] = [];
  let hasStreetName: boolean = false;
  let nextIdx: number = -1;

  for (let i = idx - 1; i >= 0; i--) {
    if (!text[i].endsWith(',')) {
      if (booleanUtils.isOrdinalNumber(text[i])) {
        if (hasStreetName) streetName.push(text[i]);
        else tempLanes.push(text[i]);
        nextIdx = i;
      } else if (booleanUtils.isStreet(text[i])) {
        hasStreetName = true;
      } else if (booleanUtils.startsWithUppercase(text[i])) {
        streetName.push(text[i]);
        nextIdx = i;
      } else if (booleanUtils.isNumeric(text[i])) {
        if (hasStreetName) streetName.push(text[i]);
        else tempLanes.push(text[i]);
        nextIdx = i;
      } else if (booleanUtils.isConjunction(text[i])) {
        continue;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  if (tempLanes.length) {
    if (hasStreetName && streetName.length) {
      const strName: string = streetName.reverse().join(' ');
      for (const lane of tempLanes) result.push(strName + ' ' + STREET + ' ' + lane + ' ' + LANE);
    } else if (streetName.length) {
      const strName: string = streetName.reverse().join(' ');
      for (const lane of tempLanes) result.push(strName + ' ' + lane + ' ' + LANE);
    } else {
      for (const lane of tempLanes) result.push(lane + ' ' + LANE);
    }
  }

  if (nextIdx >= 0) stringCleaner.removeParsedWords(text, nextIdx, idx);
  return nextIdx;
}

const collectPluralLanes = (text: string[], result: string[]) => {
  for (let i = text.length - 1; i >= 0; i--) {
    if (booleanUtils.areLanes(text[i])) {
      const nextIdx: number = collectLanes(text, result, i);
      i = nextIdx + 1;
    }
  }
}

const parsePluralIndependents = (text: string[], result: string[]) => {
  collectInfrastructures(text, result, booleanUtils.areStreets, STREET);
  collectInfrastructures(text, result, booleanUtils.areDistricts, DISTRICT);
  collectBinarInfrastructures(text, result, booleanUtils.areHometowns, HOMETOWN);
  collectPluralKindergartens(text, result);
  collectInfrastructures(text, result, booleanUtils.areSchools, SCHOOL);
  collectPluralLanes(text, result);
  collectOwners(text, result);
}

const parseStreetName = (text: string[], idx: number, streetName: string[]) => {
  let prevIdx: number = -1;

  for (let i = idx - 1; i >= 0; i--) {
    if (!text[i].endsWith(',') && text[i].length && !booleanUtils.isConjunction(text[i])) {
      streetName.push(text[i]);
      prevIdx = i;
    } else {
      prevIdx = i;
      break;
    }
  }

  if (prevIdx >= 0) stringCleaner.removeParsedWords(text, prevIdx + 1, idx);
}

const getInfrastructureType = (text: string[], idx: number): string => {
  text[idx] = text[idx].replace(/[,:ը]/, '');
  let result: string = "";
  if (booleanUtils.areBuildings(text[idx])) {
    result = BUILDING;
  } else if (booleanUtils.areHouses(text[idx])) {
    if (booleanUtils.arePrivateHouses(text[idx], text[idx - 1])) {
      result = PRIVATE + ' ' + HOUSE;
    } else {
      result = text[idx].replace(HOUSES, HOUSE);
    }
  }

  return result;
}

const collectNumericProperties = (word: string, numbers: string[]) => {
  word = word.replace(',', '');
  if (booleanUtils.doesContainNumbers(word)) {
    if (word.includes('-')) {
      const parts: string[] = word.split('-');
      if (parts.length === 2) {
        for (let i = parseInt(parts[0]); i <= parseInt(parts[1]); i++) {
          numbers.push(i.toString());
        }

        if (numbers[numbers.length - 1] !== parts[1]) numbers.push(parts[1]);
      }
    } else {
      numbers.push(word);
    }
  }
}

const collectMultipleProperties = (text: string[], start: number, end: number, properties: string[]) => {
  const infrastructure: string = getInfrastructureType(text, end);
  const propNumbers: string[] = [];
  for (let i = start; i < end; i++) {
    if (!booleanUtils.isConjunction(text[i])) collectNumericProperties(text[i], propNumbers);
  }

  for (const num of propNumbers) properties.push(num + ' ' + infrastructure);
}

const collectSingleProperty = (text: string[], start: number, end: number, properties: string[]) => {
  text[start] = text[start].replace(',', '');
  const infrastructure: string = stringCleaner.clearSuffixes(text[end]);
  if (booleanUtils.doesContainNumbers(text[start])) properties.push(text[start] + ' ' + infrastructure);
}

const parseProperties = (text: string[], idx: number, properties: string[]): number => {
  let nextIdx: number = -1;
  let wordIdx: number = -1;
  let isPlural: boolean = false;

  for (let i = idx + 1; i < text.length; i++) {
    if (booleanUtils.shouldIgnore(text[i])) {
      continue;
    } else {
      if (booleanUtils.doesNotContainNumbers(text[i].replace(',', ''))) {
        nextIdx = i;
        if (booleanUtils.isPlural(text[i])) {
          isPlural = true;
          wordIdx = i;
          break;
        } else {
          wordIdx = i;
          break;
        }
      }
    }
  }

  if (wordIdx >= 0) {
    if (!isPlural) {
      collectSingleProperty(text, idx + 1, wordIdx, properties);
    } else {
      if (booleanUtils.areBuildings(text[wordIdx]) || booleanUtils.areHouses(text[wordIdx])) {
        collectMultipleProperties(text, idx + 1, wordIdx, properties);
      }
    }
  }

  if (nextIdx >= 0) stringCleaner.removeParsedWords(text, idx, nextIdx);
  return nextIdx;
}

const getStreetType = (word: string): string => {
  if (booleanUtils.isStreet(word)) return STREET;
  else if (booleanUtils.isAvenue(word)) return AVENUE;
  else return "(temp) Something is wrong";
}

const parseStreetsAndProperties = (text: string[], result: string[]) => {
  const streetName: string[] = [];
  const properties: string[] = [];

  for (let i = 0; i < text.length; i++) {
    if (booleanUtils.isStreet(text[i]) || booleanUtils.isAvenue(text[i])) {
      streetName.push(getStreetType(text[i]));
      parseStreetName(text, i, streetName);
      const nextIdx: number = parseProperties(text, i, properties);

      if (streetName.length) {
        const street: string = streetName.reverse().join(' ');
        streetName.length = 0;
        if (properties.length) {
          for (const property of properties) result.push(street + ' ' + property);
          properties.length = 0;
        } else {
          result.push(street);
        }
      }

      if (nextIdx >= 0) i = nextIdx;
    }
  }
}

const parseAdresses = (text: string[]): string[] => {
  const result: string[] = [];

  parsePluralIndependents(text, result);
  parseStreetsAndProperties(text, result);
  parseEducationalFacilities(text, result); // singulars (rename)

  return result;
}

const collectStreetsAndBuildings = (words: string[], idx: number, nextIdx: number): string[] => {
  const addresses: string[] = [];

  const streetsAndBuildings = parseAdresses(words.slice(idx, nextIdx));
  if (streetsAndBuildings.length) addresses.push(...streetsAndBuildings);

  return addresses;
}

export const collectAddresses = (words: string[], province: TProvince, announcements: RegionalData) => {
  announcements[province] ??= {};
  let prevIdx: number = words.length + 1;

  for (let i = words.length - 1; i >= 0; i--) {
    const word = words[i].replace(',', '');
    if (booleanUtils.isVillage(word) || booleanUtils.isCity(word) || booleanUtils.isCommunity(word)) {
      const municipality: string = municipalityUtils.getMunicipality(words, i, province);

      if (announcements[province] && municipality.length) {
        announcements[province]![municipality] ??= [];
        const addresses = collectStreetsAndBuildings(words, i, prevIdx);

        if (addresses.length) announcements[province]![municipality].push(...addresses);
        prevIdx = i;
      }
    } else if (booleanUtils.areVillages(word) || booleanUtils.areCities(word)) {
      const municipalities: string[] = municipalityUtils.getMunicipalities(words, i, province);
      if (announcements[province] && municipalities.length) {
        municipalities.forEach(municipality => announcements[province]![municipality] ??= []);
      }

      const result: string[] = [];
      const lefBetween: string[] = words.slice(i, prevIdx);
      const remainingText: string = stringCleaner.cleanUpAfterInitialProcessing(lefBetween);
      const restProcessedAddresses: string[] = stringCleaner.processRemainingText(remainingText);
      result.push(...restProcessedAddresses);

      if (announcements[province] && result.length) {
        announcements[province]![OTHER] ??= [];
        announcements[province]![OTHER].push(...result);
      }

      prevIdx = i;
    }
  };
}
