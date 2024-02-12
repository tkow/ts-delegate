import { CommandFactory } from "nest-commander";
import { CommandModule } from "./command.module";

export async function run() {
  await CommandFactory.run(CommandModule, {
    cliName: "zippee",
    logger: ["warn", "error"],
  });
}

export { CommandModule };
