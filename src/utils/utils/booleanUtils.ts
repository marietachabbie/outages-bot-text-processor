import { LOWERCASE_VILLAGE_NAMES, WORDS_TO_IGNORE, INFRASTRUCTURES } from "../constants/constants";

const {
  VILLAGE,
  VILLAGES,
  COMMUNITY,
  CITY,
  CITIES,
  DISTRICT,
  DISTRICTS,
  STREET,
  STREETS,
  LANE,
  LANES,
  HOUSE,
  HOUSES,
  BUILDING,
  BUILDINGS,
  OWNER,
  OWNERS,
  HOMETOWNS,
  KINDERGARTEN,
  KINDERGARTENS,
  SCHOOL,
  SCHOOLS,
  NURSERY,
} = INFRASTRUCTURES;

export const booleanUtils = {
  isHourRange: (word: string): boolean => {
    const regex = /^\d{1,2}:\d{2}-\d{1,2}:\d{2}$/;
    return regex.test(word);
  },

  isOrdinalNumber: (word: string): boolean => {
    const ordinalNumbersRegex = /\d[-–](?:ին|րդ)/;
    return ordinalNumbersRegex.test(word);
  },

  isNumeric: (word: string): boolean => {
    const numbersRegex = /^\d+$/;
    return numbersRegex.test(word);
  },

  isInFuture: (date: Date): boolean => {
    const now: Date = new Date();
    return date >= now;
  },

  isCity: (word: string): boolean => {
    return word === CITY || word === CITY + "ը" || word === CITY + "ի" || word === CITY + "ում";
  },

  isVillage: (word: string): boolean => {
    return word === VILLAGE || word === VILLAGE + "ը" || word === VILLAGE + "ի" || word === VILLAGE + "ում";
  },

  isCommunity: (word: string): boolean => {
    return word === COMMUNITY || word === COMMUNITY + "ը" || word === COMMUNITY + "ի" || word === COMMUNITY + "ում";
  },

  isConjunction: (word: string): boolean => {
    return word === 'և' || word === 'եւ' || word === 'ու';
  },

  isPartOfVillageName: (word: string): boolean => {
    return booleanUtils.startsWithUppercase(word) || LOWERCASE_VILLAGE_NAMES.has(word);
  },

  isKindergarten: (word: string): boolean => {
    return word.includes(KINDERGARTEN);
  },

  isSchool: (word: string): boolean => {
    return word.includes(SCHOOL); // TODO
  },

  isNurserySchool: (word: string): boolean => {
    return word.includes(NURSERY);
  },

  isLane: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === LANE || word === LANE + "ի";
  },

  isStreet: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === STREET || word === STREET.slice(0, 3) || word === STREET[0];
  },

  isDistrict: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === DISTRICT || word === DISTRICT.slice(0, 3) || word === DISTRICT[0];
  },

  isHouse: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === HOUSE || word === HOUSE[0];
  },

  isBuilding: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === BUILDING || word === BUILDING[0];
  },

  isOwner: (word: string): boolean => {
    word = word.toLocaleLowerCase().replace(/[.,ը]/g, '');
    return word === OWNER;
  },

  areVillages: (word: string): boolean => {
    return word === VILLAGES || word === VILLAGES + "ը" || word === VILLAGES + "ի" || word === VILLAGES + "ում";
  },

  areStreets: (word: string): boolean => {
    return word.startsWith(STREETS);
  },

  areCities: (word: string): boolean => {
    return word.startsWith(CITIES);
  },

  areDistricts: (word: string): boolean => {
    return word.startsWith(DISTRICTS);
  },

  areHometowns: (word1: string, word2?: string): boolean => {
    word2 = word2?.replace(/[.,ը]/, '') || '';
    const [ HOME, TOWNS ] = HOMETOWNS.split(' ');
    return (word2 === HOME || word2 === HOME.slice(0, 2)) && word1 === TOWNS;
  },

  areHouses: (word: string): boolean => {
    return word.startsWith(HOUSES);
  },

  areBuildings: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word.startsWith(BUILDINGS);
  },

  areOwners: (word: string): boolean => {
    return word.toLocaleLowerCase().startsWith(OWNERS);
  },

  areKindergartens: (word: string): boolean => {
    return word.includes(KINDERGARTENS);
  },

  areSchools: (word: string): boolean => {
    return word.includes(SCHOOLS);
  },

  areLanes: (word: string): boolean => {
    return word.startsWith(LANES);
  },

  shouldIgnore: (word: string): boolean => {
    word = word.replace(/[-:,ը]/g, '').trim();
    return !(word.length) || WORDS_TO_IGNORE.has(word);
  },

  startsWithUppercase: (word: string): boolean => {
    return !!word && word[0] === word[0].toUpperCase();
  },

  startsWithQuote: (word: string): boolean => {
    return word.startsWith('«');
  },

  endsWithQuote: (word: string): boolean => {
    return word.endsWith('»');
  },

  doesNotContainNumbers: (word: string): boolean => {
    return isNaN(parseInt(word));
  },

  didPrevAddressEnd: (word: string): boolean => {
    const punctuationRegex = /^[\p{P}\p{S}]$/u;
    return !word || !word.length || word.endsWith(':') || word.endsWith(',') || booleanUtils.isConjunction(word) || (!punctuationRegex.test(word[0]) && word[0] === word[0].toLowerCase());
  },
};
