import { Adapter } from "./adapter.ts";
import { Collection } from "./collection.ts";
import { Collections, PlainObject } from "./types.ts";

type PersistonOptions = {
  adapter?: Adapter;
  getInitialData?: () => Collections;
};

export class Persiston {
  data: Collections;

  adapter?: Adapter;

  getInitialData?: () => Collections;

  constructor(options: PersistonOptions = {}) {
    this.data = {};
    this.adapter = options.adapter;
    this.getInitialData = options.getInitialData;
  }

  async load() {
    const data = await this.adapter?.read();

    if (data) {
      this.data = data;
    } else if (this.getInitialData) {
      this.data = this.getInitialData();
    } else {
      this.data = {};
    }

    return this;
  }

  async save() {
    await this.adapter?.write(this.data);
    return this;
  }

  collection<T extends PlainObject = PlainObject>(name: string) {
    return new Collection<T>(this, name);
  }
}
