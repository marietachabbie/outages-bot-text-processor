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
      const expectedOutput = [ "բառ", "բառեր" ];
      const cleared = text.filterNotEmpties();

      expect(cleared).toStrictEqual(expectedOutput);
    });

    test("filterNotHourRanges filters words that are NOT hour range", () => {
      const text = new EnhancedStringArray([ "12:00-13:00", "բառ", "բառեր" ]);
      const expectedOutput = new EnhancedStringArray([ "բառ", "բառեր" ]);
      const cleared = text.filterNotHourRanges();

      expect(cleared).toStrictEqual(expectedOutput);
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
      const expectedOutput: TRegionalData = {
        Արարատ: {
          "Արարատ գյուղ": [ "«Արարատ կաթ» ՍՊԸ", "Զինմաս" ],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(expectedOutput);
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
      const expectedOutput: TRegionalData = {
        Սյունիք: {
          "Քաջարան քաղաք": [ "Գայի պողոտա 1 շենք", "Գայի պողոտա 2 շենք" ],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(expectedOutput);
    });

    test("collectAddresses collects addresses for multiple villages", () => {
      const text = new EnhancedStringArray([ "Բարձրունի,", "Մարտիրոս,", "և", "Սերս", "գյուղեր" ]);

      const province = "Վայոց Ձոր";
      const announcements: TRegionalData = {};
      const expectedOutput: TRegionalData = {
        "Վայոց Ձոր": {
          "Բարձրունի գյուղ": [],
          "Մարտիրոս գյուղ": [],
          "Սերս գյուղ": [],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(expectedOutput);
    });

    test("collectAddresses collects addresses for multiple cities", () => {
      const text = new EnhancedStringArray([ "Արմավիր,", "Էջմիածին,", "և", "Մեծամոր", "քաղաքներ" ]);

      const province = "Արմավիր";
      const announcements: TRegionalData = {};
      const expectedOutput: TRegionalData = {
        Արմավիր: {
          "Արմավիր քաղաք": [],
          "Էջմիածին քաղաք": [],
          "Մեծամոր քաղաք": [],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(expectedOutput);
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
      const expectedOutput: TRegionalData = {
        Արմավիր: {
          "Արմավիր քաղաք": [],
          "Էջմիածին քաղաք": [],
          "Մեծամոր քաղաք": [],
          Այլ: [ "«Մշո տղեք» ենթակայան", "Գարեգին Ա փողոցի սկզբնամասի գազալցակայան" ],
        },
      };

      text.collectAddresses(province as TProvince, announcements);
      expect(announcements).toStrictEqual(expectedOutput);
    });
  });

  describe("private methods", () => {
    test("_collectInfrastructures", () => {
      const text = new EnhancedStringArray([
        "Մայակ,",
        "Բանավան",
        "և",
        "Բագրևանդ",
        "2,",
        "3",
        "փողոցներ,",
      ]);

      const output: string[] = [];
      const expectedOutput: string[] = [
        "Բագրևանդ 3 փողոց",
        "Բագրևանդ 2 փողոց",
        "Բանավան փողոց",
        "Մայակ փողոց",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectInfrastructures(output, EnhancedString.prototype.areStreets, "փողոց");

      const allEmpty = text.every(word => word.isEmpty());

      expect(output).toStrictEqual(expectedOutput);
      expect(allEmpty).toBe(true);
    });

    test("_collectInfrastructures collects non-numerical names for plural infrastructures", () => {
      const text = new EnhancedStringArray([ "Մայակ,", "Բանավան", "և", "Բագրևանդ", "թաղամասեր," ]);

      const output: string[] = [];
      const expectedOutput: string[] = [ "Բագրևանդ թաղամաս", "Բանավան թաղամաս", "Մայակ թաղամաս" ];

      // @ts-expect-error: Force access to the private method
      text._collectInfrastructures(output, EnhancedString.prototype.areDistricts, "թաղամաս");
      const allEmpty = text.every(word => word.isEmpty());

      expect(output).toStrictEqual(expectedOutput);
      expect(allEmpty).toBe(true);
    });

    test("_collectInfrastructures collects numerical names for schools", () => {
      const text = new EnhancedStringArray([ "թիվ", "122", "և", "123", "դպրոցներ," ]);

      const output: string[] = [];
      const expectedOutput: string[] = [ "թիվ 123 դպրոց", "թիվ 122 դպրոց" ];

      // @ts-expect-error: Force access to the private method
      text._collectInfrastructures(output, EnhancedString.prototype.areSchools, "դպրոց");
      const allEmpty = text.every(word => word.isEmpty());

      expect(output).toStrictEqual(expectedOutput);
      expect(allEmpty).toBe(true);
    });

    test("_collectDualInfrastructures collects valid hometowns", () => {
      const text = new EnhancedStringArray([ "142,", "153,", "154", "տնակային", "ավաններ" ]);

      const output: string[] = [];
      const expectedOutput: string[] = [
        "154 տնակային ավան",
        "153 տնակային ավան",
        "142 տնակային ավան",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectDualInfrastructures(
        output,
        EnhancedString.prototype.areHometowns,
        "տնակային ավան",
      );
      const allEmpty = text.every(word => word.isEmpty());

      expect(output).toStrictEqual(expectedOutput);
      expect(allEmpty).toBe(true);
    });

    test("_getStartOfBusinessList returns index of the start of the first owner", () => {
      const text = new EnhancedStringArray([
        "«Վահրամ",
        "Սահակյան»,",
        "և",
        "«Լիլիթ",
        "Սահակյան»",
        "սեփականատերեր",
      ]);

      // @ts-expect-error: Force access to the private method
      const output = text._getStartOfBusinessList(5);
      expect(output).toBe(0);
    });

    test("_collectPluralKindergartens collects numerical names for kindergartens", () => {
      const text = new EnhancedStringArray([ "թիվ", "153", "և", "154", "մսուր", "մանկապարտեզներ" ]);

      const output: string[] = [];
      const expectedOutput: string[] = [ "թիվ 154 մսուր-մանկապարտեզ", "թիվ 153 մսուր-մանկապարտեզ" ];

      // @ts-expect-error: Force access to the private method
      text._collectPluralKindergartens(output);
      const allEmpty = text.every(word => word.isEmpty());

      expect(output).toStrictEqual(expectedOutput);
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

      const output: string[] = [];
      const expectedOutput: string[] = [
        "Նորագավիթ 1 փողոց 2–րդ նրբանցք",
        "Նորագավիթ 1 փողոց 1-ին նրբանցք",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectPluralLanes(output);
      const allEmpty = text.every(word => word.isEmpty());

      expect(output).toStrictEqual(expectedOutput);
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

      const output: string[] = [];
      const expectedOutput: string[] = [
        "«Վ․Սահակյան» սեփականատեր",
        "«Լիլիթ Սահակյան» սեփականատեր",
        "«Գայանե Պողոսյան» սեփականատեր",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectOwners(output);
      const allEmpty = text.every(word => word.isEmpty());

      expect(output).toStrictEqual(expectedOutput);
      expect(allEmpty).toBe(true);
    });

    test("_collectBusinessNames collects IE listed AFTER word <IE>", () => {
      const text = new EnhancedStringArray([ "ԱՁ", "«Վ․ Սահակյան»" ]);
      const output: string[] = [];

      // @ts-expect-error: Force access to the private method
      text._collectBusinessNames(1, 3, "ԱՁ", output); // TODO: switch to const
    });

    test("_collectBusinessNames collects IE listed BEFORE word <IE>", () => {
      const text = new EnhancedStringArray([ "«Վ․ Սահակյան»", "ԱՁ" ]);
      const output: string[] = [];

      // @ts-expect-error: Force access to the private method
      text._collectBusinessNames(0, 1, "ԱՁ", output); // TODO: switch to const
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

      const output: string[] = [];
      const expectedOutput: string[] = [
        "«Վ․Սահակյան» սեփականատեր",
        "«Լիլիթ Սահակյան» սեփականատեր",
        "«Գայանե Պողոսյան» սեփականատեր",
      ];

      // @ts-expect-error: Force access to the private method
      text._collectOwners(output);
      const allEmpty = text.every(word => word.isEmpty());

      expect(output).toStrictEqual(expectedOutput);
      expect(allEmpty).toBe(true);
    });

    test("_parseStreetName parses street name", () => {
      const text = new EnhancedStringArray([
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

      const streetName: string[] = [];
      const expectedOutput: string[] = [ "Նոր", "Նորք", "1-ին", "զանգ.", "Ս․", "Սաֆարյան" ];

      // @ts-expect-error: Force access to the private method
      text._parseStreetName(7, streetName);

      const allEmpty = text.slice(1, 8).every(word => word.isEmpty());

      expect(streetName).toStrictEqual(expectedOutput);
      expect(allEmpty).toBe(true);
    });

    test("_parseStreetName parses avenue name", () => {
      const text = new EnhancedStringArray([
        "բառ,",
        "Մյասնիկյան",
        "պող.",
        "20/4,",
        "15/5",
        "շենքեր,",
      ]);

      const avenueName: string[] = [];
      const expectedOutput: string[] = [ "Մյասնիկյան" ];

      // @ts-expect-error: Force access to the private method
      text._parseStreetName(2, avenueName);

      const allEmpty = text.slice(1, 3).every(word => word.isEmpty());

      expect(avenueName).toStrictEqual(expectedOutput);
      expect(allEmpty).toBe(true);
    });

    test("_getInfrastructureType returns type of infrastructure", () => {
      const buildingText = new EnhancedStringArray([ "124,", "34", "շենքեր" ]);

      const houseText = new EnhancedStringArray([ "124", "34", "տները" ]);

      const privateHouseText = new EnhancedStringArray([ "124", "34", "սեփական", "տներ" ]);

      // @ts-expect-error: Force access to the private method
      expect(buildingText._getInfrastructureType(2)).toBe("շենք");
      // @ts-expect-error: Force access to the private method
      expect(houseText._getInfrastructureType(2)).toBe("տուն");
      // @ts-expect-error: Force access to the private method
      expect(privateHouseText._getInfrastructureType(3)).toBe("սեփական տուն");
    });

    test("_collectMultipleProperties collects multiple numeric properties", () => {
      const text = new EnhancedStringArray([ "124,", "34,", "և", "68", "շենքեր" ]);

      const output: string[] = [];
      const expectedOutput: string[] = [ "124 շենք", "34 շենք", "68 շենք" ];

      // @ts-expect-error: Force access to the private method
      text._collectMultipleProperties(0, 4, output);

      expect(output).toStrictEqual(expectedOutput);
    });

    test("_collectSingleProperty collects single numeric property", () => {
      const text = new EnhancedStringArray([ "124,", "շենքում" ]);

      const output: string[] = [];
      const expectedOutput: string[] = [ "124 շենք" ];

      // @ts-expect-error: Force access to the private method
      text._collectSingleProperty(0, 1, output);

      expect(output).toStrictEqual(expectedOutput);
    });

    test("_parseProperties parses single property", () => {
      const text = new EnhancedStringArray([ "", "", "20/4", "շենք" ]);

      const output: string[] = [];
      const expectedOutput: string[] = [ "20/4 շենք" ];

      // @ts-expect-error: Force access to the private method
      text._parseProperties(1, output);
      const allEmpty = text.every(word => word.isEmpty());

      expect(output).toStrictEqual(expectedOutput);
      expect(allEmpty).toBe(true);
    });

    test("_parseProperties parses multiple properties", () => {
      const text = new EnhancedStringArray([ "", "", "20/4", "34", "62", "շենքեր" ]);

      const output: string[] = [];
      const expectedOutput: string[] = [ "20/4 շենք", "34 շենք", "62 շենք" ];

      // @ts-expect-error: Force access to the private method
      text._parseProperties(1, output);
      const allEmpty = text.every(word => word.isEmpty());

      expect(output).toStrictEqual(expectedOutput);
      expect(allEmpty).toBe(true);
    });

    test("_parseStreetsAndProperties parses street without properties", () => {
      const text = new EnhancedStringArray([ "Սաֆարյան", "փ." ]);

      const output: string[] = [];
      const expectedOutput: string[] = [ "Սաֆարյան փողոց" ];

      // @ts-expect-error: Force access to the private method
      text._parseStreetsAndProperties(output);

      expect(output).toStrictEqual(expectedOutput);
    });

    test("_parseStreetsAndProperties parses street with a property", () => {
      const text = new EnhancedStringArray([ "Սաֆարյան", "փ.", "12", "շենք" ]);

      const output: string[] = [];
      const expectedOutput: string[] = [ "Սաֆարյան փողոց 12 շենք" ];

      // @ts-expect-error: Force access to the private method
      text._parseStreetsAndProperties(output);

      expect(output).toStrictEqual(expectedOutput);
    });

    test("_parseStreetsAndProperties parses street with properties", () => {
      const text = new EnhancedStringArray([ "Սաֆարյան", "փ.", "12,", "24,", "34", "շենքեր" ]);

      const output: string[] = [];
      const expectedOutput: string[] = [
        "Սաֆարյան փողոց 12 շենք",
        "Սաֆարյան փողոց 24 շենք",
        "Սաֆարյան փողոց 34 շենք",
      ];

      // @ts-expect-error: Force access to the private method
      text._parseStreetsAndProperties(output);

      expect(output).toStrictEqual(expectedOutput);
    });

    test("_parseStreetWithoutWordStreet parses street and numeric properties without word <STREET>", () => {
      const enhancedText = new EnhancedStringArray([]);
      const text = "Վարդանանց 23, 24, և 32 շենքերը";
      const addresses: string[] = [];

      // @ts-expect-error: Force access to the private method
      const output = enhancedText._parseStreetWithoutWordStreet(text, addresses);

      expect(addresses).toStrictEqual([
        "Վարդանանց 23 շենք",
        "Վարդանանց 24 շենք",
        "Վարդանանց 32 շենք",
      ]);
      expect(output).toBe("");
    });
  });
});
