import { Request } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

interface RequestTypes {
  TBody?: any;
  TQuery?: any;
  TParams?: any;
}

type ExtractBody<T extends RequestTypes> = T["TBody"] extends undefined
  ? any
  : T["TBody"];

type ExtractQuery<T extends RequestTypes> = T["TQuery"] extends undefined
  ? any
  : T["TQuery"];

type ExtractParams<T extends RequestTypes> = T["TParams"] extends undefined
  ? any
  : T["TParams"];

export type TypedRequest<T extends RequestTypes = {}> = Request<
  ExtractParams<T>,
  any,
  ExtractBody<T>,
  ExtractQuery<T>
>;

// export type TypedRequest<T extends {
//   TParams?: ParamsDictionary;
//   TBody?: any;
//   TQuery?: ParsedQs;
// } = {}> = Request<
//   T["TParams"] extends undefined ? ParamsDictionary : T["TParams"],
//   any,
//   T["TBody"] extends undefined ? any : T["TBody"],
//   T["TQuery"] extends undefined ? ParsedQs : T["TQuery"]
// >;

// export interface AuthenticatedUser {
//   id: string;
//   role: string;
//   email?: string;
//   username?: string;
// }

declare interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  quiz?: any; 
}
