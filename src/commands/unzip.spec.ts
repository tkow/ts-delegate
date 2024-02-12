import { CommandTestFactory } from "nest-commander-testing";
import { UnzipCommand } from "./unzip";
import { TestingModule } from "@nestjs/testing";
import { ArchiveService } from "../services/archive.service";
import fs from "fs";
import { Module } from "@nestjs/common";

@Module({
  providers: [UnzipCommand, ArchiveService],
})
class TestModule {}

describe("unzip.ts", () => {
  let commandInstance!: TestingModule;

  beforeEach(async () => {
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [TestModule],
    }).compile();
  });

  describe("run success", () => {
    it("correct default values", async () => {
      const outpath = "tmp/zip-a-content";
      await CommandTestFactory.run(commandInstance, [
        "unzip",
        "-o",
        outpath,
        "fixtures/zip-a-content.zip",
      ]);
      expect(fs.existsSync(outpath)).toBeTruthy();
    });
  });
});
