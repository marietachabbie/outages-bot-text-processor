import { TProvince } from "../../types/region";
import { RegionalData } from "../../types/regional-data";
import { booleanUtils } from "./booleanUtils";
import { municipalityUtils } from "./municipalityUtils";
import { stringCleaner } from "./stringCleaner";

const collectStreetNames = (text: string[], idx: number, result: string[]): number => {
  const STREET = " փողոց";
  const tempName: string[] = [];
  const tempNumbers: number[] = [];
  let nextIdx: number = -1;

  for (let i = idx - 1; i >= 0; i--) {
    if (booleanUtils.shouldIgnore(text[i])) {
      continue;
    }

    text[i] = text[i].replace(/[(),]/g, '');

    if (booleanUtils.doesNotContainNumbers(text[i])) {
      if (text[i][0] === text[i][0].toUpperCase()) {
        if (booleanUtils.didPrevAddressEnd(text[i - 1])) {
          if (tempNumbers.length) {
            if (tempName.length) {
              const streetName: string = text[i] + ' ' + tempName.reverse().join(' ');
              for (const num of tempNumbers) result.push(streetName + ' ' + num + STREET);
              tempName.length = 0;
            } else {
              for (const num of tempNumbers) result.push(text[i] + ' ' + num + STREET);
            }
          } else {
            if (tempName.length) {
              result.push(text[i] + ' ' + tempName.reverse().join(' ') + STREET);
              tempName.length = 0;
            } else {
              result.push(text[i] + STREET);
            }
          }
        } else {
          tempName.push(text[i]);
        }
      } else if (booleanUtils.isConjunction(text[i])) {
        continue;
      } else {
        nextIdx = i;
        break;
      }
    } else {
        const numbersRegex = /^\d+$/;
        if (numbersRegex.test(text[i])) {
          tempNumbers.push(parseInt(text[i]));
        } else {
          const parts: string[] = text[i].split('-');
          if (parts.length === 2 && numbersRegex.test(parts[0]) && numbersRegex.test(parts[1])) {
            for (let i = parseInt(parts[0]); i <= parseInt(parts[1]); i++) {
              tempNumbers.push(i);
            }
          }
        }
      }
  }

  if (nextIdx >= 0) stringCleaner.removeParsedWords(text, nextIdx + 1, idx);
  return nextIdx;
}

const collectStreets = (text: string[], result: string[]) => {
  for (let i = text.length - 1; i >= 0; i--) {
    if (booleanUtils.areStreets(text[i])) {
      const nextIdx: number = collectStreetNames(text, i, result);
      i = nextIdx + 1;
    }
  }
}

const collectDistricts = (text: string[], result: string[]) => {

}

const collectOwners = (text: string[], result: string[]) => {

}

const collectHometowns = (text: string[], result: string[]) => {

}

const collectEducationalFacilities = (text: string[], result: string[]) => {

}

const parsePluralIndependents = (text: string[], result: string[]) => {
  collectStreets(text, result);
  collectDistricts(text, result);
  collectOwners(text, result);
  collectHometowns(text, result);
  collectEducationalFacilities(text, result);
}

const parseIndependentLanes = (text: string[], result: string[]) => {
  text.forEach((word, i) => {
    if (!(booleanUtils.shouldIgnore(word))) {

    }
  })
}

const parseStreetsAndProperties = (text: string[], result: string[]) => {
  text.forEach((word, i) => {
    if (!(booleanUtils.shouldIgnore(word))) {

    }
  })
}

const parseEducationalFacilities = (text: string[], result: string[]) => {
  text.forEach((word, i) => {
    if (!(booleanUtils.shouldIgnore(word))) {

    }
  })
}

const parseAdresses = (text: string[]): string[] => {
  const result: string[] = [];

  parsePluralIndependents(text, result);
  parseIndependentLanes(text, result);
  parseStreetsAndProperties(text, result);
  parseEducationalFacilities(text, result);

  console.log("🚀 ~ text:", text);
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
        announcements[province][municipality] ??= [];
        const addresses = collectStreetsAndBuildings(words, i, prevIdx);

        if (addresses.length) announcements[province][municipality].push(...addresses);
        prevIdx = i;
      }
    } else if (booleanUtils.areVillages(word) || booleanUtils.areCities(word)) {
      const municipalities: string[] = municipalityUtils.getMunicipalities(words, i, province);
      if (announcements[province] && municipalities.length) {
        municipalities.forEach(municipality => announcements[province]![municipality] ??= []);
      }

      prevIdx = i;
    }
  };
}
