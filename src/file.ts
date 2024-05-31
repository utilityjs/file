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

export async function mkdir(filePath: string): Promise<void> {
  await Deno.mkdir(filePath);
}

export async function mkdirRecursive(filePath: string): Promise<void> {
  await Deno.mkdir(filePath, { recursive: true });
}

export async function remove(path: string): Promise<void> {
  await Deno.remove(path);
}

export async function removeRecursive(path: string): Promise<void> {
  await Deno.remove(path, { recursive: true });
}
