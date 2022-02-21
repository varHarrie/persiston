import { assertEquals } from "https://deno.land/std@0.126.0/testing/asserts.ts";
import { deepCopy, deepGet } from "./utils.ts";

Deno.test("deepGet", () => {
  const source = { foo: { bar: { baz: 1 } } };
  const result = deepGet(source, "foo.bar.baz");
  assertEquals(result, 1);
});

Deno.test("deepCopy", () => {
  const source = {
    foo: 1,
    bar: 2,
    baz: 3,
  };

  const result = deepCopy(source);
  assertEquals(result, source);

  const result2 = deepCopy(source, ["foo", "bar"]);
  assertEquals(result2, { foo: 1, bar: 2 });

  const result3 = deepCopy(source, ["-baz"]);
  assertEquals(result3, { foo: 1, bar: 2 });
});
