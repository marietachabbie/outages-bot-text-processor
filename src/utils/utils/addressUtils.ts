import { TProvince } from "../../types/region";
import { RegionalData } from "../../types/regional-data";
import { booleanUtils } from "./booleanUtils";
import { municipalityUtils } from "./municipalityUtils";
import { stringCleaner } from "./stringCleaner";

const collectInfrastructureNames = (text: string[], idx: number, result: string[], infrastructure: string): number => {
  const tempName: string[] = [];
  const tempNumbers: number[] = [];
  let nextIdx: number = -1;

  for (let i = idx - 1; i >= 0; i--) {
    if (booleanUtils.shouldIgnore(text[i])) {
      nextIdx = i;
      if (tempNumbers.length) {
        for (const num of tempNumbers.reverse()) result.push(num + ' ' + infrastructure);
        break;
      } else {
        continue;
      };
    }

    text[i] = text[i].replace(/[(),]/g, '');
    if (booleanUtils.doesNotContainNumbers(text[i])) {
      if (booleanUtils.startsWithUppercase(text[i])) {
        if (booleanUtils.didPrevAddressEnd(text[i - 1])) {
          if (tempNumbers.length) {
            if (tempName.length) {
              const infraName: string = text[i] + ' ' + tempName.reverse().join(' ');
              for (const num of tempNumbers) result.push(infraName + ' ' + num + ' ' + infrastructure);
              tempName.length = 0;
            } else {
              for (const num of tempNumbers) result.push(text[i] + ' ' + num + ' ' + infrastructure);
            }
          } else {
            if (tempName.length) {
              result.push(text[i] + ' ' + tempName.reverse().join(' ') + ' ' + infrastructure);
              tempName.length = 0;
            } else {
              result.push(text[i] + ' ' + infrastructure);
            }
          }
        } else {
          tempName.push(text[i]);
        }
      } else if (booleanUtils.isConjunction(text[i])) {
        continue;
      } else {
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

  if (nextIdx >= 0) stringCleaner.removeParsedWords(text, nextIdx, idx);
  return nextIdx;
}

const collectInfrastructures = (text: string[], result: string[], isRequiredInfrastructure: Function, infrastructure: string) => {
  for (let i = text.length - 1; i >= 0; i--) {
    if (isRequiredInfrastructure(text[i])) {
      const nextIdx: number = collectInfrastructureNames(text, i, result, infrastructure);
      i = nextIdx + 1;
    }
  }
}

const collectBinarInfrastructures = (text: string[], result: string[], isRequiredInfrastructure: Function, infrastructure: string) => {
  for (let i = text.length - 1; i >= 0; i--) {
    if (isRequiredInfrastructure(text[i], text[i - 1])) {
      const nextIdx: number = collectInfrastructureNames(text, i - 1, result, infrastructure);
      i = nextIdx + 1;
    }
  }
}

const collectOwners = (text: string[], result: string[]) => {

}

const collectPluralKindergartens = (text: string[], result: string[]) => {
  const KINDERGARTEN: string = "մանկապարտեզ";
  const NURSERY: string = "մսուր";
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

      const nextIdx: number = collectInfrastructureNames(text, idx, result, infrastructure);
      i = nextIdx + 1;
    }
  }
}


}

const collectPluralEducationalFacilities = (text: string[], result: string[]) => {
  collectPluralKindergartens(text, result);
  collectPluralSchools(text, result);
}

const parsePluralIndependents = (text: string[], result: string[]) => {
  collectInfrastructures(text, result, booleanUtils.areStreets, "փողոց");
  collectInfrastructures(text, result, booleanUtils.areDistricts, "թաղամաս");
  collectBinarInfrastructures(text, result, booleanUtils.areHometowns, "տնակային ավան");
  collectPluralEducationalFacilities(text, result);
  collectOwners(text, result);
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

      prevIdx = i;
    }
  };
}
