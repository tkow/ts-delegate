import { Command, CommandRunner, Option } from "nest-commander";
import path from "path";
import fs from "fs";
import { ArchiveService } from "../services/archive.service";

type UnzipCommandOptions = {
  out: string;
  force: boolean;
};

@Command({
  name: "unzip",
  description: `unzip files and make them expanded to a zip`,
  arguments: "<dir>",
  argsDescription: {
    "<dir>": "files in a directory are unified into a zip",
  },
})
export class UnzipCommand extends CommandRunner {
  constructor(private readonly archiveService: ArchiveService) {
    super();
  }

  async run(args: string[], options?: UnzipCommandOptions) {
    const [dir] = args;
    const { force = false, out: _out } = options || {};
    const out = _out
      ? _out
      : path.resolve(process.cwd(), args[0].replace(/\.(zip|epub)/, ""));
    const zippath = dir.startsWith("/")
      ? dir
      : path.resolve(process.cwd(), dir);
    if (!fs.existsSync(zippath)) {
      throw new Error("Please specify a zip file.");
    }
    if (!force) {
      if (fs.existsSync(out)) {
        throw new Error(
          `${out} is existed. If you want to continue, run with -f,force flag.`
        );
      }
    }
    const outDir = path.dirname(out);
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, {
        recursive: true,
      });
    }
    await this.archiveService.unzip(zippath, out, { force });
  }

  @Option({
    flags: "-o --out <out>",
    name: "out",
    description: "Output directory extartced to.",
    defaultValue: "",
  })
  parseOut(arg: string): string {
    return arg;
  }
  @Option({
    flags: "-f --force",
    name: "force",
    description: "force create zip files skipping validation.",
    defaultValue: false,
  })
  forceFlag(): boolean {
    return true;
  }
}
