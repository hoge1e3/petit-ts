#!run

import { getNodeFS, SFile } from "@hoge1e3/sfile";
import ug from "uglify-js";
import {zip} from "./zip.js";

export async function main(){
    const FS=await getNodeFS();
    const home=FS.get("./");
    const types=[
        "@types/node","undici-types",
        "petit-node",
        "@hoge1e3/fs2", "@hoge1e3/sfile",
        "jszip","@types/espree","@types/file-saver",
        "acorn","eslint-visitor-keys",
    ];
    const src=home.rel("node_modules");
    const dst=home.rel("dist/node_modules");
    dst.rm({r:true});
    for (let type of types) {
        for(let f of src.rel(type).recursive()){
            if (f.endsWith(".js")) continue;
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
    const nodezip=dst.sibling("node_modules.zip");
    await zip.zip(dst, nodezip );
    const test=home.rel("test/");
    const samples=test.rel("samples/");
    await zip.zip(samples, samples.sibling("samples.zip") );
    

}
function read(f) {
    let str=f.text();
    if (f.endsWith(".js")) {
        return ug.minify(str).code;
    }
    if (f.endsWith(".ts")){
        return removeComment(str);
    }
    if (f.endsWith(".json") && f.name()!=="tsconfig.json") {
        return JSON.stringify(JSON.parse(str));
    }
    return str;
}
main();
function removeComment(jssrc) {
    // Remove /* ... */ multi-line comments
    // Remove // single-line comments
    return mask(jssrc, 
        /(\/\/\/[^\n\r]*\n)|("([^\n\\"]|\\[^\n])*")|('([^\n\\']|\\[^\n])*')/g, ()=>""+Math.random(), 
        (jssrc)=>
            jssrc.replace(/\/\*[^!]([^*]|\*+[^/])*\*+\//g, '') // Multi-line comments(Except license block)
                .replace(/\/\/[^\n\r]*\n/g, '\n')// Single-line comments(Except ///<reference...>)
                .replace(/\n(\s*\n)+/g, '\n')                   //Empty lines
    );    
}
function mask(s, maskreg, maskgen, replacer) {
    const map=new Map();
    s=s.replace(maskreg, (s)=>{
        const key=maskgen();
        map.set(key,s);
        return key;
    });
    //console.log(map);
    s=replacer(s);
    for (let [k,v] of map){
        s=s.replace(k,()=>v);
    }
    return s;
}
    