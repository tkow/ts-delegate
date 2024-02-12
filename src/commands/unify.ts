import { Command, CommandRunner, Option } from "nest-commander";
import path from "path";
import fs from "fs";
import { ArchiveService } from "../services/archive.service";

type UnifyCommandOptions = {
  out: string;
  archive: number | null;
  force: boolean;
};

@Command({
  name: "unify",
  description: `unify zip files into a directory with mapping`,
  arguments: "<zipFiles...>",
  argsDescription: {
    "<zipFiles...>": "zip files are unified into a directory",
  },
})
export class UnifyCommand extends CommandRunner {
  constructor(private readonly archiveService: ArchiveService) {
    super();
  }

  async run(zipFiles: string[], options: UnifyCommandOptions) {
    const { force, archive, out } = options;
    const zipFilePaths = zipFiles.map((file) => {
      const filePath = file.startsWith("/")
        ? file
        : path.resolve(process.cwd(), file);
      if (!fs.statSync(filePath).isFile()) {
        throw new Error(
          `${filePath} doesn't exist. Please specify a zip files.`
        );
      }
      return filePath;
    });
    if (typeof archive !== "number") {
      await Promise.all(
        zipFilePaths.map((zipfile) => {
          return this.archiveService.unzip(zipfile, out, { force });
        })
      );
    } else {
      const outZip = !(out.endsWith(".zip") || out.endsWith(".epub"))
        ? `${out}.zip`
        : out;
      await this.archiveService.archiveUnified(zipFiles, outZip, {
        level: archive,
        force: force,
      });
    }
  }

  @Option({
    flags: "-o --out <out>",
    name: "out",
    description: "Output directory extartced to.",
    defaultValue: path.resolve(process.cwd(), "out"),
  })
  parseOut(arg: string): string {
    return arg;
  }

  @Option({
    flags: "-a --archive [archiveLevel]",
    name: "archiveLevel",
    description: "archive extracted files again.",
    defaultValue: null as any as number,
  })
  parseArchive(
    arg: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  ): number {
    return parseInt(arg, 10) ?? 9;
  }

  @Option({
    flags: "-f --force",
    name: "force",
    description:
      "force all zip files unified with overwriting duplicated files followed by one.",
    defaultValue: false,
  })
  forceFlag(): boolean {
    return true;
  }
}
