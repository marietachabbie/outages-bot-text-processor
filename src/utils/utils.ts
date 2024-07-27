import { Month } from "../types/month";
import { RegionalData } from "../types/regional-data";

import { NoDateFounError } from "./errors/errors";

const clearPossessiveSuffix = (word: string): string => {
  let clean = word.replace('-', '');
  if (clean.endsWith('ի')) {
    clean = clean.slice(0, -1);
  } else if (clean.endsWith('ու') || clean.endsWith('վա')) {
    clean = clean.slice(0, -2)
  }

  return clean;
}

const getDay = (word: string): number | undefined => {
  const numeric = word.match(/\d+/);
  return numeric ? parseInt(numeric[0]) : undefined;
}

const getDate = (text: string[]): Date => {
  // TODO: take care of next year
  const year: number = new Date().getFullYear();
  let day: number | undefined;
  let month: number | undefined;

  for (let i = 0; i < text.length; i++) {
    const word = clearPossessiveSuffix(text[i]);

    if (word in Month) {
      month = Month[word as keyof typeof Month];
      day = getDay(text[i + 1]);
      break;
    }
  }

  if (!day || !month) throw new NoDateFounError({
    name: "NO_DATE_FOUND_ERROR",
    message: "No valid date found",
  });

  return new Date(year, month, day, 0, 0, 0, 0)
}

const inFuture = (date: Date): boolean => {
  const now: Date = new Date();
  return date >= now;
}

const buildAnnouncement = (text: string[], announcements: RegionalData) => {

}

const generateStructuredAnnouncement = (text: string[]): RegionalData => {
  const res: RegionalData = {};
  const date: Date = getDate(text);

  if (inFuture(date)) {
    buildAnnouncement(text, res);
  }

  return res;
}

export default {
  parseMessage: (text: string): RegionalData => {
    const splittedText = text.split(" ");
    const res: RegionalData = generateStructuredAnnouncement(splittedText);
    return res;
  }
}
