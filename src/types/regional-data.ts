import { Province, Municipality } from "./region";

type ProvinceKeys = keyof typeof Province;

export type TempRegionalData = Partial<Record<ProvinceKeys, string[]>>;
export type RegionalData = Partial<Record<ProvinceKeys, Municipality>>;
