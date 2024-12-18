

export function compileProject({ts,fs,path}, projectPath/*:string*/, outDir/*:string*/) {
  
  // Ensure output directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Read configuration from tsconfig.json
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

  // Create the compiler host
  const compilerHost = ts.createCompilerHost(parsedConfig.options);

  // Modify the writeFile method to write to the specified output directory
  const originalWriteFile = compilerHost.writeFile;
  compilerHost.writeFile = (fileName, contents, writeByteOrderMark, onError, sourceFiles) => {
    const relativePath = path.relative(projectPath, fileName);
    const outputPath = path.join(outDir, relativePath);
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the file
    originalWriteFile(outputPath, contents, writeByteOrderMark, onError, sourceFiles);
  };

  // Create the program
  const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options, compilerHost);

  // Compile
  const emitResult = program.emit();

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
}

  /**
   * Compile a single TypeScript file
   * @param filePath - Path to the TypeScript file
   * @param outDir - Output directory for the compiled JavaScript file
   */
export function compileFile({ts,fs,path}, filePath/*: string*/, outDir/*: string*/) {
  
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

