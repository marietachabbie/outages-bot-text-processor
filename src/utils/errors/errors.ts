import { ErrorBase } from "./error-base";

type ErrorName = 
  | "NO_DATE_FOUND_ERROR"
  | "SOMETHING_WENT_WRONG";

export class NoDateFounError extends ErrorBase<ErrorName> {};
export class SomethingWentWrongError extends ErrorBase<ErrorName> {};
