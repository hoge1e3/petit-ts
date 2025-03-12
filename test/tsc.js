import pNode from "../node_modules/petit-node/dist/index.js";
globalThis.pNode=pNode;
await pNode.boot({
    async init({FS}){
        async function unzip(zipurl,dst) {
            const r=await fetch(zipurl);
            const a=await r.arrayBuffer()
            const zipn=tmp.rel(zipurl.replace(/[^\w\d]/g,"_")+".zip");
            zipn.setBytes(a);
            await FS.zip.unzip(zipn, dst,{v:1});
        }
        FS.mount("/tmp/","ram");
        const tmp=FS.get("/tmp/");
        await unzip("../dist/node_modules.zip", tmp.rel("node_modules/"));
        await unzip("samples.zip", tmp.rel("node_modules/samples/"));
        const samples=tmp.rel("node_modules/samples");
        const compileTS=samples.rel("compileTS.js");
        const {compileProject}=await pNode.import(compileTS);
        const ngram=samples.rel("node_modules/@hoge1e3/ngram");
        const compres=await compileProject(ngram);
        console.log("compres", ngram.name(), compres);
        /*let node=FS.get("/node/");
        loadFixture(node, fixture);
        if (aliases) {
            pNode.addAliases(aliases);
        }
        return node.rel("main.js");*/
    },
});

