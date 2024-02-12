import { CommandTestFactory } from "nest-commander-testing";
import { UnifyCommand } from "./unify";
import { ArchiveService } from "../services/archive.service";
import { TestingModule } from "@nestjs/testing";
import { Module } from "@nestjs/common";
import fs from "fs";

@Module({
  providers: [UnifyCommand, ArchiveService],
})
class TestModule {}

describe("unify.ts", () => {
  let commandInstance!: TestingModule;

  beforeEach(async () => {
    commandInstance = await CommandTestFactory.createTestingCommand({
      imports: [TestModule],
    }).compile();
  });

  describe("run success", () => {
    it("success", async () => {
      const outpath = "tmp/unified/normal";
      await CommandTestFactory.run(commandInstance, [
        "unify",
        "-o",
        outpath,
        "fixtures/zip-a-content.zip",
        "fixtures/zip-b-content.zip",
      ]);
      expect(fs.existsSync(outpath)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/a`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/a/1.txt`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/a/2.txt`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/b`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/b/1.txt`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/b/2.txt`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/c`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/c/dup.txt`)).toBeTruthy();
      expect(fs.readFileSync(`${outpath}/c/dup.txt`).toString()).toEqual("a\n");
    });
    it("success force", async () => {
      const outpath = "tmp/unified/force";
      await CommandTestFactory.run(commandInstance, [
        "unify",
        "-f",
        "-o",
        outpath,
        "fixtures/zip-a-content.zip",
        "fixtures/zip-b-content.zip",
      ]);
      expect(fs.existsSync(outpath)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/a`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/a/1.txt`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/a/2.txt`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/b`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/b/1.txt`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/b/2.txt`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/c`)).toBeTruthy();
      expect(fs.existsSync(`${outpath}/c/dup.txt`)).toBeTruthy();
      expect(fs.readFileSync(`${outpath}/c/dup.txt`).toString()).toEqual("b\n");
    });
    it("archive normal", async () => {
      const outpath = "tmp/unified/archive-f";
      const runPromise = CommandTestFactory.run(commandInstance, [
        "unify",
        "-a",
        "9",
        "-o",
        outpath,
        "fixtures/zip-a-content.zip",
        "fixtures/zip-b-content.zip",
      ]);
      expect(runPromise).rejects.toThrow();
    });
    it("archive force", async () => {
      const outpath = "tmp/unified/archive-f";
      await CommandTestFactory.run(commandInstance, [
        "unify",
        "-a",
        "9",
        "-f",
        "-o",
        outpath,
        "fixtures/zip-a-content.zip",
        "fixtures/zip-b-content.zip",
      ]);
      expect(fs.existsSync(`${outpath}.zip`)).toBeTruthy();
    });
  });
});
