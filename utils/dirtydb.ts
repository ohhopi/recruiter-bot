import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { MS, S } from "./time";

export class DirtyDB<T extends IDirty> {
    private readonly dir: string;
    private readonly reviver: (key: any, cal: any) => any;
    private readonly replacer: (key: any, cal: any) => any;
    private entries: { data: any, hash: string, delete: boolean }[] = [];

    constructor(options: { dir: string, replacer?: (key: any, cal: any) => any, reviver?: (key: any, cal: any) => any}) {
        this.dir = options.dir;
        this.reviver = options.reviver;
        this.replacer = options.replacer;
        initDir(this.dir);
        fs.readdirSync(this.dir).forEach(file => {
            let data = JSON.parse(fs.readFileSync(path.join(this.dir, file), "utf8"), this.reviver);
            this.entries.push({ data: data, hash: ohash(data), delete: false });
        });
    }

    public all(): T[] { return this.entries.filter(entry => !entry.delete).map(entry => entry.data); }

    public upsert(data: T) {
        if(data.id === undefined || data.id === null) { data.id = genId(); }
        let entry = this.entries.find(entry => entry.data.id === data.id);
        if(entry) {
            entry.data = data;
            entry.hash = ohash(data);
        } else {
            this.entries.push({ data: data, hash: ohash(data), delete: false });
        }
        this._write(data);
    }

    public delete(data: T) {
        let entry = this.entries.find(entry => entry.data.id === data.id);
        if(entry) { entry.delete = true; }
    }

    private _write(data: T) {
        fs.writeFileSync(path.join(this.dir, `${data.id}.json`), JSON.stringify(data, this.replacer, 2));
    }

    private _delete(data: T) { fs.unlinkSync(path.join(this.dir, `${data.id}.json`)); }

    public persist() {
        let del = this.entries.filter(entry => entry.delete);
        for(let entry of del) { this._delete(entry.data); }
        this.entries = this.entries.filter(entry => !entry.delete);

        for(let entry of this.entries) {
            let hash = ohash(entry.data);
            if(hash !== entry.hash) {
                this._write(entry.data);
                entry.hash = hash;
            }
        }
    }

}

export interface IDirty { id: string; }

function shash(str: string) { return createHash("md5").update(str).digest("hex"); }

function ohash(obj: any) { return shash(JSON.stringify(obj)); }

function initDir(path: string) {
    if(!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
    }
}

export function genId(): string {
    const now = new Date()
    const utcSinceEpoch = now.getTime() + (now.getTimezoneOffset() * S * MS)
    return Math.round(utcSinceEpoch / MS).toString();
}