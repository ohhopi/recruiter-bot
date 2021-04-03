import { Bot } from "../bot";
import {GuildChannel, Message, MessageEmbed, Snowflake, User} from "discord.js";
import { Mutex } from "async-mutex";

import { MS, S } from "./time";

import { msgs, roles } from "../lib.json";
import { emojis, lRole } from "../guild.json";
import { Party } from "../party/party";

const WAIT = 5 * S * MS

export function dm(user: User, msg: string) {
    user.send(new MessageEmbed().setColor("GREEN").setDescription(msg)).then();
}

export function dmError(user: User, msg: string) {
    user.send(new MessageEmbed().setColor("RED").setDescription(msg)).then();
}

const dmLocks: Map<Snowflake, Mutex> = new Map<Snowflake, Mutex>();

export function getDmLock(user: User): Mutex {
    let dmLock = dmLocks.get(user.id);
    if(!dmLock) {
        dmLock = new Mutex();
        dmLocks.set(user.id, dmLock);
    }
    return dmLock;
}

export function askInDm(user: User, dm: string, validator: ((name: string) => boolean) = null) {
    const filter = (msg: Message) => {
        if(msg.author.id !== user.id) { return false; }
        if(msg.content.toLowerCase() !== "cancel" && validator !== null) {
            if(!validator(msg.content)) {
                msg.react(emojis.error).then();
                return false;
            }
        }
        return true;
    }
    return new Promise<string>((resolve, reject) => {
        user.send(new MessageEmbed().setColor("GREEN").setDescription(dm)).then(msg => {
            msg.channel.awaitMessages(filter, { max: 1, time: WAIT, errors: ["time"] }).then(collected => {
                const msg = collected.first();
                if(msg.content.toLowerCase() === "cancel") {
                    user.send(new MessageEmbed().setColor("RED").setDescription(msgs.cancel)).then();
                    reject();
                }
                resolve(msg.content);
            }).catch(() => {
                user.send(new MessageEmbed().setColor("RED").setDescription(msgs.timeout)).then();
                reject();
            });
        });
    });
}

export function islRole(bot: Bot): (inp: string) => boolean {
    return (inp: string): boolean => {
        if(inp.toLowerCase() === "none") { return true; }
        return  bot.guild.roles.cache.find(r => r.name.toLowerCase() === lRole)
            .members.some(m => m.displayName.toLowerCase().includes(inp.toLowerCase()));
    }
}

export function isDur(inp: string): boolean {
    let dur = inp.split(/\s+/);
    if(dur.length !== 2) { return false; }
    let min = parseInt(dur[0]);
    let max = parseInt(dur[1]);
    if(isNaN(min) || min < 1) { return false; }
    if(isNaN(max) || max < 1) { return false; }
    return max >= min;

}

export function isComp(inp: string): boolean {
    if(Party.COMPS[inp.toUpperCase()] !== undefined) { return true; }
    let comps = inp.split(/\s+/);
    if(comps.length !== 6) { return false; }
    for(let comp of comps) {
        let num = parseInt(comp, 10);
        if(isNaN(num) || num < 0) { return false; }
    }
    return true;
}

export function isPartyRole(inp: string): boolean {
    for(let role of inp) {
        if(roles.includes(role.toLowerCase())) { return false; }
    }
    return true;
}

export function isGuildRole(bot: Bot): (name: string) => boolean {
    return (inp: string): boolean => {
        let roles = inp.split(",").map(r => r.toLowerCase().trim());
        for(let role of roles) {
            if(!bot.guild.roles.cache.some(r => r.name.toLowerCase() === role)) { return false; }
        }
        return true;
    }
}

export function isChannel(bot: Bot): (name: string) => boolean {
    return (inp: string): boolean => {
        return bot.guild.channels.cache.some((c: GuildChannel) => { return c.name.toLowerCase() === inp.toLowerCase(); });
    }
}