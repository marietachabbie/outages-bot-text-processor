import { Province, Municipality } from "./region";

type ProvinceKeys = keyof typeof Province;

export type RegionalData = Partial<Record<ProvinceKeys, Municipality>>;
