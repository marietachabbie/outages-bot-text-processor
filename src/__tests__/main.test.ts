import { describe, expect, it } from "@jest/globals";
import { TRegionalData } from "../types/types";
import utils from "../utils/utils/utils";
import * as fs from "fs";
import * as path from "path";

const inputText1 = fs.readFileSync(path.resolve(__dirname, "mock-inputs", "sample-1.txt"), "utf-8");
const expectedOutput1 = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "mock-outputs", "sample-1.json"), "utf-8"),
);

const inputText2 = fs.readFileSync(path.resolve(__dirname, "mock-inputs", "sample-2.txt"), "utf-8");
const expectedOutput2 = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "mock-outputs", "sample-2.json"), "utf-8"),
);

const inputText3 = fs.readFileSync(path.resolve(__dirname, "mock-inputs", "sample-3.txt"), "utf-8");

const saveFileLocally = (filename: string, data: TRegionalData) => {
  const outputDir = path.resolve(__dirname, "mock-results");
  fs.mkdirSync(outputDir, { recursive: true });

  fs.writeFileSync(path.resolve(outputDir, filename), JSON.stringify(data, null, 2));
};

describe("High-Level Unit Test: main (parseMessage)", () => {
  it("[1] produces the expected JSON output", () => {
    const parsedAnnouncement: TRegionalData = utils.parseMessage(inputText1);
    expect(parsedAnnouncement).toEqual(expectedOutput1);
  });

  it("[2] produces the expected JSON output", () => {
    const parsedAnnouncement: TRegionalData = utils.parseMessage(inputText2);
    expect(parsedAnnouncement).toEqual(expectedOutput2);
  });

  it("[3] produces the expected JSON output", () => {
    const parsedAnnouncement: TRegionalData = utils.parseMessage(inputText3);
    saveFileLocally("sample-3-result.json", parsedAnnouncement);
  });
});
