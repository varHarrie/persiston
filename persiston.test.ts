import { assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import { FileAdapter } from "./adapter.ts";
import { Persiston } from "./persiston.ts";

const testFile = "./test.json";
const getInitialData = () => ({
  users: [
    { name: "foo", age: 18 },
    { name: "bar", age: 21 },
    { name: "baz", age: 18 },
  ],
});

Deno.test("Persiston.load", async (t) => {
  const adapter = new FileAdapter(testFile);
  const store = new Persiston({
    adapter,
    getInitialData,
  });

  await Deno.remove(testFile).catch(() => {});

  await t.step("empty", async () => {
    const emptyStore = new Persiston();
    await emptyStore.load();
    assertEquals(emptyStore.data, {});
  });

  await t.step("getInitialData", async () => {
    await store.load();
    assertEquals(store.data, getInitialData());
  });

  await Deno.writeTextFile(testFile, JSON.stringify(getInitialData()));

  await t.step("Read from file", async () => {
    await store.load();
    assertEquals(store.data, getInitialData());
  });
});

Deno.test("Persiston.save", async (t) => {
  const adapter = new FileAdapter(testFile);
  const store = new Persiston({ adapter });

  store.data = getInitialData();

  await Deno.remove(testFile).catch(() => {});

  await t.step("Write to file", async () => {
    await store.save();

    const result = await Deno.readTextFile(testFile);
    const data = JSON.parse(result);

    assertEquals(store.data, data);
  });
});

Deno.test("Persiston.collection", async (t) => {
  const adapter = new FileAdapter(testFile);
  const store = new Persiston({ adapter });
  const users = store.collection("users");

  await t.step("insert", async () => {
    const [first, ...rest] = getInitialData().users;

    await users.insert(first);
    await users.insert(rest);

    assertEquals(store.data, getInitialData());
  });

  await t.step("find", async () => {
    const all = await users.find();
    assertEquals(all.length, 3);

    const list = await users.find({ age: 18 });
    assertEquals(list.length, 2);

    list.forEach((item) => {
      assertEquals(item.age, 18);
    });
  });

  await t.step("findOne", async () => {
    const undef = await users.findOne({ age: 1 });
    assertEquals(undef, undefined);

    const first = await users.findOne();
    assertEquals(!!first, true);

    const item = await users.findOne({ age: 18 });
    assertEquals(item?.age, 18);
  });

  await t.step("update", async () => {
    const zero = await users.update({ age: 1 }, { age: 22 });
    assertEquals(zero, 0);

    const count = await users.update({ age: 18 }, { age: 19 });
    assertEquals(count, 2);

    const list = await users.find({ age: 19 });
    assertEquals(list.length, 2);
  });

  await t.step("updateOne", async () => {
    const zero = await users.updateOne({ age: 1 }, { age: 22 });
    assertEquals(zero, 0);

    const count = await users.updateOne({ age: 21 }, { age: 22 });
    assertEquals(count, 1);

    const list = await users.find({ age: 22 });
    assertEquals(list.length, 1);
  });

  await t.step("removeOne", async () => {
    store.data = getInitialData();

    const zero = await users.removeOne({ age: 1 });
    assertEquals(zero, 0);

    const one = await users.removeOne();
    assertEquals(one, 1);

    store.data = getInitialData();

    const count = await users.removeOne({ age: 21 });
    assertEquals(count, 1);

    const rest = await users.find();
    assertEquals(rest.length, 2);
  });

  await t.step("remove", async () => {
    store.data = getInitialData();

    const zero = await users.remove({ age: 1 });
    assertEquals(zero, 0);

    const count = await users.remove({ age: 18 });
    assertEquals(count, 2);

    const rest = await users.find();
    assertEquals(rest.length, 1);
  });

  await t.step("remove all", async () => {
    store.data = getInitialData();

    const count = await users.remove();
    assertEquals(count, 3);

    const rest = await users.find();
    assertEquals(rest.length, 0);
  });
});
