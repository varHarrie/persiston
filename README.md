# Persiston for Deno

Simple persistent store with database-like API.

## Usage

```javascript
const adapter = new FileAdapter('./data.json');

const collection = new Collection();
await collection.connect(adapter);

await collection.insert({ name: 'foo' });
console.log(await collection.findOne()); // { name: 'foo' }
```

## APIs

- `collection.find(query?: Query<T>, fields?: string[]): Promise<T[]>`

Finds items by query.

- `collection.findOne(query?: Query<T>, fields?: string[]): Promise<T | undefined>`

Finds an item by query.

- `collection.insert(items: T | T[]): Promise<number>`

Saves given item or items.

- `collection.update(query: Query<T>, changes: Partial<T>): Promise<number>`

Partially updates by query.

- `collection.updateOne(query: Query<T>, changes: Partial<T>): Promise<number>`

Partially updates an item by query.

- `collection.remove(query?: Query<T>): Promise<number>`

Removes items by query.

- `collection.removeOne(query: Query<T>): Promise<number>`

Removes an item by query.