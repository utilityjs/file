import type {JSONObject} from "@utility/types";
import {copy as fsCopy, expandGlob} from "@std/fs";
import * as path from "@std/path";

/**
 * Checks if a file or directory exists at the given path.
 *
 * This is a small wrapper around `Deno.stat` that returns `true` when the
 * path exists and `false` when the path does not exist. Other errors (for
 * example permission errors) are re-thrown so callers can decide how to
 * handle them.
 *
 * @param path - The path or URL to test for existence.
 * @returns Promise<boolean> - resolves to `true` if the path exists, `false`
 *   if it does not.
 * @throws Any non-NotFound Deno error (e.g. permission errors).
 * @example
 * const found = await exists('./some/file.txt');
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
 * Create a single directory (non-recursive).
 *
 * A simple wrapper for `Deno.mkdir(path)`. Use `mkdirRecursive` when parent
 * directories may not exist.
 *
 * @param path - Directory path to create.
 * @returns Promise<void> - resolves when the directory has been created.
 * @throws Deno errors on failure (e.g. AlreadyExists, PermissionDenied).
 */
export async function mkdir(path: string): Promise<void> {
  await Deno.mkdir(path);
}

/**
 * Create a directory and any missing parents.
 *
 * Equivalent to `mkdir -p` on UNIX. Uses `Deno.mkdir(..., { recursive: true })`.
 *
 * @param path - Directory path to create (parents will be created as needed).
 * @returns Promise<void> - resolves when the directory (and parents) exist.
 * @throws Deno errors on failure (e.g. PermissionDenied).
 */
export async function mkdirRecursive(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true });
}

/**
 * Remove a file or empty directory.
 *
 * Wrapper around `Deno.remove`. If the path points to a non-empty directory
 * use `removeRecursive`.
 *
 * @param path - Path to the file or (empty) directory to remove.
 * @returns Promise<void> - resolves when the target has been removed.
 * @throws Deno errors on failure (e.g. NotFound, PermissionDenied).
 */
export async function remove(path: string): Promise<void> {
  await Deno.remove(path);
}

/**
 * Remove a directory and all of its contents recursively.
 *
 * This will recursively delete files and sub-directories under the given
 * path. Use with caution.
 *
 * @param path - Path to the directory to recursively remove.
 * @returns Promise<void> - resolves when the directory tree has been removed.
 * @throws Deno errors on failure (e.g. NotFound, PermissionDenied).
 */
export async function removeRecursive(path: string): Promise<void> {
  await Deno.remove(path, { recursive: true });
}

/**
 * Read a file as raw bytes.
 *
 * Thin wrapper around `Deno.readFile` that returns the file contents as a
 * `Uint8Array`.
 *
 * @param filePath - Path to the file to read.
 * @returns Promise<Uint8Array> - resolves with the file bytes.
 * @throws Deno errors on failure (e.g. NotFound, PermissionDenied).
 */
export async function readFile(filePath: string): Promise<Uint8Array> {
  return await Deno.readFile(filePath);
}

/**
 * Read a file as text (UTF-8 by default).
 *
 * Wrapper around `Deno.readTextFile` which reads the entire file and returns
 * a string.
 *
 * @param filePath - Path to the file to read.
 * @returns Promise<string> - resolves with the file contents as a string.
 * @throws Deno errors on failure (e.g. NotFound, PermissionDenied).
 */
export async function readTextFile(filePath: string): Promise<string> {
  return await Deno.readTextFile(filePath);
}

/**
 * Read a JSON file and parse it to an object.
 *
 * Reads the file as text and then runs `JSON.parse`. The returned type is
 * `JSONObject` (as imported from `@utility/types`). If the file contents are
 * not valid JSON the call will reject with a SyntaxError.
 *
 * @param filePath - Path to the JSON file to read and parse.
 * @returns Promise<JSONObject> - resolves with the parsed object.
 * @throws SyntaxError when the file is not valid JSON, or Deno errors from
 *   reading the file.
 * @example
 * const cfg = await readJsonFile('./config.json');
 */
export async function readJsonFile(filePath: string): Promise<JSONObject> {
  return JSON.parse(await readTextFile(filePath));
}

/**
 * Read multiple JSON files matched by a glob pattern.
 *
 * Uses `expandGlob` from `std/fs` to iterate matches for `filePath`. Files are parsed using
 * `readJsonFile` and returned in the iteration order from `expandGlob`.
 *
 * @param filePath - Glob or path pattern matching one or more JSON files.
 * @returns Promise<JSONObject[]> - resolves with an array of parsed objects.
 * @throws Any errors thrown by `readJsonFile` or filesystem iteration.
 */
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

/**
 * Write text to a file, replacing existing contents.
 *
 * Wrapper around `Deno.writeTextFile`.
 *
 * @param filePath - Destination file path.
 * @param content - Text content to write.
 * @returns Promise<void> - resolves when the file has been written.
 * @throws Deno errors on failure (e.g. PermissionDenied, NotFound for parent).
 */
export async function writeTextFile(
  filePath: string,
  content: string,
): Promise<void> {
  await Deno.writeTextFile(filePath, content);
}

/**
 * Write text to a file and ensure the file is created if it doesn't exist.
 *
 * This passes the `{ create: true }` option to `Deno.writeTextFile` which
 * will create the file if necessary. Note: this will not create parent
 * directories; use `mkdirRecursive` beforehand if needed.
 *
 * @param filePath - Destination file path.
 * @param content - Text content to write.
 * @returns Promise<void> - resolves when the file has been written.
 */
export async function writeTextFileRecursive(
  filePath: string,
  content: string,
): Promise<void> {
  await Deno.writeTextFile(filePath, content, { create: true });
}

/**
 * Write an object as JSON to a file.
 *
 * Serializes `object` with `JSON.stringify` and writes it using
 * `writeTextFile`. Note this will not pretty-print; callers that require
 * readable JSON should call `JSON.stringify(obj, null, 2)` before passing the
 * value or modify this helper.
 *
 * @param filePath - Destination file path.
 * @param object - The object to serialize and write.
 * @returns Promise<void> - resolves when the file has been written.
 */
export async function writeJsonFile(
  filePath: string,
  object: JSONObject,
): Promise<void> {
  return await writeTextFile(filePath, JSON.stringify(object));
}

/**
 * Copy files or directories from source to destination.
 *
 * This delegates to `std/fs.copy`. The semantics follow the std library
 * implementation (it can copy both files and directories).
 *
 * @param sourcePath - Path to the source file or directory.
 * @param destinationPath - Path to the destination file or directory.
 * @returns Promise<void> - resolves when the copy has completed.
 * @throws Errors from std/fs.copy on failure.
 */
export async function copy(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  await fsCopy(sourcePath, destinationPath);
}

/**
 * Unzip a zip archive into a destination directory.
 *
 * This helper runs the platform-appropriate unzip command. On Windows it
 * invokes PowerShell's `Expand-Archive`; on other platforms it runs the
 * system `unzip` command. The function returns `true` when the external
 * command exits successfully.
 *
 * Note: this relies on the underlying platform command being available and
 * may require appropriate permissions. It does not currently provide a way
 * to capture or surface stdout/stderr beyond returning the exit status.
 *
 * @param zipSourcePath - Path to the .zip archive to extract.
 * @param destinationPath - Destination directory where contents will be
 *   extracted.
 * @returns Promise<boolean> - resolves to `true` when the extraction command
 *   reported success.
 * @throws Deno.Command errors if the external command cannot be started.
 */
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

/**
 * Download a zip file from a URL and extract it into `destinationPath`.
 *
 * This will create `destinationPath` if it does not already exist, download
 * the archive to a temporary file inside that directory, run `unZip` to
 * extract it, then remove the temporary archive file.
 *
 * @param downloadUrl - URL pointing to the zip archive to download.
 * @param destinationPath - Path where the archive contents should be
 *   extracted.
 * @returns Promise<void> - resolves when extraction is complete.
 * @throws Network errors, Deno errors and any errors from `unZip`.
 */
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

/**
 * Internal helper: download a URL to a temporary .zip file inside
 * `destinationPath` and return the temp file path.
 *
 * @internal
 * @param downloadUrl - URL to download.
 * @param destinationPath - Directory where the temporary file will be
 *   created.
 * @returns Promise<string> - resolves with the temp file path.
 * @throws Error if the HTTP response body is null or network errors occur.
 */
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
