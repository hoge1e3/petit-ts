import fs from "fs";
import ts from "typescript";
//import path from "path";
const tsHome="node_modules/typescript/lib";

function conv(cont, fn,dir) {
    return `/*process,require*/        
const __filename=${JSON.stringify(fn)};
const __dirname=${JSON.stringify(dir)};
${cont}
return ts;
`;
}
const dst="/tmp/ts/";
const data={};
for (let file of fs.readdirSync(tsHome)) {
    const ffile=tsHome+"/"+file;
    const stat=fs.statSync(ffile);
    if (stat.isDirectory()) continue;
    if (file==="_tsc.js") continue;
    let cont=fs.readFileSync(ffile,"utf-8");
    const dstf=dst+file;
    if (file==="typescript.js") {
        cont=conv(cont, dstf,tsHome);
    }
    data[file]=cont+"\n//# sourceURL=file://"+dstf;
}
const putFile=`
export function initTypescript({fs, path, process,require}) {
    const data=${JSON.stringify(data)};
    const dst=${JSON.stringify(dst)};
    for (let k in data) {
        fs.writeFileSync(path.join(dst,k), data[k]);
    }
    const tsf=new Function("process","require",
        fs.readFileSync(path.join(dst,"typescript.js"),"utf-8"));
    return tsf(process,require);
}
`;
fs.writeFileSync("dist/index.js",putFile);