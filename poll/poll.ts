import { IDirty } from "../utils/dirtydb";

export class Poll implements IDirty {

    id: string;
    title: string = null;
    description: string = null;
    date: Date = null;
    answers: string[] = [];
    allowed: string[] = [];
    creator: { id: string, name: string } = null;
    voters: { id: string, name: string, answer: string }[] = [];

    channelId: string = null;
    msgId: string = null;

    lockouts: { start: Date, dur: number, roles: string[] } [] = [];

    public static reviver(key: any, val: any): any {
        if(typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(val)) {
            return new Date(val);
        }
        return val;
    }

}