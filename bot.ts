import {Client, Guild, Message} from "discord.js";
import { Party } from "./party/party";
import { IMessageHandler, ITickHandler } from "./handlers/handler";
import { MS } from "./utils/time";
import { DirtyDB } from "./utils/dirtydb";
import { createPartyReactionHandler } from "./party/party-reactions";
import {Schedule} from "./party/schedule";

import path from "path";
import { Poll } from "./poll/poll";
import { createPollReactionHandler } from "./poll/poll-reactions";

export class Bot {

    client: Client;
    guild: Guild;
    parties: DirtyDB<Party>;
    polls: DirtyDB<Poll>;
    schedules: DirtyDB<Schedule>;

    tickHandlers: ITickHandler[] = [];
    msgHandlers: IMessageHandler[] = [];

    dataDir: string;

    constructor(client: Client) {
        this.client = client;
        this.dataDir = path.join(__dirname, "data");
        this.parties = new DirtyDB({ dir: path.join(this.dataDir, "parties"), reviver: Party.reviver });
        this.polls = new DirtyDB({ dir: path.join(this.dataDir, "polls"), reviver: Poll.reviver });
        this.schedules = new DirtyDB({ dir: path.join(this.dataDir, "schedules"), reviver: Schedule.reviver });
    }

    public fixPartyReactions() {
        for(const party of this.parties.all()) { createPartyReactionHandler(this, party); }
    }

    public fixPollReactions() {
        for(const poll of this.polls.all()) { createPollReactionHandler(this, poll); }
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