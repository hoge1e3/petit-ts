import { SFile, Content } from "@hoge1e3/sfile";
import { saveAs } from "file-saver";
import JSZip from "jszip";
export class zip {
    static async zip(dir, a, b) {
        let dstZip;
        let options = {};
        if (SFile.is(a)) {
            dstZip = a;
        }
        else if (typeof a === "object") {
            options = a;
        }
        if (b)
            options = b;
        const jszip = new JSZip();
        function getTimestamp(f) {
            return new Date(f.lastUpdate() - new Date().getTimezoneOffset() * 60 * 1000);
        }
        async function loop(dst, dir) {
            for (let f of dir.listFiles({ ...options, cache: true })) {
                if (options.progress) {
                    await options.progress(f);
                }
                if (f.isDir()) {
                    const sf = dst.folder(f.name().replace(/[\/\\]$/, "")); /*, {
                        date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000)
                    });*/
                    if (!sf)
                        throw new Error(`${dir} create zip failed.`);
                    await loop(sf, f);
                }
                else {
                    const c = f.getContent();
                    dst.file(f.name(), c.toArrayBuffer(), {
                        date: getTimestamp(f)
                    });
                }
            }
        }
        await loop(jszip, dir);
        const content = await jszip.generateAsync({
            type: "arraybuffer",
            compression: "DEFLATE"
        });
        if (dstZip) {
            if (dstZip.isDir()) {
                throw new Error(`zip: destination zip file ${dstZip.path()} is a directory.`);
            }
            dstZip.setBytes(content);
        }
        else {
            saveAs(new Blob([content], { type: "application/zip" }), dir.name().replace(/[\/\\]$/, "") + ".zip");
        }
    }
    static async unzip(source, destDir, options = {}) {
        const status = {};
        let arrayBuf;
        if (SFile.is(source)) {
            const c = source.getContent();
            arrayBuf = c.toArrayBuffer();
        }
        else {
            arrayBuf = source;
        }
        if (!options.onCheckFile) {
            options.onCheckFile = (f) => {
                if (options.overwrite) {
                    return f;
                }
                else {
                    if (f.exists()) {
                        return false;
                    }
                    return f;
                }
            };
        }
        //console.log(JSZip);
        const jszip = new JSZip();
        await jszip.loadAsync(arrayBuf);
        for (let key of Object.keys(jszip.files)) {
            const zipEntry = jszip.files[key];
            const buf = await zipEntry.async("arraybuffer");
            let dest = destDir.rel(zipEntry.name);
            if (options.progress) {
                await options.progress(dest);
            }
            if (options.v) {
                console.log("Inflating", zipEntry.name, zipEntry);
            }
            if (dest.isDirPath())
                continue;
            const c = Content.bin(buf, dest.contentType());
            const res = options.onCheckFile(dest, c);
            if (res === false) {
                status[dest.path()] = {
                    file: dest,
                    status: "canceled",
                };
                ;
                dest = null;
            }
            else if (SFile.is(res) && dest.path() !== res.path()) {
                status[dest.path()] = {
                    file: dest,
                    status: "uploaded",
                    redirectedTo: res,
                };
                dest = res;
            }
            else {
                status[dest.path()] = {
                    file: dest,
                    status: "uploaded",
                };
            }
            if (dest) {
                dest.setContent(c);
                dest.setMetaInfo({ lastUpdate: zipEntry.date.getTime() + new Date().getTimezoneOffset() * 60 * 1000 });
            }
        }
        if (options.v)
            console.log("unzip done", status);
        return status;
    }
}
//# sourceMappingURL=zip.js.map