# Persiston for Deno

Simple persistent store with database-like API.

## Usage

```javascript
const adapter = new FileAdapter('./data.json')
const store = new Persiston({ adapter })

store.load()
  .then(() => store.collection('users').insert({ name: 'foo' }))
  .then(() => store.collection('users').findOne())
  .then((user) => console.log(user)) // { name: 'foo' }
```

With type declaration:

```typescript
interface User {
  name: string
}

class Store extends Persiston {
  users = this.collection<User>('users')
  pets = this.collection<User>('pets')
}

const adapter = new FileAdapter('./data.json')
const store = new Store({ adapter })

store.load()
  .then(() => store.collection('users').insert({ name: 'foo' }))
  .then(() => store.collection('users').findOne())
  .then((user) => console.log(user)) // { name: 'foo' }
```

## APIs

### Persiston

- `store.load(): Promise<Persiston>`

Loads data by adapter. It should be called before all collection operations.

- `store.save(): Promise<Persiston>`

Saves data by adapter. You probably won't call it by yourself.

- `store.collection(): Collection<T>`

Gets a collection object.

### Collection

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