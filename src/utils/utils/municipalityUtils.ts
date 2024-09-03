import { TProvince } from "../../types/region";
import { stringCleaner } from "./stringCleaner";
import { CITIES, VILLAGES, COMMUNITIES } from "../constants/constants";
import { EnhancedStringArray } from "./enhancedStringArray";
import { EnhancedString } from "./enhancedString";

const getStartIndex = (words: EnhancedStringArray, idx: number): number => {
  let start: number = idx - 1;
  for (let i = idx - 1; i >= idx - 3; i--) {
    if (!!words.get(i).value && words.get(i).doesNotContainNumbers()
      && !(words.get(i).endsWithComma()) && words.get(i).isPartOfVillageName()) {
      start = i;
    } else break;
  }

  return start;
};

const collectTempMunicipalities = (
  words: EnhancedStringArray,
  idx: number,
): { tempMunicipalities: EnhancedStringArray, count: number } => {
  const tempMunicipalities: EnhancedStringArray = new EnhancedStringArray([ words.get(idx).value ]);
  let temp: string = "";
  let count: number = 1;

  for (let i = idx - 1; i >= 0; i--) {
    words.set(i, words.get(i).clearCommas().value);
    if (words.get(i).doesNotContainNumbers()) {
      if (words.get(i).isPartOfVillageName()) {
        if (words.get(i - 1).didAddressEnd()) {
          if (temp.length) {
            tempMunicipalities.add(words.get(i).value + " " + temp);
            count += 2;
            temp = "";
          } else {
            tempMunicipalities.add(words.get(i).value);
            count++;
          }
        } else {
          if (temp.length) temp = words.get(i).value + " " + temp;
          else temp = words.get(i).value;
        }
      } else {
        if (words.get(i).isConjunction()) {
          count++;
        } else break;
      }
    }
  }

  return { tempMunicipalities, count };
};

const collectMunicipalities = (
  tempData: EnhancedStringArray,
  result: string[],
  province: TProvince,
) => {
  const municipalityType: EnhancedString = stringCleaner
    .clearPluralSuffix(stringCleaner.clearSuffixes(tempData.get(0)));

  for (let i = 1; i < tempData.length; i++) {
    tempData.set(i, tempData.get(i).clearCommas().value);
    if (municipalityType.isVillage()) {
      if (VILLAGES[province].has(tempData.get(i).value)) {
        result.push(tempData.get(i).value + " " + municipalityType.value);
      }
    } else if (municipalityType.isCity()) {
      if (CITIES[province].has(tempData.get(i).value)) {
        result.push(tempData.get(i).value + " " + municipalityType.value);
      }
    }
  }
};

export const municipalityUtils = {
  getMunicipality: (words: EnhancedStringArray, idx: number, province: TProvince): string => {
    let municipality: string = "";
    let temp: string = "";
    const start: number = getStartIndex(words, idx);

    temp = words.slice(start, idx).elements.join(" ");
    words.set(idx, stringCleaner.clearSuffixes(words.get(idx)));

    if (words.get(idx).isVillage()) {
      if (VILLAGES[province].has(temp)) municipality = temp + " " + words.get(idx).value;
    } else if (words.get(idx).isCity()) {
      if (CITIES[province].has(temp)) municipality = temp + " " + words.get(idx).value;
    } else if (words.get(idx).isCommunity()) {
      if (COMMUNITIES[province].has(temp)) municipality = temp + " " + words.get(idx).value;
    }

    stringCleaner.removeParsedWords(words, start, idx);
    return municipality;
  },

  getMunicipalities: (words: EnhancedStringArray, idx: number, province: TProvince): string[] => {
    const { tempMunicipalities, count } = collectTempMunicipalities(words, idx);
    const municipalities: string[] = [];
    if (tempMunicipalities.length) {
      collectMunicipalities(tempMunicipalities, municipalities, province);
    }

    stringCleaner.removeParsedWords(words, idx - count + 1, idx);
    return municipalities;
  },
};
