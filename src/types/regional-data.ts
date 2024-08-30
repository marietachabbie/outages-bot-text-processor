import { TProvince, TMunicipality } from "./region";

type ProvinceKeys = keyof typeof TProvince;

export type TTempRegionalData = Partial<Record<ProvinceKeys, string[]>>;
export type TRegionalData = Partial<Record<ProvinceKeys, TMunicipality>>;
