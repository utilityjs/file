import {JSONArray, JSONObject} from "@utility/types";
import {copy as fsCopy, expandGlob} from "@std/fs";

/**
 * Checks if a file or directory exists at the given path.
 * @param path - The path to the file or directory.
 * @returns A promise that resolves to true if the file or directory exists, false otherwise.
 * @throws Will throw an error if an unexpected error occurs, such as a permissions error.
 */
export async function exists(
  path: string | URL,
): Promise<boolean> {
  try {
    await Deno.stat(path);
    // successful, file or directory must exist
    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      // file or directory does not exist
      return false;
    } else {
      // unexpected error, maybe permissions, pass it along
      throw error;
    }
  }
}

/**
 * Creates a new directory at the given path.
 * @param path - The path where the directory should be created.
 * @returns A promise that resolves when the directory has been created.
 * @throws Will throw an error if an unexpected error occurs, such as a permissions error.
 */
export async function mkdir(path: string): Promise<void> {
  await Deno.mkdir(path);
}

/**
 * Creates a new directory at the given path, including any necessary parent directories.
 * @param path - The path where the directory should be created.
 * @returns A promise that resolves when the directory has been created.
 * @throws Will throw an error if an unexpected error occurs, such as a permissions error.
 */
export async function mkdirRecursive(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true });
}

/**
 * Removes a file or directory at the given path.
 * @param path - The path to the file or directory to remove.
 * @returns A promise that resolves when the file or directory has been removed.
 * @throws Will throw an error if an unexpected error occurs, such as a permissions error.
 */
export async function remove(path: string): Promise<void> {
  await Deno.remove(path);
}

/**
 * Removes a directory and its contents at the given path.
 * @param path - The path to the directory to remove.
 * @returns A promise that resolves when the directory and its contents have been removed.
 * @throws Will throw an error if an unexpected error occurs, such as a permissions error.
 */
export async function removeRecursive(path: string): Promise<void> {
  await Deno.remove(path, { recursive: true });
}

export async function readFile(filePath: string): Promise<Uint8Array> {
  return await Deno.readFile(filePath);
}

export async function readTextFile(filePath: string): Promise<string> {
  return await Deno.readTextFile(filePath);
}

export async function readJsonFile(filePath: string): Promise<JSONObject> {
  return JSON.parse(await readTextFile(filePath));
}

export async function readJsonFilesFromPath(
  filePath: string,
): Promise<JSONObject[]> {
  const result: JSONObject[] = [];
  const iterator = expandGlob(filePath);
  for await (const file of iterator) {
    const data = await readJsonFile(file.path);
    result.push(data);
  }
  return result;
}

export async function writeTextFile(
  filePath: string,
  content: string,
): Promise<void> {
  await Deno.writeTextFile(filePath, content);
}

export async function writeJsonFile(
  filePath: string,
  object: JSONObject,
): Promise<void> {
  return await writeTextFile(filePath, JSON.stringify(object));
}

export async function copy(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  await fsCopy(sourcePath, destinationPath);
}
