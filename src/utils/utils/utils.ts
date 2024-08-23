import { RegionalData, TempRegionalData } from "../../types/regional-data";
import { booleanUtils } from "./booleanUtils";
import { dateUtils } from "./dateUtils";
import { provinceUtils } from "./provinceUtils";

const buildAnnouncement = (text: string[], announcements: RegionalData) => {
  const tempRegionalData: TempRegionalData = {};
  provinceUtils.organiseByProvince(text, tempRegionalData)
  provinceUtils.processForProvince(tempRegionalData, announcements);
}

const generateStructuredAnnouncement = (text: string[]): RegionalData => {
  const res: RegionalData = {};
  const date: Date = dateUtils.getDate(text[0]);

  if (booleanUtils.isInFuture(date)) {
    buildAnnouncement(text, res);
  }

  return res;
}

export default {
  parseMessage: (text: string): RegionalData => {
    const splittedText = text.split("\n");
    const res: RegionalData = generateStructuredAnnouncement(splittedText);
    return res;
  }
}
