import { LOWERCASE_VILLAGE_NAMES, WORDS_TO_IGNORE } from "../constants/constants";

export const booleanUtils = {
  inFuture: (date: Date): boolean => {
    const now: Date = new Date();
    return date >= now;
  },

  isCity: (word: string): boolean => {
    return word === "քաղաք" || word === "քաղաքը" || word === "քաղաքի" || word === "քաղաքում";
  },

  isVillage: (word: string): boolean => {
    return word === "գյուղ" || word === "գյուղը" || word === "գյուղի" || word === "գյուղում";
  },

  isCommunity: (word: string): boolean => {
    return word === "համայնք" || word === "համայնքը" || word === "համայնքի" || word === "համայնքում";
  },

  isConjunction: (word: string): boolean => {
    return word === 'և' || word === 'եւ' || word === 'ու';
  },

  isPartOfVillageName: (word: string): boolean => {
    return booleanUtils.startsWithUppercase(word) || LOWERCASE_VILLAGE_NAMES.has(word);
  },

  isKindergarten: (word: string): boolean => {
    return word.includes("մանկապարտեզ");
  },

  isSchool: (word: string): boolean => {
    return word.includes("դպրոց"); // TODO
  },

  isNurserySchool: (word: string): boolean => {
    return word.includes("մսուր");
  },

  isLane: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === "նրբանցք" || word === "նրբանցքի";
  },

  doesNotContainNumbers: (word: string): boolean => {
    return isNaN(parseInt(word));
  },

  didPrevAddressEnd: (word: string): boolean => {
    const punctuationRegex = /^[\p{P}\p{S}]$/u;
    return !word || !word.length || word.endsWith(':') || word.endsWith(',') || booleanUtils.isConjunction(word) || (!punctuationRegex.test(word[0]) && word[0] === word[0].toLowerCase());
  },

  isStreet: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === "փողոց" || word === "փող" || word === "փ";
  },

  isDistrict: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === "թաղամաս" || word === "թաղ" || word === "թ";
  },

  isHouse: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === "տուն" || word === "տ";
  },

  isBuilding: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === "շենք" || word === "շ";
  },

  isOwner: (word: string): boolean => {
    word = word.toLocaleLowerCase().replace(/[.,ը]/g, '');
    return word === "սեփականատեր";
  },

  areVillages: (word: string): boolean => {
    return word === "գյուղեր" || word === "գյուղերը" || word === "գյուղերի" || word === "գյուղերում";
  },

  areStreets: (word: string): boolean => {
    return word.startsWith("փողոցներ");
  },

  areCities: (word: string): boolean => {
    return word.startsWith("քաղաքներ");
  },

  areDistricts: (word: string): boolean => {
    return word.startsWith("թաղամասեր");
  },

  areHometowns: (word1: string, word2?: string): boolean => {
    word2 = word2?.replace(/[,ը]/, '') || '';
    return (word2 === "տնակային" || word2 === "տն.") && word1 === "ավաններ";
  },

  areHouses: (word: string): boolean => {
    return word.startsWith("տներ");
  },

  areBuildings: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word.startsWith("շենքեր");
  },

  areOwners: (word: string): boolean => {
    return word.toLocaleLowerCase().startsWith("սեփականատերեր");
  },

  areKindergartens: (word: string): boolean => {
    return word.includes("մանկապարտեզներ");
  },

  areSchools: (word: string): boolean => {
    return word.includes("դպրոցներ");
  },

  areLanes: (word: string): boolean => {
    return word.startsWith("նրբանցքներ");
  },

  shouldIgnore: (word: string): boolean => {
    word = word.replace(/[-:,ը]/g, '').trim();
    return !(word.length) || WORDS_TO_IGNORE.has(word);
  },

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

  startsWithUppercase: (word: string): boolean => {
    return !!word && word[0] === word[0].toUpperCase();
  },

  startsWithQuote: (word: string): boolean => {
    return word.startsWith('«');
  },

  endsWithQuote: (word: string): boolean => {
    return word.endsWith('»');
  },
};
