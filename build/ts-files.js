import fs from "fs";
import ts from "typescript";
//import path from "path";
const tsHome="node_modules/typescript/lib";

const dst="/tmp/ts/";
const data={};
let tscont, tsfn;
for (let file of fs.readdirSync(tsHome)) {
    const ffile=tsHome+"/"+file;
    const stat=fs.statSync(ffile);
    if (stat.isDirectory()) continue;
    if (file==="_tsc.js") continue;
    let cont=fs.readFileSync(ffile,"utf-8");
    const dstf=dst+file;
    if (file==="typescript.js") {
        tscont=cont;
        tsfn=dstf;
        continue;
    }
    data[file]=cont+"\n//# sourceURL=file://"+dstf;
}
const indexjs=`
//---- BEGIN of typescript Original Licence block -------
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
//---- END of typescript Original Licence block -------
export function initTypescript({fs, path, process,require}) {
  const data=${JSON.stringify(data,null,2)};
  const dst=${JSON.stringify(dst)};
  for (let k in data) {
    fs.writeFileSync(path.join(dst,k), data[k]);
  }
  const __filename=${JSON.stringify(tsfn)};
  const __dirname=dst;
  ${tscont}
  return ts;
}
`;
fs.writeFileSync("dist/index.js",indexjs);