import { TProvince } from "../../types/region";
import { booleanUtils } from "./booleanUtils";
import { stringCleaner } from "./stringCleaner";
import { CITIES, VILLAGES, COMMUNITIES } from "../constants/constants";

const getStartIndex = (words: string[], idx: number): number => {
  let start: number = idx - 1;
  for (let i = idx - 1; i >= idx - 3; i--) {
    if (words[i] && booleanUtils.doesNotContainNumbers(words[i])
      && !(words[i].endsWith(',')) && booleanUtils.isPartOfVillageName(words[i])) {
        start = i;
    } else break;
  }

  return start;
}

export const municipalityUtils = {
  getMunicipality: (words: string[], idx: number, province: TProvince): string => {
    let municipality: string = "";
    let temp: string = "";
    let start: number = getStartIndex(words, idx);

    temp = words.slice(start, idx).join(" ");
    words[idx] = stringCleaner.clearSuffixes(words[idx]);
    if (booleanUtils.isVillage(words[idx])) {
      if (VILLAGES[province].has(temp)) municipality = temp + " " + words[idx];
    } else if (booleanUtils.isCity(words[idx])) {
      if (CITIES[province].has(temp)) municipality = temp + " " + words[idx];
    } else if (booleanUtils.isCommunity(words[idx])) {
      if (COMMUNITIES[province].has(temp)) municipality = temp + " " + words[idx];
    }

    stringCleaner.removeParsedWords(words, start, idx);
    return municipality;
  },

  getMunicipalities: (words: string[], idx: number, province: TProvince): string[] => {
    const { tempMunicipalities, count } = municipalityUtils.collectTempMunicipalities(words, idx);
    const municipalities: string[] = [];
    if (tempMunicipalities.length) municipalityUtils.collectMunicipalities(tempMunicipalities, municipalities, province);

    stringCleaner.removeParsedWords(words, idx - count + 1, idx);
    return municipalities;
  },

  collectTempMunicipalities: (words: string[], idx: number): { tempMunicipalities: string[], count: number } => {
    const tempMunicipalities: string[] = [words[idx]];
    let temp: string = "";
    let count: number = 1;

    for (let i = idx - 1; i >= 0; i--) {
      words[i] = words[i].replace(',', '');
      if (booleanUtils.doesNotContainNumbers(words[i])) {
        if (booleanUtils.isPartOfVillageName(words[i])) {
          if (booleanUtils.didPrevAddressEnd(words[i - 1])) {
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
          if (booleanUtils.isConjunction(words[i])) {
            count++;
          }
          else break;
        }
      }
    }

    return { tempMunicipalities, count };
  },

  collectMunicipalities: (tempData: string[], result: string[], province: TProvince) => {
    const municipalityType: string = stringCleaner.clearPluralSuffix(stringCleaner.clearSuffixes(tempData[0]));

    for (let i = 1; i < tempData.length; i++) {
      tempData[i] = tempData[i].replace(',', '');
      if (booleanUtils.isVillage(municipalityType)) {
        if (VILLAGES[province].has(tempData[i])) result.push(tempData[i] + " " + municipalityType);
      } else if (booleanUtils.isCity(municipalityType)) {
        if (CITIES[province].has(tempData[i])) result.push(tempData[i] + " " + municipalityType);
      }
    }
  },
}
