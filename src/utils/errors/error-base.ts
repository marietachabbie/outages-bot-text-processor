export class ErrorBase<T extends string> extends Error {
  name: T;

  message: string;

  constructor({
    name,
    message,
  }: {
    name: T;
    message: string;
  }) {
    super();
    this.name = name;
    this.message = message;
  }
}
