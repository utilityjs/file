import * as path from "@std/path";
import {afterAll, assertEquals, beforeAll, describe, it,} from "../test_deps.ts";
import {copy, exists, mkdirRecursive, readJsonFile, readJsonFilesFromPath, readTextFile, removeRecursive, unZipFromURL, writeJsonFile, writeTextFile,} from "../mod.ts";

const TEST_RESOURCES_PATH = path.normalize(import.meta.dirname + "/resources");

describe({
  name: "file",
  sanitizeResources: false,
  sanitizeOps: false,
  fn: () => {
    beforeAll(async () => {
      const tempDir = `${TEST_RESOURCES_PATH}/.temp`;
      if (!await exists(tempDir)) {
        await mkdirRecursive(tempDir);
      }
    });

    afterAll(async () => {
      const copyDir = `${TEST_RESOURCES_PATH}/copy`;
      if (await exists(copyDir)) {
        await removeRecursive(copyDir);
      }
    });

    it("#readTextFile()", async () => {
      const fileContent = await readTextFile(
        `${TEST_RESOURCES_PATH}/sample.txt`,
      );
      assertEquals(fileContent, "Hello");
    });

    it("#readJsonFile()", async () => {
      const obj = await readJsonFile(
        `${TEST_RESOURCES_PATH}/sample.json`,
      );
      assertEquals(obj.title, "Hello");
    });

    it("#writeJsonFile()", async () => {
      await writeJsonFile(`${TEST_RESOURCES_PATH}/.temp/write.json`, {
        title: "Write",
      });
      const obj = await readJsonFile(
        `${TEST_RESOURCES_PATH}/.temp/write.json`,
      );
      assertEquals(obj.title, "Write");
    });

    it("#writeTextFile()", async () => {
      await writeTextFile(
        `${TEST_RESOURCES_PATH}/.temp/write.txt`,
        "Write",
      );
      const str = await readTextFile(
        `${TEST_RESOURCES_PATH}/.temp/write.txt`,
      );
      assertEquals(str.toString(), "Write");
    });

    it("#readJsonFilesFromPath()", async () => {
      const arr = await readJsonFilesFromPath(
        `${TEST_RESOURCES_PATH}/path/**.json`,
      );
      assertEquals(arr[0].title, "a");
      assertEquals(arr[1].title, "b");
    });

    it("#remove()", async () => {
      const dir = `${TEST_RESOURCES_PATH}/.temp`;
      await removeRecursive(dir);
      assertEquals(await exists(dir), false);
    });

    it("#copy()", async () => {
      await copy(
        TEST_RESOURCES_PATH + "/path",
        TEST_RESOURCES_PATH + "/copy",
      );
      const objs = await readJsonFilesFromPath(
        TEST_RESOURCES_PATH + "/copy/*.json",
      );
      assertEquals(objs[0].title, "a");
      assertEquals(objs[1].title, "b");
    });

    it("#unZipFromURL()", async () => {
      await mkdirRecursive(path.join(`${TEST_RESOURCES_PATH}/.temp`));
      await unZipFromURL(
        new URL("./resources/compress.zip", import.meta.url),
        path.join(`${TEST_RESOURCES_PATH}/.temp/uncompressed`),
      );
      assertEquals(
        await exists(
          TEST_RESOURCES_PATH + "/.temp/uncompressed/path/a.json",
        ),
        true,
      );
      assertEquals(
        await exists(
          TEST_RESOURCES_PATH + "/.temp/uncompressed/sample.txt",
        ),
        true,
      );
    });
  },
});
