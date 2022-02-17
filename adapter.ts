import { isFileExisted } from "./utils.ts";

export interface Adapter<T> {
  read: () => Promise<T[]>;
  write: (data: T[]) => Promise<void>;
}

export type FileAdapterOptions<T> = {
  getInitialData?: () => T[];
  serialize?: (data: T[]) => Promise<string>;
  deserialize?: (data: string) => Promise<T[]>;
};

export class FileAdapter<T = unknown> implements Adapter<T> {
  #filePath: string;

  #getInitialData: () => T[];

  #serialize: (data: T[]) => Promise<string>;

  #deserialize: (data: string) => Promise<T[]>;

  static getInitialData() {
    return [];
  }

  static serialize(data: unknown[]) {
    return Promise.resolve(JSON.stringify(data));
  }

  static deserialize(data: string) {
    return Promise.resolve(JSON.parse(data));
  }

  constructor(filePath: string, options: FileAdapterOptions<T>) {
    this.#filePath = filePath;
    this.#getInitialData = options.getInitialData ?? FileAdapter.getInitialData;
    this.#serialize = options.serialize ?? FileAdapter.serialize;
    this.#deserialize = options.deserialize ?? FileAdapter.deserialize;
  }

  async read() {
    if (!(await isFileExisted(this.#filePath))) {
      const initialData = this.#getInitialData();
      await this.write(initialData);
    }

    try {
      const data = await Deno.readTextFile(this.#filePath);
      return this.#deserialize(data);
    } catch (error) {
      throw new Error(
        `Could not read file ${this.#filePath}: ${error.message}`
      );
    }
  }

  async write(data: T[]) {
    try {
      const json = await this.#serialize(data);
      await Deno.writeTextFile(this.#filePath, json);
    } catch (error) {
      throw new Error(
        `Could not write file ${this.#filePath}: ${error.message}`
      );
    }
  }
}
