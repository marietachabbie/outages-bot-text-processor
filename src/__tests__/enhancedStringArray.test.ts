import { describe, expect, test } from "@jest/globals";
import { TProvince } from "../types/region";
import { TRegionalData } from "../types/regional-data";
import { EnhancedString } from "../utils/utils/enhancedString";
import { EnhancedStringArray } from "../utils/utils/enhancedStringArray";

describe("EnhancedStringArray", () => {
  describe("public methods", () => {
    test("replaceOne replaces certain element of array", () => {
      const arr = new EnhancedStringArray([ "նրբանցք:" ]);
      const word = new EnhancedString("նրբանցք");

      arr.replaceOne(0, ':', '');
      expect(arr.get(0)).toStrictEqual(word);
    });

    test("add pushes element to array", () => {
      const arr = new EnhancedStringArray([ "Այգաբաց", "Արևիկ" ]);

      arr.add("Ջրառատ");
      expect(arr.elements).toStrictEqual([ "Այգաբաց", "Արևիկ", "Ջրառատ" ]);
    });

    test("shouldBeRemoved identifies if word should be removed", () => {
      const text = new EnhancedStringArray([
        "և",
        "",
        "բառ",
        "",
      ]);

      expect(text.shouldBeRemoved(0)).toBe(true);
      expect(text.shouldBeRemoved(2)).toBe(true);
    });

    test("shouldBeRemoved identifies not resident accounts to be removed", () => {
      const text = new EnhancedStringArray([
        "ոչ",
        "բնակիչ",
        "բաժանորդներ",
      ]);

      expect(text.shouldBeRemoved(0)).toBe(true);
    });

    test("filterNotEmpties filters not empty values", () => {
      const text = new EnhancedStringArray([ "", "", "բառ", "բառեր", "" ]);
      const output = [ "բառ", "բառեր" ];
      const cleared = text.filterNotEmpties();

      expect(cleared).toStrictEqual(output);
    });

    test("filterNotHourRanges filters words that are NOT hour range", () => {
      const text = new EnhancedStringArray([ "12:00-13:00", "բառ", "բառեր" ]);
      const output = new EnhancedStringArray([ "բառ", "բառեր" ]);
      const cleared = text.filterNotHourRanges();

      expect(cleared).toStrictEqual(output);
    });

    test("collectAddresses collects addresses for single village", () => {
      const text = new EnhancedStringArray([
        "Արարատ",
        "գյուղ",
        "«Արարատ",
        "կաթ»",
        "ՍՊԸ,",
        "«Սեդրակ",
        "Սարգսյան»",
        "ԱՁ",
        "և",
        "Զինմաս,",
      ]);

      const province = "Արարատ";
      const announcements: TRegionalData = {};
      const output: TRegionalData = {
        "Արարատ": {
          "Արարատ գյուղ": [ "«Արարատ կաթ» ՍՊԸ", "«Սեդրակ Սարգսյան» ԱՁ", "Զինմաս" ],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(output);
    });

    test("collectAddresses collects addresses for single city", () => {
      const text = new EnhancedStringArray([
        "Քաջարան",
        "քաղաք",
        "Գայի",
        "պող.",
        "1",
        "2",
        "շենքեր",
      ]);

      const province = "Սյունիք";
      const announcements: TRegionalData = {};
      const output: TRegionalData = {
        "Սյունիք": {
          "Քաջարան քաղաք": [ "Գայի պողոտա 1 շենք", "Գայի պողոտա 2 շենք" ],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(output);
    });

    test("collectAddresses collects addresses for multiple villages", () => {
      const text = new EnhancedStringArray([
        "Բարձրունի,",
        "Մարտիրոս,",
        "և",
        "Սերս",
        "գյուղեր",
      ]);

      const province = "Վայոց Ձոր";
      const announcements: TRegionalData = {};
      const output: TRegionalData = {
        "Վայոց Ձոր": {
          "Բարձրունի գյուղ": [],
          "Մարտիրոս գյուղ": [],
          "Սերս գյուղ": [],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(output);
    });

    test("collectAddresses collects addresses for multiple cities", () => {
      const text = new EnhancedStringArray([
        "Արմավիր,",
        "Էջմիածին,",
        "և",
        "Մեծամոր",
        "քաղաքներ",
      ]);

      const province = "Արմավիր";
      const announcements: TRegionalData = {};
      const output: TRegionalData = {
        "Արմավիր": {
          "Արմավիր քաղաք": [],
          "Էջմիածին քաղաք": [],
          "Մեծամոր քաղաք": [],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(output);
    });

    test("collectAddresses collects unidentified addresses in OTHER", () => {
      const text = new EnhancedStringArray([
        "Արմավիր,",
        "Էջմիածին,",
        "և",
        "Մեծամոր",
        "քաղաքներ",
        "«Մշո",
        "տղեք»",
        "ենթակայան",
        "և",
        "Գարեգին",
        "Ա",
        "փողոցի",
        "սկզբնամասի",
        "գազալցակայան,",
      ]);

      const province = "Արմավիր";
      const announcements: TRegionalData = {};
      const output: TRegionalData = {
        "Արմավիր": {
          "Արմավիր քաղաք": [],
          "Էջմիածին քաղաք": [],
          "Մեծամոր քաղաք": [],
          "Այլ": [
            "«Մշո տղեք» ենթակայան",
            "Գարեգին Ա փողոցի սկզբնամասի գազալցակայան",
          ],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(output);
    });
  });

  describe("private methods", () => {

  });
});
