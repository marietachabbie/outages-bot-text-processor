import { SNSEvent, SNSHandler } from "aws-lambda";

import { RegionalData } from "./types/regional-data";
import utils from "./utils/utils";

export const handler: SNSHandler = async (event: SNSEvent) => {
  try {
    const snsMessage: string = event.Records[0].Sns.Message;
    const parsedAnnouncement: RegionalData = utils.parseMessage(snsMessage);
    // console.log("🚀 ~ parsedAnnouncement:", parsedAnnouncement);
  } catch (error) {
    console.error(error);
  }
};
