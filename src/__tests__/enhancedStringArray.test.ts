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

      arr.replaceOne(0, ":", "");
      expect(arr.get(0)).toStrictEqual(word);
    });

    test("add pushes element to array", () => {
      const arr = new EnhancedStringArray([ "Այգաբաց", "Արևիկ" ]);

      arr.add("Ջրառատ");
      expect(arr.elements).toStrictEqual([ "Այգաբաց", "Արևիկ", "Ջրառատ" ]);
    });

    test("shouldBeRemoved identifies if word should be removed", () => {
      const text = new EnhancedStringArray([ "և", "", "բառ", "" ]);

      expect(text.shouldBeRemoved(0)).toBe(true);
      expect(text.shouldBeRemoved(2)).toBe(true);
    });

    test("shouldBeRemoved identifies not resident accounts to be removed", () => {
      const text = new EnhancedStringArray([ "ոչ", "բնակիչ", "բաժանորդներ" ]);

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
        Արարատ: {
          "Արարատ գյուղ": [
            "«Արարատ կաթ» ՍՊԸ",
            "«Սեդրակ Սարգսյան» ԱՁ",
            "Զինմաս",
          ],
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
        Սյունիք: {
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
        Արմավիր: {
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
        Արմավիր: {
          "Արմավիր քաղաք": [],
          "Էջմիածին քաղաք": [],
          "Մեծամոր քաղաք": [],
          Այլ: [
            "«Մշո տղեք» ենթակայան",
            "Գարեգին Ա փողոցի սկզբնամասի գազալցակայան",
          ],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(output);
    });
  });


    test("_collectInfrastructures collects non-numerical names for plural infrastructures", () => {
      const text = new EnhancedStringArray([
        "Մայակ,",
        "Բանավան",
        "և",
        "Բագրևանդ",
        "թաղամասեր,",
      ]);

      const result: string[] = [];
      const output: string[] = [
        "Բագրևանդ թաղամաս",
        "Բանավան թաղամաս",
        "Մայակ թաղամաս",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectInfrastructures(
        result,
        EnhancedString.prototype.areDistricts,
        "թաղամաս",
      );
      const allEmpty = text.every(word => word.isEmpty());

      expect(result).toStrictEqual(output);
      expect(allEmpty).toBe(true);
    });

    test("_collectInfrastructures collects numerical names for schools", () => {
      const text = new EnhancedStringArray([
        "թիվ",
        "122",
        "և",
        "123",
        "դպրոցներ,",
      ]);

      const result: string[] = [];
      const output: string[] = [ "թիվ 123 դպրոց", "թիվ 122 դպրոց" ];

      // @ts-expect-error: Force access to the private method
      text._collectInfrastructures(
        result,
        EnhancedString.prototype.areSchools,
        "դպրոց",
      );
      const allEmpty = text.every((word) => word.isEmpty());

      expect(result).toStrictEqual(output);
      expect(allEmpty).toBe(true);
    });

    test("_collectDualInfrastructures collects valid hometowns", () => {
      const text = new EnhancedStringArray([
        "142,",
        "153,",
        "154",
        "տնակային",
        "ավաններ",
      ]);

      const result: string[] = [];
      const output: string[] = [
        "154 տնակային ավան",
        "153 տնակային ավան",
        "142 տնակային ավան",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectDualInfrastructures(
        result,
        EnhancedString.prototype.areHometowns,
        "տնակային ավան",
      );
      const allEmpty = text.every((word) => word.isEmpty());

      expect(result).toStrictEqual(output);
      expect(allEmpty).toBe(true);
    });

    test("_collectPluralKindergartens collects numerical names for kindergartens", () => {
      const text = new EnhancedStringArray([
        "թիվ",
        "153",
        "և",
        "154",
        "մսուր",
        "մանկապարտեզներ",
      ]);

      const result: string[] = [];
      const output: string[] = [
        "թիվ 154 մսուր-մանկապարտեզ",
        "թիվ 153 մսուր-մանկապարտեզ",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectPluralKindergartens(result);
      const allEmpty = text.every(word => word.isEmpty());

      expect(result).toStrictEqual(output);
      expect(allEmpty).toBe(true);
    });

    test("_collectPluralLanes collects numerical plural lanes", () => {
      const text = new EnhancedStringArray([
        "Նորագավիթ",
        "1",
        "փողոց",
        "1-ին",
        "և",
        "2–րդ",
        "նրբանցքների",
      ]);

      const result: string[] = [];
      const output: string[] = [
        "Նորագավիթ 1 փողոց 2–րդ նրբանցք",
        "Նորագավիթ 1 փողոց 1-ին նրբանցք",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectPluralLanes(result);
      const allEmpty = text.every(word => word.isEmpty());

      expect(result).toStrictEqual(output);
      expect(allEmpty).toBe(true);
    });

    test("_collectOwners collects plural owners listed AFTER word <owner>", () => {
      const text = new EnhancedStringArray([
        "Սեփականատերեր",
        "«Վ․Սահակյան»,",
        "«Լիլիթ",
        "Սահակյան»,",
        "«Գայանե",
        "Պողոսյան»",
      ]);

      const result: string[] = [];
      const output: string[] = [
        "«Վ․Սահակյան» սեփականատեր",
        "«Լիլիթ Սահակյան» սեփականատեր",
        "«Գայանե Պողոսյան» սեփականատեր",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectOwners(result);
      const allEmpty = text.every(word => word.isEmpty());

      expect(result).toStrictEqual(output);
      expect(allEmpty).toBe(true);
    });

    test("_collectOwners collects plural owners listed BEFORE word <owner>", () => {
      const text = new EnhancedStringArray([
        "«Վ․Սահակյան»,",
        "«Լիլիթ",
        "Սահակյան»,",
        "և",
        "«Գայանե",
        "Պողոսյան»",
        "Սեփականատերեր",
      ]);

      const result: string[] = [];
      const output: string[] = [
        "«Վ․Սահակյան» սեփականատեր",
        "«Լիլիթ Սահակյան» սեփականատեր",
        "«Գայանե Պողոսյան» սեփականատեր",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectOwners(result);
      const allEmpty = text.every(word => word.isEmpty());

      expect(result).toStrictEqual(output);
      expect(allEmpty).toBe(true);
    });

    test("_parseStreetName parses street/avenue name", () => {
      const textStreet = new EnhancedStringArray([
        "բառ,",
        "Նոր",
        "Նորք",
        "1-ին",
        "զանգ.",
        "Ս․",
        "Սաֆարյան",
        "փ.",
        "12,",
        "14,",
        "շենքեր",
      ]);

      const textAvenue = new EnhancedStringArray([
        "բառ,",
        "Մյասնիկյան",
        "պող.",
        "20/4,",
        "15/5",
        "շենքեր,",
      ]);

      const streetName: string[] = [];
      const avenueName: string[] = [];
      const avenueOutput: string[] = [ "Մյասնիկյան" ];
      const streetOutput: string[] = [
        "Սաֆարյան",
        "Ս․",
        "զանգ.",
        "1-ին",
        "Նորք",
        "Նոր",
      ];

      // @ts-expect-error: Force access to the private method
      textStreet._parseStreetName(7, streetName);
      // @ts-expect-error: Force access to the private method
      textAvenue._parseStreetName(2, avenueName);

      const allStrEmpty = textStreet
        .slice(1, 8)
        .every((word) => word.isEmpty());
      const allAveEmpty = textAvenue
        .slice(1, 3)
        .every((word) => word.isEmpty());

      expect(streetName).toStrictEqual(streetOutput);
      expect(avenueName).toStrictEqual(avenueOutput);
      expect(allStrEmpty).toBe(true);
      expect(allAveEmpty).toBe(true);
    });
  });
});
