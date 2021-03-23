import {Client, Guild, Message} from "discord.js";
import { Party } from "./party/party";
import { IMessageHandler, ITickHandler } from "./handlers/handler";
import { MS } from "./utils/time";
import { DirtyDB } from "./utils/dirtydb";
import { createPartyReactionHandler } from "./party/party-reactions";
import {Schedule} from "./party/schedule";

import path from "path";

export class Bot {

    client: Client;
    guild: Guild;
    parties: DirtyDB<Party>;
    schedules: DirtyDB<Schedule>;

    tickHandlers: ITickHandler[] = [];
    msgHandlers: IMessageHandler[] = [];

    constructor(client: Client) {
        this.client = client;
        this.parties = new DirtyDB({ dir: path.join(__dirname, "data/parties"), reviver: Party.reviver });
        this.schedules = new DirtyDB({ dir: path.join(__dirname, "data/schedules"), reviver: Schedule.reviver });
    }

    public fixPartyReactions() {
        for(const party of this.parties.all()) { createPartyReactionHandler(this, party); }
    }

    public tick() {
        const now = new Date();
        const delay = 60 - now.getUTCSeconds();

        this.tickHandlers.forEach(handler => handler.handle(this, now));

        setTimeout(() => {  this.tick(); }, delay * MS);
    }

    public registerTickHandler(handler: ITickHandler) { this.tickHandlers.push(handler); }
    public registerMessageHandler(handler: IMessageHandler) { this.msgHandlers.push(handler); }

    public onMessage(message: Message) {
        if(message.author.bot) { return; }
        this.msgHandlers.forEach(handler => handler.handle(this, message));
    }

}