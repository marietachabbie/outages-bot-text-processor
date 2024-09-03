import {
  LOWERCASE_VILLAGE_NAMES,
  WORDS_TO_IGNORE,
  INFRASTRUCTURES,
} from "../constants/constants";

const {
  VILLAGE,
  VILLAGES,
  COMMUNITY,
  CITY,
  CITIES,
  DISTRICTS,
  AVENUE,
  STREET,
  STREETS,
  LANES,
  HOUSES,
  BUILDINGS,
  OWNERS,
  HOMETOWNS,
  KINDERGARTENS,
  SCHOOLS,
  NURSERY,
  PRIVATE,
} = INFRASTRUCTURES;

export class EnhancedString {
  private _value: string;

  constructor(value: string) {
    this._value = value;
  }

  get value(): string {
    return this._value;
  }

  get length(): number {
    return this._value.length;
  }

  set value(newValue: string) {
    this._value = newValue;
  }

  clean() {
    this._value = '';
  }

  add(char: string) {
    this._value += char;
  }

  replace(param1: RegExp | string, param2: string): EnhancedString {
    const newValue: string = this._value.replace(param1, param2);
    return new EnhancedString(newValue);
  }

  clearCommas(): EnhancedString {
    return this.replace(',', '');
  }

  getStreetType(): string {
    if (this.isAvenue()) return AVENUE;
    return STREET;
  }

  endsWithComma(): boolean {
    return this._value.endsWith(',');
  }

  isHourRange(): boolean {
    const regex = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/;
    return regex.test(this._value);
  }

  isPlural(): boolean {
    const word: string = this._value.replace(/[.,ը]/g, '');
    return word.endsWith("եր");
  }

  isEmpty(): boolean {
    return !this._value.length;
  }

  isLonelyWord(prev: EnhancedString, next: EnhancedString): boolean {
    if (this.startsWithLowercase()) {
      if (prev.isEmpty() && next.isEmpty()) return true;
      if (next.isEmpty() && prev.isConjunction()) return true;
      if (prev.isEmpty() && next.isConjunction()) return true;
    }

    return false;
  }

  isOrdinalNumber(): boolean {
    const ordinalNumbersRegex = /\d[-–](?:ին|րդ)/;
    return ordinalNumbersRegex.test(this._value);
  }

  isNumeric(): boolean {
    const numbersRegex = /^\d+$/;
    return numbersRegex.test(this._value);
  }

  isCity(): boolean {
    return this._value === CITY ||
      this._value === CITY + "ը" ||
      this._value === CITY + "ի" ||
      this._value === CITY + "ում";
  }

  isVillage(): boolean {
    return this._value === VILLAGE ||
      this._value === VILLAGE + "ը" ||
      this._value === VILLAGE + "ի" ||
      this._value === VILLAGE + "ում";
  }

  isCommunity(): boolean {
    return this._value === COMMUNITY ||
      this._value === COMMUNITY + "ը" ||
      this._value === COMMUNITY + "ի" ||
      this._value === COMMUNITY + "ում";
  }

  isConjunction(): boolean {
    return this._value === 'և' || this._value === 'եւ' || this._value === 'ու';
  }

  isPartOfVillageName(): boolean {
    return this.startsWithUppercase() || LOWERCASE_VILLAGE_NAMES.has(this._value);
  }

  isNurserySchool(): boolean {
    return this._value.includes(NURSERY);
  }

  isStreet(): boolean {
    const word: string = this._value.replace(/[.,ը]/g, '');
    return word === STREET || word === STREET.slice(0, 3) || word === STREET[0];
  }

  isAvenue(): boolean {
    const word: string = this._value.replace(/[.,ը]/g, '');
    return word === AVENUE || word === AVENUE.slice(0, 3) || word === AVENUE[0];
  }

  areVillages(): boolean {
    return this._value === VILLAGES ||
      this._value === VILLAGES + "ը" ||
      this._value === VILLAGES + "ի" ||
      this._value === VILLAGES + "ում";
  }

  areStreets(): boolean {
    return this._value.startsWith(STREETS);
  }

  areCities(): boolean {
    return this._value.startsWith(CITIES);
  }

  areDistricts(): boolean {
    return this._value.startsWith(DISTRICTS);
  }

  areHometowns(prev?: EnhancedString): boolean {
    const word: string = prev?._value.replace(/[.,ը]/, '') || '';
    const [ HOME, TOWNS ] = HOMETOWNS.split(' ');
    return (word === HOME || word === HOME.slice(0, 2)) && this._value === TOWNS;
  }

  areHouses(): boolean {
    return this._value.includes(HOUSES);
  }

  areBuildings(): boolean {
    return this._value.startsWith(BUILDINGS);
  }

  areOwners(): boolean {
    return this._value.toLowerCase().startsWith(OWNERS);
  }

  areKindergartens(): boolean {
    return this._value.includes(KINDERGARTENS);
  }

  areSchools(): boolean {
    return this._value.includes(SCHOOLS);
  }

  areLanes(): boolean {
    return this._value.startsWith(LANES);
  }

  arePrivateHouses(word?: EnhancedString): boolean {
    return this.areHouses() && word?.value === PRIVATE;
  }

  shouldIgnore(): boolean {
    return !this._value.length || WORDS_TO_IGNORE.has(this._value.replace(/[-:,ը]/g, '').trim());
  }

  startsWithUppercase(): boolean {
    return !!this._value && this._value[0] === this._value[0].toUpperCase();
  }

  startsWithLowercase(): boolean {
    return !!this._value && this._value[0] === this._value[0].toLowerCase();
  }

  startsWithQuote(): boolean {
    return this._value.startsWith('«');
  }

  endsWithQuote(): boolean {
    return this._value.endsWith('»');
  }

  doesNotContainNumbers(): boolean {
    return isNaN(parseInt(this._value));
  }

  doesContainNumbers(): boolean {
    const digitsRegex = /\d/;
    return digitsRegex.test(this._value);
  }

  didAddressEnd(): boolean {
    const punctuationRegex = /^[\p{P}\p{S}]$/u;
    return !this._value ||
      this._value.endsWith(':') ||
      this._value.endsWith(',') ||
      this.isConjunction() ||
      (
        !punctuationRegex.test(this._value[0]) &&
          this._value[0] === this._value[0].toLowerCase()
      );
  }

  collectNumericProperties(numbers: string[]) {
    const word: EnhancedString = this.clearCommas();
    if (word.doesContainNumbers()) {
      if (word.value.includes('-')) {
        const parts: string[] = word.value.split('-');
        if (parts.length === 2) {
          for (let i = parseInt(parts[0]); i <= parseInt(parts[1]); i++) {
            numbers.push(i.toString());
          }

          if (numbers[numbers.length - 1] !== parts[1]) numbers.push(parts[1]);
        }
      } else {
        numbers.push(word.value);
      }
    }
  }
}
