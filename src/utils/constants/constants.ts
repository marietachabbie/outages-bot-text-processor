import citiesJson from "../../data/cities.json";
import villagesJson from "../../data/villages.json";
import communitiesJson from "../../data/communities.json";

const jsonToObjWithSets = (json: { [key: string]: string[] }): { [key: string]: Set<string> } => {
  const result: { [key: string]: Set<string> } = {};
  for (const key in json) result[key] = new Set(json[key]);
  return result;
};

export const CITIES: { [key: string]: Set<string> } = jsonToObjWithSets(citiesJson);
export const VILLAGES: { [key: string]: Set<string> } = jsonToObjWithSets(villagesJson);
export const COMMUNITIES: { [key: string]: Set<string> } = jsonToObjWithSets(communitiesJson);

export const CONSTANT_WORDS = {
  NUMBER: "թիվ",
  OTHER: "Այլ",
};

export const WARNINGS_TO_IGNORE: string[] = [
  "«Հայաստանի էլեկտրական ցանցեր» ընկերությունը հորդորում է հետևել էլեկտրաանվտանգության կանոններին:",
  "Սպառած էլեկտրաէներգիայի, անջատումների, Ձեր իրավունքներին կամ պարտականություններին վերաբերող, ինչպես նաև այլ հարցերի առնչությամբ կարող եք զանգահարել 1-80 և 0 8000 0 180 շուրջօրյա գործող հեռախոսահամարներով:",
  "«Հայաստանի էլեկտրական ցանցեր» փակ բաժնետիրական ընկերությունը տեղեկացնում է, որ օգոստոսի 7-ին պլանային նորոգման աշխատանքներ իրականացնելու նպատակով ժամանակավորապես կդադարեցվի հետևյալ հասցեների էլեկտրամատակարարումը`",
];

export const LOWERCASE_VILLAGE_NAMES: Set<string> = new Set([
  "սովխոզ",
  "աղբյուր",
  "կայարան",
]);

export const WORDS_TO_IGNORE = new Set<string>([
  "հարակից",
  "սեփական",
  "մասնակի",
  "ամբողջությամբ",
  "տարածքում",
  "գործող",
  "նրանց",
  "այլ",
  "հանրային",
]);

export const WORDS_TO_REMOVE = {
  NOT: "ոչ",
  RESIDENT: "բնակիչ",
  ABONNEMENTS: "բաժանորդներ",
  ABONNEMENT: "բաժանորդ", 
  AREAS: "տարածքներ",
};

export const PROVINCES = {
  YEREVAN: "Երևան",
  LORI: "Լոռի",
  VAYOTS: "Վայոց",
  DZOR: "Ձոր",
};

export const INFRASTRUCTURES = {
  PROVINCE: "մարզ",
  VILLAGE: "գյուղ",
  VILLAGES: "գյուղեր",
  COMMUNITY: "համայնք",
  CITY: "քաղաք",
  CITIES: "քաղաքներ",
  DISTRICT: "թաղամաս",
  DISTRICTS: "թաղամասեր",
  IE: "ԱՁ",
  AVENUE: "պողոտա",
  STREET: "փողոց",
  STREETS: "փողոցներ",
  LANE: "նրբանցք",
  LANES: "նրբանցքներ",
  BLIND_ALLEY: "փակուղի",
  HOUSE: "տուն",
  HOUSES: "տներ",
  BUILDING: "շենք",
  BUILDINGS: "շենքեր",
  OWNER: "սեփականատեր",
  OWNERS: "սեփականատերեր",
  LLC: "ՍՊԸ",
  CJSC: "ՓԲԸ",
  HOMETOWN: "տնակային ավան",
  HOMETOWNS: "տնակային ավաններ",
  KINDERGARTEN: "մանկապարտեզ",
  KINDERGARTENS: "մանկապարտեզներ",
  SCHOOL: "դպրոց",
  SCHOOLS: "դպրոցներ",
  NURSERY: "մսուր",
  PRIVATE: "սեփական",
};
