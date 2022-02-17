import { Adapter } from "./adapter.ts";
import { deepCopy, match } from "./utils.ts";

type Connection<T> = {
  adapter: Adapter<T>;
};

export type Query<T> = {
  [key in keyof T]?: unknown;
};

export class Collection<T extends Record<string, unknown>> {
  #connected: Connection<T> | undefined = undefined;
  #list: T[] = [];

  async #save() {
    await this.#connected?.adapter.write(this.#list);
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

  async connect(adapter: Adapter<T>) {
    this.#connected = { adapter };
    this.#list = await this.#connected.adapter.read();
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

    await this.#save();
    return count;
  }

  async update(query: Query<T>, changes: Partial<T>) {
    const targets = this.#query(query);

    targets.forEach((item) => {
      Object.assign(item, changes);
    });

    await this.#save();
    return targets.length;
  }

  async updateOne(query: Query<T>, changes: Partial<T>) {
    const target = this.#queryOne(query);
    if (!target) return 0;

    Object.assign(target, changes);

    await this.#save();
    return 1;
  }

  async remove(query?: Query<T>) {
    const conditions = query ? Object.entries(query) : [];

    if (!conditions.length) {
      const count = this.#list.length;
      this.#list.length = 0;

      if (count) await this.#save();
      return count;
    }

    const indexes: number[] = [];

    this.#list.forEach((item, index) => {
      if (match(item, conditions)) indexes.push(index);
    });

    indexes.reverse().forEach((index) => {
      this.#list.splice(index, 1);
    });

    if (indexes.length) await this.#save();
    return indexes.length;
  }

  async removeOne(query?: Query<T>) {
    const conditions = query ? Object.entries(query) : [];
    const index = this.#list.findIndex((item) => match(item, conditions));

    if (index === -1) return 0;

    this.#list.splice(index, 1);
    await this.#save();

    return 1;
  }
}
