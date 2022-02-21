import { Persiston } from "./persiston.ts";
import { PlainObject, Query } from "./types.ts";
import { deepCopy, match } from "./utils.ts";

export class Collection<T extends PlainObject = PlainObject> {
  #store: Persiston;

  #name: string;

  get #list() {
    if (!this.#store.data[this.#name]) {
      this.#store.data[this.#name] = [];
    }

    return this.#store.data[this.#name] as T[];
  }

  constructor(store: Persiston, name: string) {
    this.#store = store;
    this.#name = name;
  }

  #query(query?: Query<T>): T[] {
    const conditions = query ? Object.entries(query) : [];

    return conditions.length
      ? this.#list.filter((item) => match(item, conditions))
      : this.#list;
  }

  #queryOne(query?: Query<T>): T | undefined {
    const conditions = query ? Object.entries(query) : [];

    return conditions.length
      ? this.#list.find((item) => match(item, conditions))
      : this.#list[0];
  }

  find(query?: Query<T>, fields?: string[]) {
    return Promise.resolve(
      this.#query(query).map((item) => deepCopy(item, fields))
    );
  }

  findOne(query?: Query<T>, fields?: string[]) {
    return Promise.resolve(deepCopy(this.#queryOne(query), fields));
  }

  async insert(items: T | T[]) {
    const list = Array.isArray(items) ? items : [items];
    let count = 0;

    list.forEach((item) => {
      if (!item) return;

      this.#list.push(item);
      count += 1;
    });

    await this.#store.save();
    return count;
  }

  async update(query: Query<T>, changes: Partial<T>) {
    const targets = this.#query(query);

    targets.forEach((item) => {
      Object.assign(item, changes);
    });

    await this.#store.save();
    return targets.length;
  }

  async updateOne(query: Query<T>, changes: Partial<T>) {
    const target = this.#queryOne(query);
    if (!target) return 0;

    Object.assign(target, changes);

    await this.#store.save();
    return 1;
  }

  async remove(query?: Query<T>) {
    const conditions = query ? Object.entries(query) : [];

    if (!conditions.length) {
      const count = this.#list.length;
      this.#list.length = 0;

      if (count) await this.#store.save();
      return count;
    }

    const indexes: number[] = [];

    this.#list.forEach((item, index) => {
      if (match(item, conditions)) indexes.push(index);
    });

    indexes.reverse().forEach((index) => {
      this.#list.splice(index, 1);
    });

    if (indexes.length) await this.#store.save();
    return indexes.length;
  }

  async removeOne(query?: Query<T>) {
    const conditions = query ? Object.entries(query) : [];
    const index = this.#list.findIndex((item) => match(item, conditions));

    if (index === -1) return 0;

    this.#list.splice(index, 1);
    await this.#store.save();

    return 1;
  }
}
