#!run

import { getNodeFS, SFile } from "@hoge1e3/sfile";
import ug from "uglify-js";

export async function main(){
    const FS=await getNodeFS();
    const home=FS.get("./");
    const types=["@types/node","undici-types"];
    const src=home.rel("node_modules");
    const dst=home.rel("dist/node_modules");
    for (let type of types) {
        for(let f of src.rel(type).recursive()){
            console.log(f.path());
            let str=read(f);
            dst.rel(f.relPath(src)).text(str);
        }
    }
    const typescript=src.rel("typescript");
    //const ex={"_tsc.js":1, "_tsserver.js"}
    for(let f of typescript.recursive()){
        if (f.up().up().name()==="lib") continue;
        if (f.name().startsWith("_")) continue  ;
        console.log(f.path());
        let str=read(f);
        dst.rel(f.relPath(src)).text(str);
    }
}
function read(f) {
    let str=f.text();
    if (f.endsWith(".js")) {
        return ug.minify(str).code;
    }
    if (f.endsWith(".ts")){
        return removeComment(str);
    }
    if (f.endsWith(".json")) {
        return JSON.stringify(JSON.parse(str));
    }
    return str;
}
main();
function removeComment(jssrc) {
    // Remove /* ... */ multi-line comments
    // Remove // single-line comments
    return jssrc.replace(/\/\*[^!]([^*]|\*+[^/])*\*+\//g, '') // Multi-line comments(Except license block)
                .replace(/\/\/[^\n\r]*/g, '')// Single-line comments
                .replace(/\n(\s*\n)+/g, '\n');    //Empty lines
}
    