import { EnhancedString } from "./enhancedString";
import { TProvince } from "../../types/region";
import { TRegionalData } from "../../types/regional-data";
import { municipalityUtils } from "./municipalityUtils";
import { stringCleaner } from "./stringCleaner";
import { CONSTANT_WORDS } from "../constants/constants";

import {
  WORDS_TO_REMOVE,
  INFRASTRUCTURES,
} from "../constants/constants";

const {
  NUMBER,
  OTHER,
} = CONSTANT_WORDS;

const {
  NOT,
  RESIDENT,
  ACCOUNT_HOLDERS,
  AREAS,
} = WORDS_TO_REMOVE;

const {
  DISTRICT,
  STREET,
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

export class EnhancedStringArray extends Array<EnhancedString> {
  constructor(strings: string[]) {
    super(...strings.map(str => new EnhancedString(str)));
  }

  static get [Symbol.species]() {
    return Array;
  }

  get(index: number): EnhancedString {
    return this[index] ?? new EnhancedString('');
  }

  get length(): number {
    return this.length;
  }

  get elements(): string[] {
    return this.map(es => es.value);
  }

  set(index: number, value: string): void {
    if (this[index]) {
      this[index] = new EnhancedString(value);
    }
  }

  replaceOne(index: number, param1: RegExp | string, param2: string) {
    const newValue: EnhancedString = this.get(index).replace(param1, param2);
    this.set(index, newValue.value);
  }

  add(value: string): void {
    this.push(new EnhancedString(value));
  }

  slice(start: number, end: number): EnhancedStringArray {
    return new EnhancedStringArray(this.elements.slice(start, end));
  }

  collectAddresses(
    province: TProvince,
    announcements: TRegionalData,
  ) {
    announcements[province] ??= {};
    let prevIdx: number = this.length + 1;

    for (let i = this.length - 1; i >= 0; i--) {
      const word = this.get(i).clearCommas();
      if (word.isVillage() || word.isCity() || word.isCommunity()) {
        const municipality: string = municipalityUtils.getMunicipality(this, i, province);

        if (announcements[province] && municipality.length) {
          announcements[province]![municipality] ??= [];
          const addresses = this._collectStreetsAndBuildings(i, prevIdx);

          if (addresses.length) announcements[province]![municipality].push(...addresses);
          prevIdx = i;
        }
      } else if (word.areVillages() || word.areCities()) {
        const municipalities: string[] = municipalityUtils.getMunicipalities(this, i, province);
        if (announcements[province] && municipalities.length) {
          municipalities.forEach(municipality => announcements[province]![municipality] ??= []);
        }

        const result: string[] = [];
        const lefBetween: EnhancedStringArray = this.slice(i, prevIdx);
        const remainingText: string = stringCleaner
          .cleanUpAfterInitialProcessing(lefBetween);
        const restProcessedAddresses: string[] = stringCleaner.processRemainingText(remainingText);
        result.push(...restProcessedAddresses);

        if (announcements[province] && result.length) {
          announcements[province]![OTHER] ??= [];
          announcements[province]![OTHER].push(...result);
        }

        prevIdx = i;
      }
    }
  }

  shouldBeRemoved(idx: number): boolean {
    if (this[idx].shouldIgnore()) {
      return true;
    }

    const currWord: EnhancedString = this.get(idx).replace(/[-,]/g, '');
    const prevWord: EnhancedString = this.get(idx - 1)?.replace(/[-,]/g, '') || '';
    const nextWord: EnhancedString = this.get(idx + 1)?.replace(/[-,]/g, '') || '';
    const nextNextWord: EnhancedString = this.get(idx + 2)?.replace(/[-,]/g, '') || '';

    if (currWord.isConjunction()
      || currWord.value === AREAS
      || currWord.value === ACCOUNT_HOLDERS
      || currWord.isLonelyWord(prevWord, nextWord)) {
      return true;
    }

    if (currWord.value === NOT) {
      if (
        (
          nextWord.value === RESIDENT &&
          nextNextWord.value === ACCOUNT_HOLDERS
        ) || nextWord.value === RESIDENT + ACCOUNT_HOLDERS
      ) {
        return true;
      }
    }

    if (
      (
        currWord.value === RESIDENT && nextWord.value === ACCOUNT_HOLDERS
      ) || currWord.value === RESIDENT + ACCOUNT_HOLDERS
    ) {
      return true;
    }

    return false;
  }

  filterNotEmpties(): string[] {
    return this
      .elements
      .filter(str => str.length);
  }

  filterNotHourRanges(): EnhancedStringArray {
    const result: string[] = [];
    for (let i = 0; i < this.length; i++) {
      const isHour: boolean = this.get(i).replace(/[։]/g, ':').isHourRange();
      if (!isHour) result.push(this.get(i).replace(/[`՝]/g, '').value);
    }

    return new EnhancedStringArray(result);
  }

  private _collectNamesAndNumbers(
    idx: number,
    result: string[],
    infrastructure: string,
  ): number {
    const singleNameTemp: string[] = [];
    const singleNameListTemp: string[] = [];
    const multipleNameListTemp: string[] = [];
    const numericalNamesTemp: string[] = [];
    let numericsExist: boolean = false;
    let nextIdx: number = -1;

    for (let i = idx - 1; i >= 0; i--) {
      if (this.get(i).shouldIgnore() || this.get(i).isConjunction()) {
        continue;
      }

      const word: EnhancedString = this.get(i).replace(/[(),]/g, '');
      if (word.doesNotContainNumbers()) {
        if (word.startsWithUppercase() || word.value === NUMBER) {
          singleNameTemp.push(word.value);
          if (this.get(i - 1).didAddressEnd()) {
            if (numericsExist) {
              singleNameListTemp.push(singleNameTemp.reverse().join(' '));
              singleNameTemp.length = 0;
            } else {
              multipleNameListTemp.push(singleNameTemp.reverse().join(' '));
              singleNameTemp.length = 0;
            }
          }
        } else {
          nextIdx = i + 1;
          break;
        }
      } else {
        this.get(i).collectNumericProperties(numericalNamesTemp);
        if (numericalNamesTemp.length) numericsExist = true;
      }
    }

    let singleNameListStr: string = '';
    if (singleNameListTemp.length) {
      if (nextIdx === -1) nextIdx = 0;
      singleNameListStr = singleNameListTemp.join(' ') + ' ';
    }

    if (numericsExist) {
      if (nextIdx === -1) nextIdx = 0;
      numericalNamesTemp.forEach(num => result.push(singleNameListStr + num + ' ' + infrastructure));
    } else if (multipleNameListTemp.length) {
      if (nextIdx === -1) nextIdx = 0;
      multipleNameListTemp.forEach(name => result.push(name + ' ' + infrastructure));
    }

    if (nextIdx >= 0) stringCleaner.removeParsedWords(this, nextIdx, idx);
    return nextIdx;
  }

  private _collectInfrastructures(
    result: string[],
    isRequiredInfrastructure: (this: EnhancedString) => boolean,
    infrastructure: string,
  ) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (isRequiredInfrastructure.call(this.get(i))) {
        const nextIdx: number = this._collectNamesAndNumbers(i, result, infrastructure);
        i = nextIdx + 1;
      }
    }
  }

  private _collectBinarInfrastructures(
    result: string[],
    isRequiredInfrastructure: (this: EnhancedString, prev?: EnhancedString) => boolean,
    infrastructure: string,
  ) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (isRequiredInfrastructure.call(this.get(i), this.get(i - 1))) {
        const nextIdx: number = this._collectNamesAndNumbers(i - 1, result, infrastructure);
        stringCleaner.removeParsedWords(this, i, i);
        i = nextIdx + 1;
      }
    }
  }

  private _getStartOfOwnersList(idx: number): number {
    let start: number = 0;

    for (let i = idx - 1; i >= 0; i--) {
      if (this.get(i).startsWithQuote()) {
        start = i;
      } else if (this.get(i).endsWithQuote() || this.get(i - 1).startsWithQuote()) {
        continue;
      } else {
        break;
      }
    }

    return start;
  }

  private _collectOwnerNames (
    start: number,
    end: number,
    result: string[],
  ): number[] {
    const ownerNames: string[] = [];
    const tempName: string[] = [];
    let firstIdx: number = -1;
    let lastIdx: number = -1;

    for (let i = start; i <= end; i++) {
      this.replaceOne(i, ',', '');
      if (this.get(i).startsWithQuote() && this.get(i).endsWithQuote()) {
        ownerNames.push(this.elements[i]);
        if (firstIdx === -1) firstIdx = i;
        lastIdx = i;
      } else if (this.get(i).startsWithQuote()) {
        tempName.push(this.elements[i]);
        if (firstIdx === -1) firstIdx = i;
      } else if (this.get(i).endsWithQuote()) {
        if (!(this.get(i).endsWithComma()) &&
          !(this.get(i + 1).startsWithQuote()) &&
          this.get(i + 1).startsWithUppercase()
        ) {
          break;
        } else {
          tempName.push(this.elements[i]);
        }

        ownerNames.push(tempName.join(' '));
        lastIdx = Math.max(i, lastIdx);
        tempName.length = 0;
      } else if (this.get(i).startsWithUppercase()) {
        tempName.push(this.elements[i]);
      } else {
        break;
      }
    }

    for (const name of ownerNames) result.push(name + ' ' + OWNER);
    return [ firstIdx, lastIdx ];
  }

  private _collectOwners(result: string[]) {
    this.forEach((enhancedWord, i) => {
      if (enhancedWord.areOwners()) {
        if (this.get(i - 1).didAddressEnd()) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [ firstIdx, lastIdx ] = this._collectOwnerNames(i + 1, this.length - 1, result);
          if (lastIdx >= 0) stringCleaner.removeParsedWords(this, i, lastIdx);
        } else {
          const startIndex: number = this._getStartOfOwnersList(i);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const [ firstIdx, lastIdx ] = this._collectOwnerNames(startIndex, i - 1, result);
          if (firstIdx >= 0) stringCleaner.removeParsedWords(this, firstIdx, i);
        }
      }
    });
  }

  private _collectPluralKindergartens(result: string[]) {
    let idx: number = this.length - 1;
    let infrastructure: string = "";

    for (let i = this.length - 1; i >= 0; i--) {
      if (this.get(i).areKindergartens()) {
        if (this.get(i).isNurserySchool()) {
          idx = i;
          infrastructure = NURSERY + '-' + KINDERGARTEN;
        } else if (this.get(i - 1).isNurserySchool()) {
          idx = i - 1;
          this.get(i).clean();
          infrastructure = NURSERY + '-' + KINDERGARTEN;
        } else {
          idx = i;
          infrastructure = KINDERGARTEN;
        }

        const nextIdx: number = this._collectNamesAndNumbers(idx, result, infrastructure);
        i = nextIdx + 1;
      }
    }
  }

  private _collectLanes(result: string[], idx: number): number {
    // TODO: If there is a continuation to lane, need to not remove street and remove empty strings?
    const tempLanes: string[] = [];
    const streetName: string[] = [];
    let hasStreetName: boolean = false;
    let nextIdx: number = -1;

    for (let i = idx - 1; i >= 0; i--) {
      if (!(this.get(i).endsWithComma())) {
        if (this.get(i).isOrdinalNumber()) {
          if (hasStreetName) streetName.push(this.elements[i]);
          else tempLanes.push(this.elements[i]);
          nextIdx = i;
        } else if (this.get(i).isStreet()) {
          hasStreetName = true;
        } else if (this.get(i).startsWithUppercase()) {
          streetName.push(this.elements[i]);
          nextIdx = i;
        } else if (this.get(i).isNumeric()) {
          if (hasStreetName) streetName.push(this.elements[i]);
          else tempLanes.push(this.elements[i]);
          nextIdx = i;
        } else if (this.get(i).isConjunction()) {
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

    if (nextIdx >= 0) stringCleaner.removeParsedWords(this, nextIdx, idx);
    return nextIdx;
  }

  private _collectPluralLanes(result: string[]) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (this.get(i).areLanes()) {
        const nextIdx: number = this._collectLanes(result, i);
        i = nextIdx + 1;
      }
    }
  }

  private _parsePluralIndependents(result: string[]) {
    this._collectInfrastructures(result, EnhancedString.prototype.areStreets, STREET);
    this._collectInfrastructures(result, EnhancedString.prototype.areDistricts, DISTRICT);
    this._collectBinarInfrastructures(result, EnhancedString.prototype.areHometowns, HOMETOWN);
    this._collectPluralKindergartens(result);
    this._collectInfrastructures(result, EnhancedString.prototype.areSchools, SCHOOL);
    this._collectPluralLanes(result);
    this._collectOwners(result);
  }

  private _parseStreetName(idx: number, streetName: string[]) {
    let prevIdx: number = -1;

    for (let i = idx - 1; i >= 0; i--) {
      if (!(this.get(i).endsWithComma()) && this.get(i).length && !this.get(i).isConjunction()) {
        streetName.push(this.elements[i]);
        prevIdx = i;
      } else {
        prevIdx = i;
        break;
      }
    }

    if (prevIdx >= 0) stringCleaner.removeParsedWords(this, prevIdx + 1, idx);
  }

  private _getInfrastructureType(idx: number): string {
    this.replaceOne(idx, /[,:ը]/, '');
    let result: string = "";
    if (this.get(idx).areBuildings()) {
      result = BUILDING;
    } else if (this.get(idx).areHouses()) {
      if (this.get(idx).arePrivateHouses(this.get(idx - 1))) {
        result = PRIVATE + ' ' + HOUSE;
      } else {
        result = this.get(idx).replace(HOUSES, HOUSE).value;
      }
    }

    return result;
  }

  private _collectMultipleProperties(
    start: number,
    end: number,
    properties: string[],
  ) {
    const infrastructure: string = this._getInfrastructureType(end);
    const propNumbers: string[] = [];
    for (let i = start; i < end; i++) {
      if (!(this.get(i).isConjunction())) this.get(i).collectNumericProperties(propNumbers);
    }

    for (const num of propNumbers) properties.push(num + ' ' + infrastructure);
  }

  private _collectSingleProperty(
    start: number,
    end: number,
    properties: string[],
  ) {
    this.replaceOne(start, ',', '');
    const infrastructure: string = stringCleaner.clearSuffixes(this.get(end));

    if (this.get(start).doesContainNumbers()) {
      properties.push(this.elements[start] + ' ' + infrastructure);
    }
  }

  private _parseProperties(idx: number, properties: string[]): number {
    let nextIdx: number = -1;
    let wordIdx: number = -1;
    let isPlural: boolean = false;

    for (let i = idx + 1; i < this.length; i++) {
      if (this.get(i).shouldIgnore()) {
        continue;
      } else {
        if (this.get(i).clearCommas().doesNotContainNumbers()) {
          nextIdx = i;
          if (this.get(i).isPlural()) {
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
        this._collectSingleProperty(idx + 1, wordIdx, properties);
      } else {
        if (this.get(wordIdx).areBuildings() || this.get(wordIdx).areHouses()) {
          this._collectMultipleProperties(idx + 1, wordIdx, properties);
        }
      }
    }

    if (nextIdx >= 0) stringCleaner.removeParsedWords(this, idx, nextIdx);
    return nextIdx;
  }

  private _parseStreetsAndProperties(result: string[]) {
    const streetName: string[] = [];
    const properties: string[] = [];

    for (let i = 0; i < this.length; i++) {
      if (this.get(i).isStreet() || this.get(i).isAvenue()) {
        streetName.push(this.get(i).getStreetType());
        this._parseStreetName(i, streetName);
        const nextIdx: number = this._parseProperties(i, properties);

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

  private _parseAdresses(): string[] {
    const result: string[] = [];

    this._parsePluralIndependents(result);
    this._parseStreetsAndProperties(result);

    const remainingText: string = stringCleaner.cleanUpAfterInitialProcessing(this);
    const remainingSingleAddresses: string =
      this._parseStreetWithoutWordStreet(remainingText, result);

    const restProcessedAddresses: string[] = stringCleaner
      .processRemainingText(remainingSingleAddresses);
    result.push(...restProcessedAddresses);

    return result;
  }

  private _collectStreetsAndBuildings(idx: number, nextIdx: number): string[] {
    const addresses: string[] = [];

    const streetsAndBuildings: string[] = this.slice(idx, nextIdx)._parseAdresses();
    if (streetsAndBuildings.length) addresses.push(...streetsAndBuildings);

    return addresses;
  }

  private _parseStreetWithoutWordStreet(text: string, result: string[]): string {
    if (!text || text[0] === text[0].toLowerCase()) return text;

    const splittedText: string[] = text.split(' ').filter(str => str.length);
    const enhancedText: EnhancedStringArray = new EnhancedStringArray(splittedText);
    const streetName: string[] = [];
    const properties: string[] = [];
    let startIdx: number = 0;

    for (let i = 0; i < enhancedText.length; i++) {
      if (enhancedText.get(i).doesContainNumbers()) {
        startIdx = i;
        break;
      }
    }

    enhancedText.slice(0, startIdx + 2)._parseStreetName(startIdx, streetName);

    for (let i = enhancedText.length - 1; i >= startIdx; i--) {
      if (enhancedText.get(i).areBuildings() || enhancedText.get(i).areHouses()) {
        enhancedText._collectMultipleProperties(startIdx, i, properties);
        stringCleaner.removeParsedWords(enhancedText, startIdx - properties.length, i);
      }
    }

    for (const prop of properties) result.push(streetName + ' ' + prop);
    const res: string[] = enhancedText.filterNotEmpties();
    return res.join(' ');
  }
}
