/* eslint-disable no-irregular-whitespace */
import dotenv from "dotenv";
dotenv.config();

// Import Node.js Dependencies
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";


// Import Third-party Dependencies
import tap from "tap";
import splitByLine from "split2";
import stripAnsi from "strip-ansi";

// CONSTANTS
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kProcessDir = path.join(__dirname, "..", "process");

const expectedLines = `directory size:     2 KB
unique licenses:    MIT

   ext    files                                   minified files
   .js    index.js                                index.min.js
  .json   package.json

--------------------------------------------------------------------------------
                         Required dependency and files
--------------------------------------------------------------------------------

                                    index.js
--------------------------------------------------------------------------------
required stmt                      try/catch                     source location
node:os                              false                        [2:0] - [2:34]

--------------------------------------------------------------------------------
                                  AST Warnings
--------------------------------------------------------------------------------

file                                  kind                       source location
index.js                       suspicious-literal                  [4:1] - [4:8]

                               5.268656716417911
--------------------------------------------------------------------------------`.split("\n");

tap.test("should execute verify command", async(tape) => {
  tape.plan(expectedLines.length);

  const child = spawn(process.execPath, [path.join(kProcessDir, "verify.js")], {
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });
  tape.teardown(() => child.kill());

  const rStream = child.stdout.pipe(splitByLine());
  let i = 0;
  for await (const line of rStream) {
    const expectedLine = expectedLines[i++];
    tape.equal(stripAnsi(line).trimEnd(), expectedLine, `should be ${expectedLine}`);
  }

  tape.end();
});
