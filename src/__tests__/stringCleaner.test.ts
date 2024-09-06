import { describe, expect, test } from "@jest/globals";
import { stringCleaner } from "../utils/utils/stringCleaner";
import { EnhancedString } from "../utils/utils/enhancedString";
import { EnhancedStringArray } from "../utils/utils/enhancedStringArray";

describe("String cleaner", () => {
  test("clearPossessiveSuffix clears possesive suffixes", () => {
    const word1: string = "ճարտարապետ-ի";
    const word2: string = "Լոռվա";

    expect(stringCleaner.clearPossessiveSuffix(word1)).toBe("ճարտարապետ");
    expect(stringCleaner.clearPossessiveSuffix(word2)).toBe("Լոռ");
  });

  test("clearSuffixes clears suffixes properly", () => {
    const word1: EnhancedString = new EnhancedString("Երեւանում");
    const word2: EnhancedString = new EnhancedString("փակուղու");

    expect(stringCleaner.clearSuffixes(word1)).toBe("Երեւան");
    expect(stringCleaner.clearSuffixes(word2)).toBe("փակուղի");
  });

  test("clearPluralSuffix clears plural suffixes", () => {
    const word: string = "ճարտարապետներ";
    const output: EnhancedString = new EnhancedString("ճարտարապետ");
    expect(stringCleaner.clearPluralSuffix(word)).toStrictEqual(output);
  });

  test("removeParsedWords removes values of enhanced strings by given indices", () => {
    const input: EnhancedStringArray = new EnhancedStringArray([
      "ճարտարապետ",
      "քաղաքագետ",
      "դերձակ",
      "այգեպան",
      "շինարար",
    ]);

    const output: EnhancedStringArray = new EnhancedStringArray([
      "ճարտարապետ",
      "",
      "",
      "",
      "շինարար",
    ]);

    stringCleaner.removeParsedWords(input, 1, 3);
    expect(input).toStrictEqual(output);
  });

  test("cleanUpAfterInitialProcessing", () => {
    const input: EnhancedStringArray = new EnhancedStringArray([
      "Ադոնցի",
      "նրբանցք,",
      "",
      "և",
      "Արամ",
      "Մանուկյան",
      "փողոց",
      "մասնակի,",
      "",
      "առանձնատներ",
      "",
      "թիվ",
      "152",
      "մարզադպրոց",
    ]);

    const output: string = "Ադոնցի նրբանցք, Արամ Մանուկյան փողոց, թիվ 152 մարզադպրոց,";
    expect(stringCleaner.cleanUpAfterInitialProcessing(input)).toBe(output);
  });

  test("processRemainingText cleans up the text and splits by commas", () => {
    const text: string = " Ադոնցի նրբանցք,  Արամ Մանուկյան փողոց,  թիվ 152 մարզադպրոց,";
    const output: string[] = [ "Ադոնցի նրբանցք", "Արամ Մանուկյան փողոց", "թիվ 152 մարզադպրոց" ];
    expect(stringCleaner.processRemainingText(text)).toStrictEqual(output);
  });

  test("clearInvalidParenthesis clears invalid parenthesis", () => {
    const text: string = "Ախուրյանի խճուղի)";
    expect(stringCleaner.clearInvalidParenthesis(text)).toBe("Ախուրյանի խճուղի");
  });

  test("clearInvalidParenthesis DOES NOT clear valid parenthesis", () => {
    const text: string = "(Ախուրյանի խճուղի)";
    expect(stringCleaner.clearInvalidParenthesis(text)).toBe("(Ախուրյանի խճուղի)");
  });
});
