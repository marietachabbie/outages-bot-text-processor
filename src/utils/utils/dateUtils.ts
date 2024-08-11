import { TMonth } from "../../types/month";
import { NoDateFoundError } from "../errors/errors";
import { stringCleaner } from "./stringCleaner";

export const dateUtils = {
  getDay: (word: string): number | undefined => {
    const numeric = word.match(/\d+/);
    return numeric ? parseInt(numeric[0]) : undefined;
  },

  getDate: (line: string): Date => {
    // TODO: take care of next year
    const text = line.split(" ");
    const year: number = new Date().getFullYear();
    let day: number | undefined;
    let month: number | undefined;
  
    for (let i = 0; i < text.length; i++) {
      const word = stringCleaner.clearPossessiveSuffix(text[i]);
  
      if (word in TMonth) {
        month = TMonth[word as keyof typeof TMonth];
        day = dateUtils.getDay(text[i + 1]);
        break;
      }
    }
  
    if (!day || !month) throw new NoDateFoundError({
      name: "NO_DATE_FOUND",
      message: "No valid date found",
    });
  
    return new Date(year, month, day, 0, 0, 0, 0)
  },  
}
