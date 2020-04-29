import { createWriteStream, promises } from "fs";
import archiver from "archiver";
import { join } from "path";
import stream from "stream";
import crypto from "crypto";

export type ZipCallback = (archive: archiver.Archiver) => void | Promise<void>;

export interface CreateZipOptions {
  destinationDir?: string;
  hash?: boolean;
}

export async function createZip(
  name: string,
  callback: ZipCallback,
  options: CreateZipOptions = {}
) {
  const archive = archiver("zip", { zlib: { level: 9 } });
  await callback(archive);

  const destinationDir = options.destinationDir || process.cwd();
  const outstream = createWriteStream(join(destinationDir, `${name}.zip`));

  if (options.hash) {
    const hash = await new Promise<string>((resolve, reject) => {
      archive.on("error", reject);

      archive.pipe(makeHashStream(resolve)).pipe(outstream).on("error", reject);

      archive.finalize();
    });

    const zipFileName = `${name}-${hash}.zip`;

    await promises.rename(
      join(destinationDir, `${name}.zip`),
      join(destinationDir, zipFileName)
    );

    return zipFileName;
  } else {
    await new Promise((resolve, reject) => {
      archive.pipe(outstream).on("error", reject).on("finish", resolve);
      archive.finalize();
    });

    return `${name}.zip`;
  }
}

function makeHashStream(cb: (hash: string) => void): stream.Transform {
  const hash = crypto.createHash("sha1");

  const tx = new stream.Transform({
    transform: (chunk, _encoding, callback): void => {
      hash.update(chunk);
      callback(undefined, chunk);
    },
  });

  tx.once("end", () => {
    cb(hash.digest("hex"));
  });

  return tx;
}
