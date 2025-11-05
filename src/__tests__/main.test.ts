import { describe, expect } from "@jest/globals";
import { TRegionalData } from "../types/regional-data";
import utils from "../utils/utils/utils";
import * as fs from "fs";
import * as path from "path";

const inputText1 = fs.readFileSync(path.resolve(__dirname, "mock-inputs", "example1.txt"), "utf-8");
const expectedOutput1 = JSON.parse(fs.readFileSync(path.resolve(__dirname, "mock-results", "example1.json"), "utf-8"));

const inputText2 = fs.readFileSync(path.resolve(__dirname, "mock-inputs", "example2.txt"), "utf-8");
const expectedOutput2 = JSON.parse(fs.readFileSync(path.resolve(__dirname, "mock-results", "example2.json"), "utf-8"));

const saveFile = (filename: string, data: any) => {
  fs.writeFileSync(path.resolve(__dirname, "mock-results", filename), JSON.stringify(data, null, 2));
}

describe("High-Level Unit Test: main (parseMessage)", () => {
  it("[1] produces the expected JSON output", () => {
    const parsedAnnouncement: TRegionalData = utils.parseMessage(inputText1);
    expect(parsedAnnouncement).toEqual(expectedOutput1);
  });

  it("[2] produces the expected JSON output", () => {
    const parsedAnnouncement: TRegionalData = utils.parseMessage(inputText2);
    expect(parsedAnnouncement).toEqual(expectedOutput2);
  });
});
