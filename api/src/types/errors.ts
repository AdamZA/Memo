// Typescript's built-in Error interface lacks some fields that Express's JSON parser adds
export interface JsonParseError extends Error {
  type?: string;
  body?: string;
}
