import { Collections } from "./types.ts";
import { isFileExisted } from "./utils.ts";

export interface Adapter {
  read: () => Promise<Collections | undefined>;
  write: (data: Collections) => Promise<void>;
}

export type FileAdapterOptions = {
  serialize?: (data: Collections) => Promise<string>;
  deserialize?: (raw: string) => Promise<Collections>;
};

export class FileAdapter implements Adapter {
  #filePath: string;

  #serialize: (data: Collections) => Promise<string>;

  #deserialize: (raw: string) => Promise<Collections>;

  static serialize(data: Collections) {
    return Promise.resolve(JSON.stringify(data));
  }

  static deserialize(raw: string) {
    return Promise.resolve(JSON.parse(raw));
  }

  constructor(filePath: string, options: FileAdapterOptions = {}) {
    this.#filePath = filePath;
    this.#serialize = options.serialize ?? FileAdapter.serialize;
    this.#deserialize = options.deserialize ?? FileAdapter.deserialize;
  }

  async read() {
    if (!(await isFileExisted(this.#filePath))) {
      return undefined;
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

  async write(data: Collections) {
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
