import {JSONObject} from "@utility/types";
import {copy as fsCopy, expandGlob} from "@std/fs";
import * as path from "@std/path";

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

export async function writeTextFileRecursive(
  filePath: string,
  content: string,
): Promise<void> {
  await Deno.writeTextFile(filePath, content, { create: true });
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

export async function unZip(
  zipSourcePath: string,
  destinationPath: string,
): Promise<boolean> {
  let unzipCommandProcess;
  if (Deno.build.os === "windows") {
    unzipCommandProcess = new Deno.Command("PowerShell", {
      args: [
        "Expand-Archive",
        "-Path",
        zipSourcePath,
        "-DestinationPath",
        destinationPath,
      ],
      // You might want to pipe stdout/stderr if you need to capture output
      stdout: "piped",
      stderr: "piped",
    });
  } else {
    unzipCommandProcess = new Deno.Command("unzip", {
      args: [zipSourcePath, "-d", destinationPath],
      stdout: "piped",
      stderr: "piped",
    });
  }

  const output = await unzipCommandProcess.output();

  return output.success;
}


export async function unZipFromURL(downloadUrl: URL, destinationPath: string) {
  if (!await exists(destinationPath)) {
    await mkdirRecursive(destinationPath);
  }

  const tempFilePath = await __downloadFileToTemp(
    downloadUrl,
    destinationPath
  );

  await unZip(tempFilePath, destinationPath);

  // remove the temp file
  await Deno.remove(tempFilePath);
}

async function __downloadFileToTemp(downloadUrl: URL, destinationPath: string) {
  const response = await fetch(downloadUrl.href);

  if (!response.body) {
    throw new Error("Response body is null");
  }

  const tempFilePath = path.join(destinationPath, "_temp_.zip");

  const file = await Deno.open(tempFilePath, { write: true, create: true });
  await response.body.pipeTo(file.writable);
  console.log(`File successfully downloaded to ${destinationPath}`);

  return tempFilePath;
}
