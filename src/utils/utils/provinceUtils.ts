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

    text.forEach((enhancedWord, i) => {
      const words: EnhancedStringArray =
        new EnhancedStringArray(enhancedWord.value.split(" "));
      words.forEach((word, j) => {
        const clean: string = stringCleaner.clearSuffixes(word);

        if (clean === YEREVAN || clean === PROVINCE) {
          if (clean === YEREVAN) province = TProvince[clean as keyof typeof TProvince];
          else if (clean === PROVINCE) province = getProvince(words.elements[j - 1]);
          text.set(i, '');
        }
      });

      if (province) {
        data[province] ??= [];
        if (text.elements[i].length) data[province]?.push(text.elements[i]);
      }
    });
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
