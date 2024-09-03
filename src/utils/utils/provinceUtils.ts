import { TProvince } from "../../types/region";
import { TRegionalData, TTempRegionalData } from "../../types/regional-data";
import { NoProvinceFoundError } from "../errors/errors";
import { stringCleaner } from "./stringCleaner";
import { PROVINCES } from "../constants/constants";
import { INFRASTRUCTURES } from "../constants/constants";
import { EnhancedStringArray } from "./enhancedStringArray";

const { CITY } = INFRASTRUCTURES;
const {
  PROVINCE,
  YEREVAN,
  LORI,
  VAYOTS,
  DZOR,
} = PROVINCES;

const getProvince = (word: string): TProvince => {
  let cleanWord: string = stringCleaner.clearPossessiveSuffix(word);
  if (cleanWord === LORI.slice(0, 3)) {
    cleanWord = LORI;
  } else if (cleanWord === DZOR) {
    cleanWord = VAYOTS + ' ' + DZOR;
  }

  if (cleanWord in TProvince) return TProvince[cleanWord as keyof typeof TProvince];

  throw new NoProvinceFoundError({
    name: "NO_PROVINCE_FOUND",
    message: "Failed to retrieve province",
  });
};

export const provinceUtils = {
  organiseByProvince: (text: EnhancedStringArray, data: TTempRegionalData) => {
    let province: TProvince | undefined;

    // TODO: forEach
    for (let i = 0; i < text.length; i++) {
      const words: EnhancedStringArray = new EnhancedStringArray(text.elements[i].split(" "));
      for (let j = 0; j < words.length; j++) {
        const word: string = stringCleaner.clearSuffixes(words.get(j));

        if (word === YEREVAN || word === PROVINCE) {
          if (word === YEREVAN) province = TProvince[word as keyof typeof TProvince];
          else if (word === PROVINCE) province = getProvince(words.elements[j - 1]);
          text.set(i, '');
        }
      }

      if (province) {
        data[province] ??= [];
        if (text.elements[i].length) data[province]?.push(text.elements[i]);
      }
    }
  },

  processForProvince: (tempData: TTempRegionalData, resData: TRegionalData) => {
    for (const [ province, text ] of Object.entries(tempData)) {
      for (let line of text) {
        if (province === YEREVAN) line = YEREVAN + ' ' + CITY + ' ' + line;

        const words: EnhancedStringArray = new EnhancedStringArray(line.split(' '))
          .filterNotHourRanges();
        words.collectAddresses(province as TProvince, resData);
      }
    }
  },
};
