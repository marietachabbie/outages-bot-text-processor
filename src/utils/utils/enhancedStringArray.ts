import { EnhancedString } from "./enhancedString";
import { TProvince } from "../../types/region";
import { TRegionalData } from "../../types/regional-data";
import { municipalityUtils } from "./municipalityUtils";
import { stringCleaner } from "./stringCleaner";
import { CONSTANT_WORDS } from "../constants/constants";

import { WORDS_TO_REMOVE, INFRASTRUCTURES } from "../constants/constants";

const { NUMBER, OTHER } = CONSTANT_WORDS;

const { NOT, RESIDENT, ACCOUNT_HOLDERS, AREAS } = WORDS_TO_REMOVE;

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
    return this[index] ?? new EnhancedString("");
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

  collectAddresses(province: TProvince, announcements: TRegionalData) {
    announcements[province] ??= {};
    let prevIdx: number = this.length + 1;

    for (let i = this.length - 1; i >= 0; i--) {
      const word = this.get(i).clearCommas();
      if (word.isVillage() || word.isCity() || word.isCommunity()) {
        const municipality: string = municipalityUtils.getMunicipality(
          this,
          i,
          province,
        );

        if (announcements[province] && municipality.length) {
          announcements[province]![municipality] ??= [];
          const addresses = this._collectStreetsAndBuildings(i, prevIdx);

          if (addresses.length)
            announcements[province]![municipality].push(...addresses);
          prevIdx = i;
        }
      } else if (word.areVillages() || word.areCities()) {
        const municipalities: string[] = municipalityUtils.getMunicipalities(
          this,
          i,
          province,
        );
        if (announcements[province] && municipalities.length) {
          municipalities.forEach(
            municipality => (announcements[province]![municipality] ??= []),
          );
        }

        const result: string[] = [];
        const lefBetween: EnhancedStringArray = this.slice(i, prevIdx);
        const remainingText: string =
          stringCleaner.cleanUpAfterInitialProcessing(lefBetween);
        const restProcessedAddresses: string[] =
          stringCleaner.processRemainingText(remainingText);
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

    const currWord: EnhancedString = this.get(idx).replace(/[-,]/g, "");
    const prevWord: EnhancedString =
      this.get(idx - 1)?.replace(/[-,]/g, "") || "";
    const nextWord: EnhancedString =
      this.get(idx + 1)?.replace(/[-,]/g, "") || "";
    const nextNextWord: EnhancedString =
      this.get(idx + 2)?.replace(/[-,]/g, "") || "";

    if (
      currWord.isConjunction() ||
      currWord.value === AREAS ||
      currWord.value === ACCOUNT_HOLDERS ||
      currWord.isLonelyWord(prevWord, nextWord)
    ) {
      return true;
    }

    if (currWord.value === NOT) {
      if (
        (nextWord.value === RESIDENT &&
          nextNextWord.value === ACCOUNT_HOLDERS) ||
        nextWord.value === RESIDENT + ACCOUNT_HOLDERS
      ) {
        return true;
      }
    }

    if (
      (currWord.value === RESIDENT && nextWord.value === ACCOUNT_HOLDERS) ||
      currWord.value === RESIDENT + ACCOUNT_HOLDERS
    ) {
      return true;
    }

    return false;
  }

  filterNotEmpties(): string[] {
    return this.elements.filter((str) => str.length);
  }

  filterNotHourRanges(): EnhancedStringArray {
    const result: string[] = [];
    for (let i = 0; i < this.length; i++) {
      const isHour: boolean = this.get(i).replace(/[։]/g, ":").isHourRange();
      if (!isHour) result.push(this.get(i).replace(/[`՝]/g, "").value);
    }

    return new EnhancedStringArray(result);
  }

  private _collectNamesAndNumbers(
    idx: number,
    result: string[],
    infrastructure: string,
  ): number {
    const currentName: string[] = [];
    const currentNumbers: string[] = [];
    const multipleNamesList: string[] = [];
    let nextIdx: number = -1;

    for (let i = idx -1; i >= 0; i--) {
      if (this.get(i).shouldIgnore() || this.get(i).isConjunction()) {
        continue;
      }

      const word: EnhancedString = this.get(i).replace(/[(),]/g, "");
      if (word.doesNotContainNumbers()) {
        if (word.startsWithUppercase() || word.value === NUMBER) {
          currentName.push(word.value);
          if (this.get(i - 1).didAddressEnd()) {
            const currentNameTemp = currentName.reverse().join(" ");
            if (currentNumbers.length) {
              currentNumbers.forEach(num => multipleNamesList.push(currentNameTemp + " " + num));
              currentName.length = 0;
              currentNumbers.length = 0;
            } else {
              multipleNamesList.push(currentNameTemp);
              currentName.length = 0;
            }
          }
        } else {
          nextIdx = i + 1;
          break;
        }
      } else {
        this.get(i).collectNumericProperties(currentNumbers);
      }
    }

    if (multipleNamesList.length) {
      if (nextIdx === -1) nextIdx = 0;
      multipleNamesList.forEach(name =>
        result.push(name + " " + infrastructure),
      );
    } else if (currentNumbers.length) {
      if (nextIdx === -1) nextIdx = 0;
      currentNumbers.forEach(num => result.push(num + " " + infrastructure));
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
        const nextIdx: number = this._collectNamesAndNumbers(
          i,
          result,
          infrastructure,
        );
        i = nextIdx + 1;
      }
    }
  }

  private _collectDualInfrastructures(
    result: string[],
    isRequiredInfrastructure: (
      this: EnhancedString,
      prev?: EnhancedString
    ) => boolean,
    infrastructure: string,
  ) {
    for (let i = this.length - 1; i >= 0; i--) {
      if (isRequiredInfrastructure.call(this.get(i), this.get(i - 1))) {
        const nextIdx: number = this._collectNamesAndNumbers(
          i - 1,
          result,
          infrastructure,
        );
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
      } else if (
        this.get(i).endsWithQuote() ||
        this.get(i - 1).startsWithQuote() ||
        this.get(i).isConjunction()
      ) {
        continue;
      } else {
        break;
      }
    }

    return start;
  }

  private _collectOwnerNames(
    start: number,
    end: number,
    result: string[],
  ): number[] {
    const ownerNames: string[] = [];
    const tempName: string[] = [];
    let firstIdx: number = -1;
    let lastIdx: number = -1;

    for (let i = start; i <= end; i++) {
      this.replaceOne(i, ",", "");
      if (this.get(i).isConjunction()) continue;

      if (this.get(i).startsWithQuote() && this.get(i).endsWithQuote()) {
        ownerNames.push(this.elements[i]);
        if (firstIdx === -1) firstIdx = i;
        lastIdx = i;
      } else if (this.get(i).startsWithQuote()) {
        tempName.push(this.elements[i]);
        if (firstIdx === -1) firstIdx = i;
      } else if (this.get(i).endsWithQuote()) {
        if (
          !this.get(i).endsWithComma() &&
          !this.get(i + 1).startsWithQuote() &&
          this.get(i + 1).startsWithUppercase() &&
          !this.get(i + 1).areOwners()
        ) {
          break;
        } else {
          tempName.push(this.elements[i]);
        }

        ownerNames.push(tempName.join(" "));
        lastIdx = Math.max(i, lastIdx);
        tempName.length = 0;
      } else if (this.get(i).startsWithUppercase()) {
        tempName.push(this.elements[i]);
      } else {
        break;
      }
    }

    ownerNames.forEach(name => result.push(name + " " + OWNER));
    return [ firstIdx, lastIdx ];
  }

  private _collectOwners(result: string[]) {
    this.forEach((enhancedWord, i) => {
      if (enhancedWord.areOwners()) {
        if (this.get(i - 1).didAddressEnd()) {
          const [ _firstIdx, lastIdx ] = this._collectOwnerNames(
            i + 1,
            this.length - 1,
            result,
          );
          if (lastIdx >= 0) stringCleaner.removeParsedWords(this, i, lastIdx);
        } else {
          const startIndex: number = this._getStartOfOwnersList(i);
          const [ firstIdx, _lastIdx ] = this._collectOwnerNames(
            startIndex,
            i - 1,
            result,
          );
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
          infrastructure = NURSERY + "-" + KINDERGARTEN;
        } else if (this.get(i - 1).isNurserySchool()) {
          idx = i - 1;
          this.get(i).clean();
          infrastructure = NURSERY + "-" + KINDERGARTEN;
        } else {
          idx = i;
          infrastructure = KINDERGARTEN;
        }

        const nextIdx: number = this._collectNamesAndNumbers(
          idx,
          result,
          infrastructure,
        );
        i = nextIdx + 1;
      }
    }
  }

  private _determineLanesAndStreetName(
    idx: number,
    tempLanes: string[],
    streetName: string[]
  ): [ boolean, number ] {
    let hasStreetName: boolean = false;
    let nextIdx: number = -1;

    for (let i = idx - 1; i >= 0; i--) {
      if (!this.get(i).endsWithComma()) {
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

    return [ hasStreetName, nextIdx ];
  }

  private _combineStreetAndLanes(
    tempLanes: string[],
    hasStreetName: boolean,
    streetName: string[],
    result: string[]
  ) {
    if (tempLanes.length) {
      if (hasStreetName && streetName.length) {
        const strName: string = streetName.reverse().join(" ");
        tempLanes.forEach(lane =>
          result.push(strName + " " + STREET + " " + lane + " " + LANE),
        );
      } else if (streetName.length) {
        const strName: string = streetName.reverse().join(" ");
        tempLanes.forEach(lane =>
          result.push(strName + " " + lane + " " + LANE),
        );
      } else {
        tempLanes.forEach(lane =>
          result.push(lane + " " + LANE),
        );
      }
    }
  }

  private _collectLanes(result: string[], idx: number): number {
    const tempLanes: string[] = [];
    const streetName: string[] = [];

    const [ hasStreetName, nextIdx ] = this._determineLanesAndStreetName(idx, tempLanes, streetName);
    this._combineStreetAndLanes(tempLanes, hasStreetName, streetName, result);

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
    this._collectInfrastructures(
      result,
      EnhancedString.prototype.areStreets,
      STREET,
    );

    this._collectInfrastructures(
      result,
      EnhancedString.prototype.areDistricts,
      DISTRICT,
    );

    this._collectDualInfrastructures(
      result,
      EnhancedString.prototype.areHometowns,
      HOMETOWN,
    );

    this._collectPluralKindergartens(result);

    this._collectInfrastructures(
      result,
      EnhancedString.prototype.areSchools,
      SCHOOL,
    );

    this._collectPluralLanes(result);

    this._collectOwners(result);
  }

  private _parseStreetName(idx: number, streetName: string[]) {
    let prevIdx: number = -1;

    for (let i = idx - 1; i >= 0; i--) {
      if (
        !this.get(i).endsWithComma() &&
        this.get(i).length &&
        !this.get(i).isConjunction()
      ) {
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
    this.replaceOne(idx, /[,:ը]/, "");
    if (this.get(idx).areBuildings()) {
      return BUILDING;
    } else if (this.get(idx).areHouses()) {
      if (this.get(idx).arePrivateHouses(this.get(idx - 1))) {
        return PRIVATE + " " + HOUSE;
      } else {
        return this.get(idx).replace(HOUSES, HOUSE).value;
      }
    }

    return "";
  }

  private _collectMultipleProperties(
    start: number,
    end: number,
    properties: string[],
  ) {
    const infrastructure: string = this._getInfrastructureType(end);
    const propNumbers: string[] = [];
    for (let i = start; i < end; i++) {
      if (!this.get(i).isConjunction()) {
        this.get(i).collectNumericProperties(propNumbers);
      }
    }

    propNumbers.forEach(num =>
      properties.push(num + " " + infrastructure),
    );
  }

  private _collectSingleProperty(
    start: number,
    end: number,
    properties: string[],
  ) {
    this.replaceOne(start, ",", "");
    const infrastructure: string = stringCleaner.clearSuffixes(this.get(end));

    if (this.get(start).doesContainNumbers()) {
      properties.push(this.elements[start] + " " + infrastructure);
    }
  }

  private _getWordAndNexIndices(idx: number): [number, number, boolean] {
    let nextIdx: number = -1;

    for (let i = idx + 1; i < this.length; i++) {
      if (this.get(i).shouldIgnore()) {
        continue;
      } else {
        if (this.get(i).clearCommas().doesNotContainNumbers()) {
          nextIdx = i;
          if (this.get(i).isPlural()) {
            return [i, nextIdx, true];
          } else {
            return [i, nextIdx, false];
          }
        }
      }
    }

    return [-1, nextIdx, false];
  }

  private _parseProperties(idx: number, properties: string[]): number {
    const [ wordIdx, nextIdx, isPlural ] = this._getWordAndNexIndices(idx);

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

        if (streetName.length > 1) {
          const street: string = streetName.reverse().join(" ");
          streetName.length = 0;
          if (properties.length) {
            properties.forEach((prop) => result.push(street + " " + prop));
            properties.length = 0;
          } else {
            result.push(street);
          }
        }

        if (nextIdx >= 0) i = nextIdx;
      }
    }
  }

  private _parseAddresses(): string[] {
    const result: string[] = [];

    this._parsePluralIndependents(result);
    this._parseStreetsAndProperties(result);

    const remainingText: string =
      stringCleaner.cleanUpAfterInitialProcessing(this);
    const remainingSingleAddresses: string = this._parseStreetWithoutWordStreet(
      remainingText,
      result,
    );

    const restProcessedAddresses: string[] = stringCleaner.processRemainingText(
      remainingSingleAddresses,
    );
    result.push(...restProcessedAddresses);

    return result;
  }

  private _collectStreetsAndBuildings(idx: number, nextIdx: number): string[] {
    const addresses: string[] = [];

    const streetsAndBuildings: string[] = this.slice(
      idx,
      nextIdx,
    )._parseAddresses();
    if (streetsAndBuildings.length) addresses.push(...streetsAndBuildings);

    return addresses;
  }

  private _getStartOfNumericProperties(): number {
    for (let i = 0; i < this.length; i++) {
      if (this.get(i).doesContainNumbers()) {
        return i;
      }
    }

    return 0;
  }

  private _generateEnhancedStringFromText(text: string): EnhancedStringArray {
    const splittedText: string[] = text.split(" ").filter((str) => str.length);
    return new EnhancedStringArray(splittedText);
  }

  private _collectPropertiesAndCleanUp(startIdx: number, properties: string[]) {
    for (let i = this.length - 1; i >= startIdx; i--) {
      if (
        this.get(i).areBuildings() ||
        this.get(i).areHouses()
      ) {
        this._collectMultipleProperties(startIdx, i, properties);
        stringCleaner.removeParsedWords(
          this,
          startIdx - properties.length,
          i,
        );
      }
    }
  }

  private _parseStreetWithoutWordStreet(
    text: string,
    result: string[],
  ): string {
    if (!text || text[0] === text[0].toLowerCase()) return text;

    const streetName: string[] = [];
    const properties: string[] = [];
    const enhancedText: EnhancedStringArray = this._generateEnhancedStringFromText(text);
    const startIdx: number = enhancedText._getStartOfNumericProperties();

    enhancedText.slice(0, startIdx + 2)._parseStreetName(startIdx, streetName);
    enhancedText._collectPropertiesAndCleanUp(startIdx, properties);

    properties.forEach(prop =>
      result.push(streetName + " " + prop),
    );

    const res: string[] = enhancedText.filterNotEmpties();
    return res.join(" ");
  }
}
