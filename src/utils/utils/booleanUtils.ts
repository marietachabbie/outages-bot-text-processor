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

  isConjunction: (word: string): boolean => {
    return word === 'և' || word === 'եւ' || word === 'ու';
  },

  isPartOfVillageName: (word: string): boolean => {
    return word[0] === word[0].toUpperCase() || LOWERCASE_VILLAGE_NAMES.has(word);
  },

  isNotNumeric: (word: string): boolean => {
    return isNaN(parseInt(word));
  },

  didPrevAddressEnd: (word: string): boolean => {
    return !word || word.endsWith(",") || booleanUtils.isConjunction(word) || !(booleanUtils.isNotNumeric(word));
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

  areVillages: (word: string): boolean => {
    return word === "գյուղեր" || word === "գյուղերը" || word === "գյուղերի" || word === "գյուղերում";
  },

  isBuilding: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === "շենք" || word === "շ";
  },

  isOwner: (word: string): boolean => {
    word = word.toLocaleLowerCase().replace(/[.,ը]/g, '');
    return word === "սեփականատեր";
  },

  areStreets: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === "փողոցներ";
  },

  areCities: (word: string): boolean => {
    return word === "քաղաքներ" || word === "քաղաքները" || word === "քաղաքները" || word === "քաղաքների" || word === "քաղաքներում";
  },

  areDistricts: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === "թաղամասեր";
  },

  areHometowns: (word1: string, word2: string): boolean => {
    word2 = word2.replace(/[,ը]/, '');
    return (word2 === "տնակային" || word2 === "տն.") && word1 === "ավաններ";
  },

  areHouses: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === "տներ";
  },

  areBuildings: (word: string): boolean => {
    word = word.replace(/[.,ը]/g, '');
    return word === "շենքեր";
  },

  areOwners: (word: string): boolean => {
    word = word.toLocaleLowerCase().replace(/[.,ը]/g, '');
    return word === "սեփականատերեր";
  },

  isPlural: (word: string): boolean => {
    word = word.replace(/[.,]/g, '');
    return word.endsWith("եր");
  },

  shouldIgnore: (word: string): boolean => {
    word = word.replace(/[-,ը]/g, '');
    return !(word.length) || WORDS_TO_IGNORE.has(word);
  },
};
