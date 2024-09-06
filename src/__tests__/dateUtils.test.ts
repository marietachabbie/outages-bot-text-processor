import { describe, expect, test } from "@jest/globals";
import { dateUtils } from "../utils/utils/dateUtils";
import { NoDateFoundError } from "../utils/errors/errors";

describe("Date utils", () => {
  test("isInFuture returns true when date is in future", () => {
    const date = new Date("12-06-2055");
    expect(dateUtils.isInFuture(date)).toBe(true);
  });

  test("isInFuture returns false when date is NOT in future", () => {
    const date = new Date("12-06-2015");
    expect(dateUtils.isInFuture(date)).toBe(false);
  });

  test("getDay retrieves day from string", () => {
    const word: string = "23-ին";
    expect(dateUtils.getDay(word)).toBe(23);
  });

  test("getDay returns undefined when no number is present in string", () => {
    const word: string = "test";
    expect(dateUtils.getDay(word)).toBe(undefined);
  });

  test("getDate throws NoDateFoundError when no date is found", () => {
    const text: string = "«Հայաստանի էլեկտրական ցանցեր» փակ բաժնետիրական " +
      "ընկերությունը տեղեկացնում է, որ պլանային նորոգման " +
      "աշխատանքներ իրականացնելու նպատակով ժամանակավորապես կդադարեցվի " +
      "հետևյալ հասցեների էլեկտրամատակարարումը`";

    expect(() => {
      dateUtils.getDate(text);
    }).toThrow(NoDateFoundError);
  });
});
