import { EnhancedString } from "./enhancedString";
import { EnhancedStringArray } from "./enhancedStringArray";

export const stringCleaner = {
  clearPossessiveSuffix: (word: string): string => {
    let clean = word.replace('-', '');
    if (clean.endsWith('ի')) {
      clean = clean.slice(0, -1);
    } else if (clean.endsWith('ու') || clean.endsWith('վա')) {
      clean = clean.slice(0, -2);
    }

    return clean;
  },

  clearSuffixes: (word: EnhancedString): string => {
    let clean: string = word.replace(/[`՝,]/g, '').value;
    if (clean.endsWith('ի')) {
      clean = clean.slice(0, -1);
    } else if (clean.endsWith('ում')) {
      clean = clean.slice(0, -3);
    } else if (clean.endsWith('ուղու')) {
      clean = clean.replace('ուղու', 'ուղի');
    }

    return clean;
  },

  clearPluralSuffix: (word: string): EnhancedString => {
    let clean: string = word;
    if (clean.endsWith("ներ")) {
      clean = clean.slice(0, -3);
    } else if (clean.endsWith("եր")) {
      clean = clean.slice(0, -2);
    }

    return new EnhancedString(clean);
  },

  removeParsedWords: (words: EnhancedStringArray, start: number, end: number) => {
    for (let i = start; i <= end; i++) words.get(i).clean();
  },

  cleanUpAfterInitialProcessing: (text: EnhancedStringArray): string => {
    for (let i = 0; i < text.length; i++) {
      if (text.get(i).isEmpty()) continue;

      if (text.shouldBeRemoved(i)) {
        if ((text.get(i).endsWithComma() ||
          text.get(i).isConjunction()) &&
          !!text.get(i - 1).value &&
          !(text.get(i - 1).endsWithComma())
        ) {
          text.get(i - 1).add(',');
        }

        stringCleaner.removeParsedWords(text, i, i);
      } else if (!(text.get(i + 1).value.length) && !(text.get(i).endsWithComma())) {
        text.get(i).add(',');
      }
    }

    const res: string[] = text.filterNotEmpties();
    return res.join(' ');
  },

  clearInvalidParenthesis: (text: string): string => {
    const opening: boolean = text.includes('(') ? true : false;
    const closing: boolean = text.includes(')') ? true : false;

    if (opening && !closing) return text.replace('(', '');
    if (!opening && closing) return text.replace(')', '');

    return text;
  },

  processRemainingText: (text: string): string[] => {
    if (!text) return [];

    const res: string[] = text.split(',').filter(str => str.length);
    res.forEach((chunk, i) => {
      const clean: string = stringCleaner.clearInvalidParenthesis(chunk);
      res[i] = clean.trim();
    });

    return res;
  },
};
