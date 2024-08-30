import { TRegionalData, TTempRegionalData } from "../../types/regional-data";
import { booleanUtils } from "./booleanUtils";
import { dateUtils } from "./dateUtils";
import { provinceUtils } from "./provinceUtils";

const buildAnnouncement = (text: string[], announcements: TRegionalData) => {
  const tempRegionalData: TTempRegionalData = {};
  provinceUtils.organiseByProvince(text, tempRegionalData);
  provinceUtils.processForProvince(tempRegionalData, announcements);
};

const generateStructuredAnnouncement = (text: string[]): TRegionalData => {
  const res: TRegionalData = {};
  const date: Date = dateUtils.getDate(text[0]);

  if (booleanUtils.isInFuture(date)) {
    buildAnnouncement(text, res);
  }

  return res;
};

export default {
  parseMessage: (text: string): TRegionalData => {
    const splittedText = text.split("\n");
    const res: TRegionalData = generateStructuredAnnouncement(splittedText);
    return res;
  },
};
