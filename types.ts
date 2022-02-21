export type PlainObject = Record<string, unknown>;

export type Collections = {
  [key: string]: unknown[];
};

export type Query<T> = {
  [key in keyof T]?: unknown;
};
