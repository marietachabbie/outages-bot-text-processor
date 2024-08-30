import { TProvince, TMunicipality } from "./region";

type ProvinceKeys = keyof typeof TProvince;

export type TempRegionalData = Partial<Record<ProvinceKeys, string[]>>;
export type RegionalData = Partial<Record<ProvinceKeys, TMunicipality>>;
