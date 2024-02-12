import { Module } from "@nestjs/common";
import { Services } from "./services";
import { Commands } from "./commands";

@Module({
  providers: [...Services, ...Commands],
})
export class CommandModule {}
