import fs from "fs";
import archiver from "archiver";
import { Injectable } from "@nestjs/common";
import AdmZip from "adm-zip";

@Injectable()
export class ArchiveService {
  async archive(
    dirpath: string,
    out: string,
    {
      level,
    }: {
      level: number;
    }
  ) {
    const output = fs.createWriteStream(out);
    const archivePipe = archiver("zip", {
      zlib: { level }, // Sets the compression level.
    });
    archivePipe.pipe(output);
    const awaiter = new Promise((success, reject) => {
      archivePipe.on("finish", () => {
        console.log("finish");
        success("");
      });
      archivePipe.on("error", (e) => {
        reject(e);
      });
    });
    await archivePipe.glob("**/*", { cwd: dirpath }).finalize();
    await awaiter;
  }

  async unzip(zippath: string, out: string, { force }: { force: boolean }) {
    const admZip = new AdmZip(zippath);
    admZip.extractAllTo(out, force);
  }
  private async archiveEntries(zipfiles: string[]) {
    const saveData = zipfiles
      .map((zippath) => {
        const admZip = new AdmZip(zippath);
        return admZip.getEntries().map((entry) => {
          return {
            entryPath: entry.entryName,
            data: entry.getData(),
          };
        });
      })
      .flat();
    return saveData;
  }

  async archiveUnified(
    zipfiles: string[],
    out: string,
    {
      level,
      force = false,
    }: {
      level: number;
      force: boolean;
    }
  ) {
    const saveData = await this.archiveEntries(zipfiles);
    const output = fs.createWriteStream(out);
    const archivePipe = archiver("zip", {
      zlib: { level }, // Sets the compression level.
    });
    archivePipe.pipe(output);
    const awaiter = new Promise((success, reject) => {
      archivePipe.on("finish", () => {
        console.log("finish");
        success("");
      });
      archivePipe.on("error", (e) => {
        reject(e);
      });
    });
    const cachePath: Record<string, boolean> = {};
    // NOTE: For after input is priotized.
    saveData.reverse();
    for await (const result of saveData) {
      if (cachePath[result.entryPath]) {
        const duplicatedMessage = `Duplicated files exist.(path: ${result.entryPath})`;
        if (force) {
          console.warn(duplicatedMessage);
          console.warn(
            "It will be overwrited after one inputed in the zip files."
          );
        } else {
          throw new Error(duplicatedMessage);
        }
      }
      cachePath[result.entryPath] = true;
      console.log(result.entryPath);
      archivePipe.append(result.data, {
        name: result.entryPath,
      });
    }
    await archivePipe.finalize();
    await awaiter;
    return saveData;
  }
}
