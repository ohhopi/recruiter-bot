import { IDirty } from "../utils/dirtydb";

export class Party implements IDirty {

    id: string;
    title: string = null;
    description: string = null;
    date: Date = null;
    leader: { id: string, name: string } = null;
    coleader: { id: string, name: string } = null;
    dur: { min: number, max: number } = { min: 2, max: 3 };
    comp: { max: number, tank: number, healer: number, ranged: number, melee: number, caster: number, dps: number } = Party.COMPS.DRS1;
    allowed: string[] = [];
    members: { id: string, name: string, role: string }[] = [];
    forfeits: { id: string, name: string, role: string }[] = [];

    channelId: string = null;
    msgId: string = null;
    pw: string = undefined;

    lockouts: { start: Date, dur: number, roles: string[] } [] = [];

    public static readonly COMPS = {
        DRS1: { max: 48, tank: 12, healer: 12, ranged: 6, melee: 6, caster: 6, dps: 6  },
        DRS2: { max: 48, tank: 8 , healer: 12, ranged: 6, melee: 6, caster: 6, dps: 10 },
        DRN : { max: 24, tank: 1 , healer: 3 , ranged: 3, melee: 3, caster: 3, dps: 11 },
        P8  : { max: 8 , tank: 2 , healer: 2 , ranged: 0, melee: 0, caster: 0, dps: 4  },
        P24 : { max: 24, tank: 3 , healer: 6 , ranged: 0, melee: 0, caster: 0, dps: 15 },
    }

    public static reviver(key: any, val: any): any {
        if(typeof val === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(val)) {
            return new Date(val);
        }
        return val;
    }

}