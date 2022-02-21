import {
  assertMatch,
  assertEquals,
  assertStringIncludes,
} from "https://deno.land/std@0.126.0/testing/asserts.ts";
import { ensureDir } from "https://deno.land/std@0.125.0/fs/mod.ts";
import { FileAdapter } from "./adapter.ts";
const testFile = "./test.json";

const adapter = new FileAdapter(testFile);
const adapter2 = new FileAdapter(testFile, {
  serialize: (data) => {
    return Promise.resolve("###" + JSON.stringify(data));
  },
  deserialize: (raw) => {
    return Promise.resolve(JSON.parse(raw.replace(/^#+/g, "")));
  },
});

Deno.test("FileAdapter.read", async (t) => {
  await Deno.remove(testFile).catch(() => {});

  await t.step("Not existed", async () => {
    const result = await adapter.read();
    assertEquals(result, undefined);
  });

  await Deno.writeTextFile(testFile, "hello world");

  await t.step("Invalid format", async () => {
    try {
      await adapter.read();
    } catch (error) {
      assertEquals(error instanceof Error, true);
      assertStringIncludes(error.message, "Could not read file");
      return;
    }

    throw new Error();
  });

  await Deno.writeTextFile(testFile, `{"list":[]}`);

  await t.step("Successfully", async () => {
    const result = await adapter.read();
    assertEquals(!!result, true);
    assertEquals(result?.["list"], []);
  });

  await Deno.writeTextFile(testFile, '###{"list":[]}');

  await t.step("Successfully with deserialize", async () => {
    const result = await adapter2.read();
    assertEquals(!!result, true);
    assertEquals(result?.["list"], []);
  });
});

Deno.test("FileAdapter.write", async (t) => {
  await Deno.remove(testFile).catch(() => {});
  await ensureDir(testFile);

  await t.step("Count not write", async () => {
    try {
      await adapter.write({});
    } catch (error) {
      assertEquals(error instanceof Error, true);
      assertStringIncludes(error.message, "Could not write file");
      return;
    }
  });

  await Deno.remove(testFile).catch(() => {});

  await t.step("Successfully", async () => {
    await adapter.write({ users: [{ name: "foo" }] });
    const result = await adapter.read();

    assertEquals(!!result, true);
    assertEquals(result?.["users"], [{ name: "foo" }]);
  });

  await Deno.remove(testFile).catch(() => {});

  await t.step("Successfully with serialize", async () => {
    await adapter2.write({ users: [{ name: "foo" }] });
    const result = await Deno.readTextFile(testFile);

    assertEquals(!!result, true);
    assertMatch(result, /^###/);
  });
});
