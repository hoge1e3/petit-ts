import pNode from "../node_modules/petit-node/dist/index.js";
globalThis.pNode=pNode;
await pNode.boot({
    async init({FS}){
        FS.mount("/tmp/","ram");
        const tmp=FS.get("/tmp/");
        const r=await fetch("../dist/node_modules.zip");
        const a=await r.arrayBuffer()
        const zipn=tmp.rel("node_modules.zip");
        zipn.setBytes(a);
        await FS.zip.unzip(zipn, tmp,{v:1});
        /*let node=FS.get("/node/");
        loadFixture(node, fixture);
        if (aliases) {
            pNode.addAliases(aliases);
        }
        return node.rel("main.js");*/
    },
});

