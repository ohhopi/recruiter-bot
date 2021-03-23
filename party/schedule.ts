import { IDirty } from "../utils/dirtydb";

export class Schedule implements IDirty {

    id: string;
    date: Date = null;
    channelId: string = null;
    msgId: string = null;

    public static reviver(key: any, val: any): any {
        if(typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(val)) {
            return new Date(val);
        }
        return val;
    }

}