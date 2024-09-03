import { TRegionalData, TTempRegionalData } from "../../types/regional-data";
import { dateUtils } from "./dateUtils";
import { EnhancedStringArray } from "./enhancedStringArray";
import { provinceUtils } from "./provinceUtils";

const buildAnnouncement = (text: EnhancedStringArray, announcements: TRegionalData) => {
  const tempRegionalData: TTempRegionalData = {};
  provinceUtils.organiseByProvince(text, tempRegionalData);
  provinceUtils.processForProvince(tempRegionalData, announcements);
};

const generateStructuredAnnouncement = (text: EnhancedStringArray): TRegionalData => {
  const res: TRegionalData = {};
  const date: Date = dateUtils.getDate(text.get(0).value);

  if (dateUtils.isInFuture(date)) {
    buildAnnouncement(text, res);
  }

  return res;
};

export default {
  parseMessage: (text: string): TRegionalData => {
    const splittedText = new EnhancedStringArray(text.split("\n"));
    const res: TRegionalData = generateStructuredAnnouncement(splittedText);
    return res;
  },
};
