# @sjmeverett/zip-util

Thin wrapper around [archiver](https://npmjs.com/package/archiver) to output zip files, optionally with the file hash in the filename.

## Installation

```
npm install -S @sjmeverett/zip-util
```

## Usage

```js
import { createZip } from "@sjmeverett/zip-util";

await createZip(
  "myzip",
  (archive) => {
    archive.directory("source", "dest");
  },
  { destinationDir: "dest/dir", hash: true }
);
```

The callback function receives one argument, `archive`, which is an instance of [archiver](https://npmjs.com/package/archiver). It can return a promise if necessary, which will be awaited.
