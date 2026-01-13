import { LOWERCASE_VILLAGE_NAMES, WORDS_TO_IGNORE, INFRASTRUCTURES } from "../constants/constants";

const {
  VILLAGE,
  VILLAGES,
  COMMUNITY,
  CITY,
  CITIES,
  DISTRICT,
  IE,
  AVENUE,
  STREET,
  STREETS,
  LANE,
  LANES,
  BLIND_ALLEY,
  HOUSE,
  HOUSES,
  BUILDING,
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
    this._value = "";
  }

  add(char: string) {
    this._value += char;
  }

  replace(param1: RegExp | string, param2: string): EnhancedString {
    if (param1 instanceof RegExp) {
      // Ensure the RegExp has the global flag for replaceAll
      const globalRegex = param1.global ? param1 : new RegExp(param1.source, param1.flags + "g");
      const newValue: string = this._value.replaceAll(globalRegex, param2);
      return new EnhancedString(newValue);
    } else {
      const newValue: string = this._value.replaceAll(param1, param2);
      return new EnhancedString(newValue);
    }
  }

  clearCommas(): EnhancedString {
    return this.replace(/[,․.:]/g, "");
  }

  getStreetType(): string {
    if (this.isAvenue()) return AVENUE;
    return STREET;
  }

  endsWithComma(): boolean {
    return this._value.endsWith(",");
  }

  isHourRange(): boolean {
    const regex = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/;
    return regex.test(this._value);
  }

  isPlural(): boolean {
    const word: string = this._value.replace(/[.,ը]/g, "");
    return word.endsWith("եր");
  }

  isEmpty(): boolean {
    return !this._value.length;
  }

  isLonelyWord(prev?: EnhancedString, next?: EnhancedString): boolean {
    if (this.startsWithLowercase()) {
      if ((!prev || prev.isEmpty()) && (!next || next.isEmpty())) return true;
      if ((!next || next.isEmpty()) && prev!.isConjunction()) return true;
      if ((!prev || prev.isEmpty()) && next!.isConjunction()) return true;
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
    return (
      this._value === CITY ||
      this._value === CITY + "ը" ||
      this._value === CITY + "ի" ||
      this._value === CITY + "ում"
    );
  }

  isVillage(): boolean {
    return (
      this._value === VILLAGE ||
      this._value === VILLAGE + "ը" ||
      this._value === VILLAGE + "ի" ||
      this._value === VILLAGE + "ում"
    );
  }

  isCommunity(): boolean {
    return (
      this._value === COMMUNITY ||
      this._value === COMMUNITY + "ը" ||
      this._value === COMMUNITY + "ի" ||
      this._value === COMMUNITY + "ում"
    );
  }

  isConjunction(): boolean {
    return this._value === "և" || this._value === "եւ" || this._value === "ու";
  }

  isPartOfVillageName(): boolean {
    return this.startsWithUppercase() || LOWERCASE_VILLAGE_NAMES.has(this._value);
  }

  isNurserySchool(): boolean {
    return this._value.includes(NURSERY);
  }

  isStreet(): boolean {
    const word: string = this._value.replace(/[.․,ի,ը]/g, "");
    return word === STREET || word === STREET.slice(0, 3) || word === STREET[0];
  }

  isAvenue(): boolean {
    const word: string = this._value.replace(/[.․,ն]/g, "");
    return word === AVENUE || word === AVENUE.slice(0, 3) || word === AVENUE[0];
  }

  isDistrict(): boolean {
    const word: string = this._value.replace(/[.․,ն]/g, "");
    return word === DISTRICT || word === DISTRICT.slice(0, 3) || word === DISTRICT[0];
  }

  isIE(): boolean {
    return this._value === IE;
  }

  isHouse(): boolean {
    return this._value.includes(HOUSE);
  }

  isBuilding(): boolean {
    return this._value.startsWith(BUILDING);
  }

  isLane(): boolean {
    return this._value.startsWith(LANE);
  }

  isBlindAlley(): boolean {
    return this._value.startsWith(BLIND_ALLEY);
  }

  areVillages(): boolean {
    return (
      this._value === VILLAGES ||
      this._value === VILLAGES + "ը" ||
      this._value === VILLAGES + "ի" ||
      this._value === VILLAGES + "ում"
    );
  }

  areStreets(): boolean {
    return this._value.startsWith(STREETS);
  }

  areCities(): boolean {
    return this._value.startsWith(CITIES);
  }

  areDistricts(): boolean {
    const cleanedWord: string = this._value.replace(/[.,ը]/g, "");
    return cleanedWord.startsWith(DISTRICT) && cleanedWord.includes("եր");
  }

  areHometowns(prev?: EnhancedString): boolean {
    const word: string = prev?._value.replace(/[.,ը]/, "") || "";
    const [ HOME, TOWNS ] = HOMETOWNS.split(" ");
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

  areOrgs(type: string): boolean {
    return this._value.replace(",", "").endsWith("ներ") && this._value.startsWith(type);
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

  arePrivateHouses(prev?: EnhancedString): boolean {
    return this.areHouses() && prev?.value === PRIVATE;
  }

  shouldIgnore(): boolean {
    return !this._value.length || WORDS_TO_IGNORE.has(this._value.replace(/[-:,ը]/g, "").trim());
  }

  startsWithUppercase(): boolean {
    return !!this._value && this._value[0] === this._value[0].toUpperCase() && !this.isNumeric();
  }

  startsWithLowercase(): boolean {
    return (
      !!this._value && this._value[0] === this._value[0].toLowerCase() && !this.startsWithQuote()
    );
  }

  startsWithQuote(): boolean {
    return this._value.startsWith("«");
  }

  endsWithQuote(): boolean {
    return this._value.endsWith("»");
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
    return (
      !this._value ||
      this._value.endsWith(":") ||
      this._value.endsWith(",") ||
      this.isConjunction() ||
      (!punctuationRegex.test(this._value[0]) &&
        this.startsWithLowercase() &&
        !this.isStreet() &&
        !this.isAvenue() &&
        !this.isDistrict())
    );
  }

  collectNumericProperties(numbers: string[]) {
    const word: EnhancedString = this.clearCommas();
    if (word.value.includes("-")) {
      if (word.isOrdinalNumber()) {
        numbers.push(word.value);
        return;
      }

      const parts: string[] = word.value.split("-");
      if (parts.length === 2) {
        if (parts[0].includes("/")) {
          numbers.push(parts[0]);
        }

        if (parts[1].includes("/")) {
          numbers.push(parts[1]);
        }

        for (let i = parseInt(parts[0]); i <= parseInt(parts[1]); i++) {
          numbers.push(i.toString());
        }
      }
    } else if (word.value !== PRIVATE) {
      numbers.push(word.value);
    }
  }
}
