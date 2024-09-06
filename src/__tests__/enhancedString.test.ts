import { describe, expect, test } from '@jest/globals';
import { EnhancedString } from '../utils/utils/enhancedString';
import { EnhancedStringArray } from '../utils/utils/enhancedStringArray';

describe("Enhanced string", () => {
  test("isHourRange validates string that is hour range", () => {
    const word = new EnhancedString("12:30-14:00");
    expect(word.isHourRange()).toBe(true);
  });

  test("isHourRange returns false if string is NOT hour range", () => {
    const word = new EnhancedString("12/30/1987");
    expect(word.isHourRange()).toBe(false);
  });

  test("isPlural validates plural string", () => {
    const word = new EnhancedString("ճարտարապետներ");
    expect(word.isPlural()).toBe(true);
  });

  test("isLonelyWord validates lonely word surrounded by empties", () => {
    const prev = new EnhancedString("");
    const curr = new EnhancedString("բառ");
    const next = new EnhancedString("");
    expect(curr.isLonelyWord(prev, next)).toBe(true);
  });

  test("isLonelyWord validates lonely word surrounded by empty and conuction", () => {
    const prev = new EnhancedString("");
    const curr = new EnhancedString("բառ");
    const next = new EnhancedString("և");
    expect(curr.isLonelyWord(prev, next)).toBe(true);
  });

  test("isLonelyWord validates lonely word surrounded by undefined objects", () => {
    const word = new EnhancedString("բառ");
    expect(word.isLonelyWord(undefined, undefined)).toBe(true);
  });

  test("isOrdinalNumber validates ordinal numbers", () => {
    const first = new EnhancedString("1-ին");
    const second = new EnhancedString("2-րդ");
    expect(first.isOrdinalNumber()).toBe(true);
    expect(second.isOrdinalNumber()).toBe(true);
  });

  test("isCity validates word <city>", () => {
    const word = new EnhancedString("քաղաքում");
    expect(word.isCity()).toBe(true);
  });

  test("isVillage validates word <village>", () => {
    const word = new EnhancedString("գյուղը");
    expect(word.isVillage()).toBe(true);
  });

  test("isCommunity validates word <community>", () => {
    const word = new EnhancedString("համայնքի");
    expect(word.isCommunity()).toBe(true);
  });

  test("isPartOfVillageName validates part of village name with lowercase", () => {
    const word = new EnhancedString("սովխոզ");
    expect(word.isPartOfVillageName()).toBe(true);
  });

  test("isPartOfVillageName rejects part of village name with lowercase", () => {
    const word = new EnhancedString("բառ");
    expect(word.isPartOfVillageName()).toBe(false);
  });

  test("isNurserySchool validates nursery school", () => {
    const word = new EnhancedString("մսուր-մանկապարտեզ");
    expect(word.isNurserySchool()).toBe(true);
  });

  test("isStreet validates word <street>", () => {
    const word1 = new EnhancedString("փողոցը,");
    const word2 = new EnhancedString("փող.");

    expect(word1.isStreet()).toBe(true);
    expect(word2.isStreet()).toBe(true);
  });

  test("isAvenue validates word <avenue>", () => {
    const word1 = new EnhancedString("պողոտան,");
    const word2 = new EnhancedString("պող.");

    expect(word1.isAvenue()).toBe(true);
    expect(word2.isAvenue()).toBe(true);
  });

  test("areVillages validates word <villages>", () => {
    const word = new EnhancedString("գյուղերը");
    expect(word.areVillages()).toBe(true);
  });

  test("areStreets validates word <streets>", () => {
    const word = new EnhancedString("փողոցներում");
    expect(word.areStreets()).toBe(true);
  });

  test("areCities validates word <cities>", () => {
    const word = new EnhancedString("քաղաքները");
    expect(word.areCities()).toBe(true);
  });

  test("areDistricts validates word <districts>", () => {
    const word = new EnhancedString("թաղամասերում");
    expect(word.areDistricts()).toBe(true);
  });

  test("areHometowns validates words <home towns>", () => {
    const homeFull = new EnhancedString("տնակային");
    const homePartial = new EnhancedString("տն.");
    const towns = new EnhancedString("ավաններ");

    expect(towns.areHometowns(homeFull)).toBe(true);
    expect(towns.areHometowns(homePartial)).toBe(true);
  });

  test("areHouses validates word <houses>", () => {
    const houses = new EnhancedString("տներ");
    const privateHouses = new EnhancedString("առանձնատներ");

    expect(houses.areHouses()).toBe(true);
    expect(privateHouses.areHouses()).toBe(true);
  });

  test("areBuildings validates word <buildings>", () => {
    const word = new EnhancedString("շենքերը,");
    expect(word.areBuildings()).toBe(true);
  });

  test("areOwners validates word <owners>", () => {
    const word = new EnhancedString("Սեփականատերեր`");
    expect(word.areOwners()).toBe(true);
  });

  test("areKindergartens validates word <kindergartens>", () => {
    const word1 = new EnhancedString("մանկապարտեզներ`");
    const word2 = new EnhancedString("մսուր-մանկապարտեզներ`");

    expect(word1.areKindergartens()).toBe(true);
    expect(word2.areKindergartens()).toBe(true);
  });

  test("areSchools validates word <schools>", () => {
    const word1 = new EnhancedString("դպրոցներ`");
    const word2 = new EnhancedString("մարզադպրոցներ`");

    expect(word1.areSchools()).toBe(true);
    expect(word2.areSchools()).toBe(true);
  });

  test("areLanes validates word <lanes>", () => {
    const word = new EnhancedString("նրբանցքները");
    expect(word.areLanes()).toBe(true);
  });

  test("arePrivateHouses validates words <private houses>", () => {
    const word1 = new EnhancedString("տներ");
    const word2 = new EnhancedString("սեփական");
    expect(word1.arePrivateHouses(word2)).toBe(true);
  });

  test("shouldIgnore ignores certains words", () => {
    const words = new EnhancedStringArray([
      "հարակից",
      "մասնակի",
      "ամբողջությամբ",
    ]);

    words.forEach(word => {
      expect(word.shouldIgnore()).toBe(true);
    });
  });

  test("doesNotContainNumbers validates word NOT containing numbers", () => {
    const word = new EnhancedString("բառ");
    expect(word.doesNotContainNumbers()).toBe(true);
  });

  test("doesContainNumbers validates word containing numbers", () => {
    const word = new EnhancedString("12Ա");
    expect(word.doesContainNumbers()).toBe(true);
  });

  test("didAddressEnd validates word that is end of address listing", () => {
    const words = new EnhancedStringArray([
      "մասնակի:",
      "նրբանցք,",
      "և",
      "բառ",
    ]);

    words.forEach(word => {
      expect(word.didAddressEnd()).toBe(true);
    });
  });

  test("collectNumericProperties collects numbers", () => {
    const numbers: string[] = [];
    const word = new EnhancedString("12/3");

    word.collectNumericProperties(numbers);
    expect(numbers).toStrictEqual([ "12/3" ]);
  });

  test("collectNumericProperties collects number range", () => {
    const numbers: string[] = [];
    const word = new EnhancedString("12-16");

    word.collectNumericProperties(numbers);
    expect(numbers).toStrictEqual([ "12", "13", "14", "15", "16" ]);
  });
});
