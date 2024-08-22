import { TProvince } from "../../types/region";
import { RegionalData, TempRegionalData } from "../../types/regional-data";
import { NoProvinceFoundError } from "../errors/errors";
import { stringCleaner } from "./stringCleaner";
import { collectAddresses } from "./addressUtils";
import { booleanUtils } from "./booleanUtils";

import { PROVINCES } from "../constants/constants";
const {
  PROVINCE,
  YEREVAN,
  LORI,
  VAYOTS,
  DZOR,
} = PROVINCES;

export const provinceUtils = {
  getProvince: (word: string): TProvince => {
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
    })
  },

  organiseByProvince: (text: string[], data: TempRegionalData) => {
    let province: TProvince | undefined;
  
    text.forEach(line => {
      const words: string[] = line.split(" ");
      words.forEach((word, i) => {
        word = stringCleaner.clearSuffixes(word);
  
        if (word === YEREVAN || word === PROVINCE) {
          if (word === YEREVAN) province = TProvince[word as keyof typeof TProvince];
          else if (word === PROVINCE) province = provinceUtils.getProvince(words[i - 1]);
          line = '';
        }
      })

      if (province) {
        data[province] ??= [];
        if (line.length) data[province]?.push(line);
      }
    })
  },

  processForProvince: (tempData: TempRegionalData, resData: RegionalData) => {
    for (const [province, text] of Object.entries(tempData)) {
      for (const line of text) {
        const words: string[] = line.split(" ")
        .filter(word => !(booleanUtils.isHourRange(word.replace('։', ':'))))
        .map(word => word.replace(/[`՝]/g, ''));
        collectAddresses(words, province as TProvince, resData);
      }
    }
  },
}
