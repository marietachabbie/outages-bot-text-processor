export enum TMonth {
  հունվար = 0,
  փետրվար,
  մարտ,
  ապրիլ,
  մայիս,
  հունիս,
  հուլիս,
  օգոստոս,
  սեպտեմբեր,
  հոկտեմբեր,
  նոյեմբեր,
  դեկտեմբեր,
}

/* ՀՀ մարզեր */
export enum TProvince {
  Արագածոտն = "Արագածոտն",
  Արարատ = "Արարատ",
  Արմավիր = "Արմավիր",
  Գեղարքունիք = "Գեղարքունիք",
  Երևան = "Երևան",
  Լոռի = "Լոռի",
  Կոտայք = "Կոտայք",
  "Վայոց Ձոր" = "Վայոց Ձոր",
  Շիրակ = "Շիրակ",
  Սյունիք = "Սյունիք",
  Տավուշ = "Տավուշ",
}

/* Գյուղի անուն: Հասցեների զանգված կամ
   քաղաքի անուն: Հասցեների զանգված
*/
export interface TMunicipality {
  [key: string]: string[];
}

type ProvinceKeys = keyof typeof TProvince;

/* Մարզ-հասցեների ժամանակավոր տվյալների տեսակ */
export type TTempRegionalData = Partial<Record<ProvinceKeys, string[]>>;

/* Մարզի անուն: { գյուղի կամ քաղաքի անուն: Հասցեների զանգված } */
export type TRegionalData = Partial<Record<ProvinceKeys, TMunicipality>>;
