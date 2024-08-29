import { booleanUtils } from "./booleanUtils";

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

  clearSuffixes: (word: string): string => {
    let clean: string = word.replace(/[`՝,]/g, '');
    if (clean.endsWith('ի')) {
      clean = clean.slice(0, -1);
    } else if (clean.endsWith('ում')) {
      clean = clean.slice(0, -3);
    } else if (clean.endsWith('ուղու')) {
      clean = clean.replace('ուղու', 'ուղի');
    }

    return clean;
  },

  clearPluralSuffix: (word: string): string => {
    let clean: string = word;
    if (clean.endsWith("ներ")) {
      clean = clean.slice(0, -3);
    } else if (clean.endsWith("եր")) {
      clean = clean.slice(0, -2);
    }

    return clean;
  },

  removeParsedWords: (words: string[], start: number, end: number) => {
    for (let i = start; i <= end; i++) words[i] = '';
  },

  clearCommas: (word: string): string => {
    return word.replace(',', '');
  },

  cleanUpAfterInitialProcessing: (text: string[]): string => {
    text.forEach((word, i) => {
      if (booleanUtils.shouldBeRemoved(text, i)) {
        if ((text[i].endsWith(',') || booleanUtils.isConjunction(text[i])) && !!text[i - 1] && !(text[i - 1].endsWith(','))) {
          text[i - 1] += ',';
        }

        stringCleaner.removeParsedWords(text, i, i);
      } else if (!(text[i + 1]) && !(text[i].endsWith(','))) {
        text[i] += ',';
      }
    });

    const res: string[] = text.filter(word => word.length);
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
