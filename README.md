# petit-ts
typescript compiler in browser using filesystem on localStorage

# Usage

- You need [petit-fs](https://www.npmjs.com/package/petit-fs) to use virtual filesystem works in browser.
  - petit-fs stores files in localStorage but can also mount ram storage.
- The typescript library files(in `node_modules/typescript/lib/`) will be expanded to `/tmp/ts` in local virtual  filesystem. 
  - It exceeds 5MB, the quota limit of localStorage. Then you have to mount ram disk on `/tmp/` it 
- [Example in codePen](https://codepen.io/hoge1e3/pen/KwPWpMV)
~~~js
import {initTypescript} from "https://unpkg.com/petit-ts/dist/index.js";
import {fs, path, process, require} from "https://unpkg.com/petit-fs/dist/index.js";
// Mount RAM disk on /tmp/
fs.mountSync("/tmp/","ram");
// Expand typescript lib files to /tmp/ts/
const ts=initTypescript({fs, path, process, require});
// Test file
fs.writeFileSync("test.ts",`
const hoge = 'hoge' as any
const bar = 'bar'
const piyo = <any>'piyo'

function foo():string {
  return 'foo'
}`);
// Do compilation
compileFile({ts,fs,path}, "test.ts", "/tmp/out/");
// Check output js file
console.log(fs.readFileSync("tmp/out/test.js","utf-8"));

function compileFile({ts,fs,path}, filePath/*: string*/, outDir/*: string*/) {
  const options/*: ts.CompilerOptions*/ = {
    target: ts.ScriptTarget.ES2018,
    module: ts.ModuleKind.CommonJS,
    outDir: outDir,
    strict: true
  };
  // Create the program with a single file
  const program = ts.createProgram([filePath], options);
  // Compile
  const emitResult = program.emit();
  // Handle any diagnostics
  const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
  if (diagnostics.length > 0) {
    const formatHost/*: ts.FormatDiagnosticsHost*/ = {
      getCanonicalFileName: path => path,
      getCurrentDirectory: ts.sys.getCurrentDirectory,
      getNewLine: () => ts.sys.newLine
    };
    const errorMessage = ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost);
    console.error(errorMessage);
    console.log(diagnostics);
    if (emitResult.emitSkipped) {
      throw new Error('TypeScript compilation failed');
    }
  }
  console.log('File compilation successful!');
}
~~~

## build

To generate `dist/index.js`, run
~~~
npm install
npm run build
~~~