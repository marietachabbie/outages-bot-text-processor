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
}
