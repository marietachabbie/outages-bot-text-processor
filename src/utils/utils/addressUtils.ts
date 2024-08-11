import { TProvince } from "../../types/region";
import { RegionalData } from "../../types/regional-data";
import { booleanUtils } from "./booleanUtils";
import { municipalityUtils } from "./municipalityUtils";

export const addressUtils = {
  collectAddresses: (words: string[], province: TProvince, announcements: RegionalData) => {
    announcements[province] ??= {};
    let prevIdx: number = words.length + 1;
  
    for (let i = words.length - 1; i >= 0; i--) {
      const word = words[i].replace(',', '');
      if (booleanUtils.isVillage(word) || booleanUtils.isCity(word)) {
        const municipality: string = municipalityUtils.getMunicipality(words, i, province);
  
        if (announcements[province] && municipality.length) {
          announcements[province][municipality] ??= [];
          const addresses = addressUtils.collectStreetsAndBuildings(words, i, prevIdx);
  
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
  },

  collectStreetsAndBuildings: (words: string[], idx: number, nextIdx: number): string[] => {
    const addresses: string[] = [];
  
    const streetsAndBuildings = addressUtils.parseStreetsAndBuildings(words.slice(idx, nextIdx));
    if (streetsAndBuildings.length) addresses.push(...streetsAndBuildings);
  
    return addresses;
  },

  parseStreetsAndBuildings: (text: string[]): string[] => {
    const result: string[] = [];
  
    for (let i = 0; i < text.length; i++) {
      if (booleanUtils.shouldIgnore(text[i])) {
        continue;
      }
      // if (isPlural(text[i])) {
      //   if (areStreets(text[i])) {
  
      //   } else if (areDistricts(text[i])) {
  
      //   } else if (areHometowns(text[i], text[i - 1])) {
  
      //   } else if (areHouses(text[i])) {
  
      //   } else if (areBuildings(text[i])) {
  
      //   } else if (areOwners(text[i])) {
  
      //   } else if (isOwner(text[i])) {
  
      //   } else {
      //     console.log("🚀 ~ plural nobody's word:", text[i]);
      //   }
      // } else {
      //   if (isStreet(text[i])) {
  
      //   } else if (isDistrict(text[i])) {
  
      //   } else if (isHouse(text[i])) {
  
      //   } else if (isBuilding(text[i])) {
  
      //   } else {
      //     // attention
      //   }
      // }
    };
  
    return text;
  },
}