import { TMonth } from "../../types/month";
import { NoDateFoundError } from "../errors/errors";
import { stringCleaner } from "./stringCleaner";

export const dateUtils = {
  isInFuture: (date: Date): boolean => {
    const nowInUTC: Date = new Date();
    const nowInGMT4: Date = new Date(nowInUTC.getTime() + 4 * 60 * 60 * 1000);

    return date >= nowInGMT4;
  },

  getDay: (word: string): number | undefined => {
    const numeric = word.match(/\d+/);
    return numeric ? parseInt(numeric[0]) : undefined;
  },

  getDate: (lines: string[]): Date => {
    // TODO: take care of next year, for example, if announcement comes on dec for jan 
    const year: number = new Date().getFullYear();
    let day: number | undefined;
    let month: number | undefined;

    outer:
    for (const line of lines) {
      const text = line.split(" ");
      for (let [i, word] of text.entries()) {
        word = stringCleaner.clearPossessiveSuffix(word);
  
        if (word in TMonth) {
          month = TMonth[word as keyof typeof TMonth];
          day = dateUtils.getDay(text[i + 1]);
          break outer;
        }
      }
    }

    if (!day || !month) throw new NoDateFoundError();

    return new Date(Date.UTC(year, month, day, 23, 59, 0, 0));
  },
};
