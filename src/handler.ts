import { SNSEvent, SNSHandler } from "aws-lambda";

import { TRegionalData } from "./types/types";
import utils from "./utils/utils/utils";

export const handler: SNSHandler = async (event: SNSEvent) => {
  try {
    const snsMessage: string = event.Records[0].Sns.Message;
    const _: TRegionalData = utils.parseMessage(snsMessage);
    // console.log("🚀 ~ parsedAnnouncement:", parsedAnnouncement);
  } catch (error) {
    console.error(error);
  }
};
