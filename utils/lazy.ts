import fs from "fs";
import path from "path";

export function lazyDir(dir: string, readSubDir = false): string[] {
    let dirs = [];
    let files = fs.readdirSync(dir);
    for(let file of files) {
        let stat = fs.lstatSync(path.join(dir, file));
        if(readSubDir && stat.isDirectory()) {
            dirs.push(...lazyDir(path.join(dir, file), readSubDir));
        } else {
            dirs.push(path.join(dir, file));
        }
    }
    return dirs;
}