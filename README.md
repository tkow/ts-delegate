## Zippee

A simple zip command utility writing nodejs.

### Install

```shell
npm i -g zippee
```

### Usage

## unify

Extract multiple zip files to a directory or archive them to a zip with merging directories and files keeping the structure.

```shell
zippee unify [-f] [-a (archive-level: [0~9])] -o someoutdir a.zip b.zip c.zip
```

If you have duplicated files in them, throw errors normally. You can ignore it with -f,--force flag, and later input files overwrite previous ones.

The -a,--archive flags can input number value, and if you specify it this archive them with integrated to a zip files.

## unzip

```shell
zippee unzip [-f] [-o someoutdir] a.zip
```

This command unzip a zip file and extract all files to a directory. If you don't specify -o,--output flag, it uses the name of the directory running process omitting extension. If you specify -f,force flag, you can extract all of the files to a specified directory, but it can't overwrite existed files in the directory.

## archive

```shell
zippee archive [-f] [-a (archive-level: [0~9])] [-o a.zip] a
```

This command unzip a zip file and extract all files to a directory. If you don't specify -o,--output flag, it uses the name of the directory running process with ".zip" extension. If you specify -f,force, you can overwrite the file specified and ignore checking extension.

