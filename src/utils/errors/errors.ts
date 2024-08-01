import { ErrorBase } from "./error-base";

type ErrorName = 
  | "NO_DATE_FOUND"
  | "NO_PROVINCE_FOUND"
  | "SOMETHING_WENT_WRONG";

export class NoDateFoundError extends ErrorBase<ErrorName> {};
export class NoProvinceFoundError extends ErrorBase<ErrorName> {};
export class SomethingWentWrongError extends ErrorBase<ErrorName> {};
