#!run
import {require} from "petit-node";
import * as fs from "fs";
import * as path from "path";
const ts=require("typescript","/tmp/node_modules/");
export function main(dir=".") {
    //console.log(ts);
    return compileProject(this.resolve(dir));
}
export function compileProject(prj) {
    return compileProjectF({ts,fs,path},prj.path());
}
function compileProjectF({ts,fs,path}, projectPath/*:string*/) {
  // Read configuration from tsconfig.json
  process.chdir(projectPath);
  console.log("cwd", process.cwd());
  const configPath = ts.findConfigFile(projectPath, ts.sys.fileExists, 'tsconfig.json');
  if (!configPath) {
    throw new Error('Could not find tsconfig.json');
  }

  // Parse the configuration
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config, 
    ts.sys, 
    path.dirname(configPath)
  );
  console.log("conf",parsedConfig);
  const compilerHost = ts.createCompilerHost(parsedConfig.options);
  // Create the program
  const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options, compilerHost);

  // Compile
  const emitResult = program.emit();
  console.log("emitResult",emitResult);
  // Handle compilation errors
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
    // Optionally throw an error if you want compilation to fail on any diagnostic
    if (emitResult.emitSkipped) {
      throw new Error('TypeScript compilation failed');
    }
  }

  console.log('Compilation successful!');
  return diagnostics;
}

