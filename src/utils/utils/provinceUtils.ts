import { TProvince } from "../../types/region";
import { RegionalData, TempRegionalData } from "../../types/regional-data";
import { NoProvinceFoundError } from "../errors/errors";
import { stringCleaner } from "./stringCleaner";
import { addressUtils } from "./addressUtils";

export const provinceUtils = {
  getProvince: (word: string): TProvince => {
    let cleanWord: string = stringCleaner.clearPossessiveSuffix(word);
    if (cleanWord === "Լոռ") {
      cleanWord = "Լոռի";
    } else if (cleanWord === "Ձոր") {
      cleanWord = "Վայոց Ձոր";
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
  
        if (word === "Երևան" || word === "մարզ") {
          if (word === "Երևան") province = TProvince[word];
          else if (word === "մարզ") province = provinceUtils.getProvince(words[i - 1]);
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
        const words: string[] = line.split(" ").map(word => word.replace(/[`՝]/g, ''));
        addressUtils.collectAddresses(words, province as TProvince, resData);
      }
    }
  },
}
